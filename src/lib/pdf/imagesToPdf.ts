import { PDFDocument, PDFPage, rgb } from "@cantoo/pdf-lib";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type PageSizeId = "original" | "a4" | "letter" | "legal";

export type OrientationId = "auto" | "portrait" | "landscape";

export type PageMarginId = "none" | "small" | "medium" | "large";

export type ImageFitId = "contain" | "cover" | "stretch";

export type BackgroundId = "white" | "transparent";

/** A single image as it appears in the PDF (after optional rotation). */
export type ImageItem = {
  id: string;
  file: File;
  /** Rotation applied by the user, in degrees (multiple of 90). */
  rotation: number;
};

export type ImagesToPdfOptions = {
  pageSize: PageSizeId;
  orientation: OrientationId;
  margin: PageMarginId;
  fit: ImageFitId;
  background: BackgroundId;
};

/* ------------------------------------------------------------------ */
/* Constants — single source of truth for settings                    */
/* ------------------------------------------------------------------ */

/** Standard page sizes in points. Letter = 612x792, Legal = 612x1008. */
export const PAGE_SIZES: Record<
  Exclude<PageSizeId, "original">,
  { width: number; height: number }
> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

/** Margin presets in points. */
export const PAGE_MARGINS: Record<PageMarginId, number> = {
  none: 0,
  small: 18,
  medium: 36,
  large: 54,
};

/** Accepted image MIME types and their display names. */
export const SUPPORTED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/bmp": "BMP",
  "image/gif": "GIF",
};

/**
 * Return true if the file can be used by this tool. Accepts both an
 * explicit MIME type and a filename extension fallback (some browsers
 * report an empty/generic type for certain formats).
 */
export function isSupportedImage(file: File): boolean {
  if (file.type && file.type in SUPPORTED_IMAGE_TYPES) return true;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"].includes(
    `.${ext}`
  );
}

/* ------------------------------------------------------------------ */
/* Image loading                                                      */
/* ------------------------------------------------------------------ */

/**
 * Create an object URL for an image file. The returned string is used both
 * for thumbnails and for loading the image element. The caller MUST revoke
 * it with `URL.revokeObjectURL` when the image is removed to avoid memory
 * leaks in long sessions.
 */
export function createImageObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Load an image element from an existing object URL (created by
 * `createImageObjectUrl`). Resolves once the image has finished loading so
 * `naturalWidth` / `naturalHeight` are populated.
 */
export function loadImageElement(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error("Image could not be loaded"));
    };
    image.src = objectUrl;
  });
}

/**
 * Render an image onto a canvas with the given rotation applied. The
 * resulting canvas is sized to the rotated bounding box so the output is
 * never cropped. Returns a PNG Blob.
 */
export function renderImageToPng(
  source: HTMLImageElement,
  rotation: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const sourceWidth = source.naturalWidth;
    const sourceHeight = source.naturalHeight;
    if (!sourceWidth || !sourceHeight) {
      reject(new Error("Image could not be decoded"));
      return;
    }

    const normalized = ((rotation % 360) + 360) % 360;
    const swap = normalized === 90 || normalized === 270;
    const canvasWidth = swap ? sourceHeight : sourceWidth;
    const canvasHeight = swap ? sourceWidth : sourceHeight;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas 2D context is not available."));
      return;
    }

    // Translate to the center, rotate, then draw the source so it is
    // centered and rotated without clipping.
    context.translate(canvasWidth / 2, canvasHeight / 2);
    context.rotate((normalized * Math.PI) / 180);
    context.drawImage(
      source,
      -sourceWidth / 2,
      -sourceHeight / 2
    );

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image could not be converted to PNG."));
      },
      "image/png"
    );
  });
}

/* ------------------------------------------------------------------ */
/* Page size resolution                                               */
/* ------------------------------------------------------------------ */

/**
 * Return the pixel dimensions of an image after applying the user's
 * rotation. The rotation is always a multiple of 90°, so swapping width
 * and height for 90°/270° is sufficient.
 */
export function getRotatedDimensions(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  const normalized = ((rotation % 360) + 360) % 360;
  if (normalized === 90 || normalized === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

/**
 * Compute the target page size in points for one image.
 *
 * - "original": the page exactly matches the rotated image's pixel
 *   dimensions (each pixel = 1 point). Orientation is ignored.
 * - a4/letter/legal: the page uses the standard size, with width/height
 *   swapped for landscape orientation when required.
 */
export function resolvePageSize(
  imageWidth: number,
  imageHeight: number,
  options: ImagesToPdfOptions
): { width: number; height: number } {
  if (options.pageSize === "original") {
    return { width: imageWidth, height: imageHeight };
  }

  const base = PAGE_SIZES[options.pageSize];
  let width = base.width;
  let height = base.height;

  const portrait = imageHeight >= imageWidth;
  const shouldSwap =
    options.orientation === "landscape" ||
    (options.orientation === "auto" && !portrait);

  if (shouldSwap) {
    const tmp = width;
    width = height;
    height = tmp;
  }

  return { width, height };
}

/* ------------------------------------------------------------------ */
/* Image placement                                                    */
/* ------------------------------------------------------------------ */

/**
 * Compute the destination rectangle (x, y, width, height) for an image
 * inside a page given the fit mode and the margin. The origin is the
 * bottom-left corner of the page (pdf-lib coordinate space).
 */
export function computeImagePlacement(
  pageWidth: number,
  pageHeight: number,
  imageWidth: number,
  imageHeight: number,
  fit: ImageFitId,
  margin: number
): { x: number; y: number; width: number; height: number } {
  const usableWidth = Math.max(1, pageWidth - margin * 2);
  const usableHeight = Math.max(1, pageHeight - margin * 2);

  const imageRatio = imageWidth / imageHeight;
  const usableRatio = usableWidth / usableHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (fit === "stretch") {
    drawWidth = usableWidth;
    drawHeight = usableHeight;
  } else if (fit === "contain") {
    // Fit entirely inside the usable area, preserving aspect ratio.
    if (usableRatio > imageRatio) {
      drawHeight = usableHeight;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = usableWidth;
      drawHeight = drawWidth / imageRatio;
    }
  } else {
    // cover: fill the usable area, cropping overflow while preserving
    // aspect ratio.
    if (usableRatio > imageRatio) {
      drawWidth = usableWidth;
      drawHeight = drawWidth / imageRatio;
    } else {
      drawHeight = usableHeight;
      drawWidth = drawHeight * imageRatio;
    }
  }

  // Center the image within the usable area.
  const x = margin + (usableWidth - drawWidth) / 2;
  const y = margin + (usableHeight - drawHeight) / 2;

  return { x, y, width: drawWidth, height: drawHeight };
}

/* ------------------------------------------------------------------ */
/* PDF generation                                                     */
/* ------------------------------------------------------------------ */

/**
 * Embed a single image into a PDF page. The image is always normalized to
 * a PNG bitmap (via canvas) so it is guaranteed to be non-rotated and
 * embeddable, regardless of the original format. This keeps the sizing and
 * placement logic simple and correct.
 */
async function drawImageOnPage(
  pdf: PDFDocument,
  page: PDFPage,
  imageElement: HTMLImageElement,
  item: ImageItem,
  options: ImagesToPdfOptions
): Promise<void> {
  const sourceWidth = imageElement.naturalWidth;
  const sourceHeight = imageElement.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("Image could not be decoded");
  }

  // Normalize the image (apply rotation + convert to PNG) once.
  const pngBlob = await renderImageToPng(imageElement, item.rotation);
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const embedded = await pdf.embedPng(pngBytes);

// After normalization, the effective dimensions are the rotated ones.
  const rotated = getRotatedDimensions(
    sourceWidth,
    sourceHeight,
    item.rotation
  );

  const pageSize = resolvePageSize(rotated.width, rotated.height, options);
  page.setSize(pageSize.width, pageSize.height);

  // Background fill.
  if (options.background === "white") {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageSize.width,
      height: pageSize.height,
      color: rgb(1, 1, 1),
    });
  }

  const margin = PAGE_MARGINS[options.margin];
  const placement = computeImagePlacement(
    pageSize.width,
    pageSize.height,
    rotated.width,
    rotated.height,
    options.fit,
    margin
  );

  page.drawImage(embedded, {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: placement.height,
  });
}

/**
 * Convert a list of images into a single PDF entirely in the browser.
 *
 * - The input order of `images` determines the PDF page order.
 * - Each image is loaded once (reusing the caller-provided map) and
 *   normalized to PNG before embedding.
 * - WEBP/BMP/GIF are converted to PNG once.
 *
 * @returns The generated PDF bytes ready for download.
 */
export async function imagesToPdf(
  images: ImageItem[],
  options: ImagesToPdfOptions,
  loadedImages: Map<string, HTMLImageElement>
): Promise<Uint8Array<ArrayBuffer>> {
  if (images.length === 0) {
    throw new Error("Please upload at least one image.");
  }

  const pdf = await PDFDocument.create();

  for (const item of images) {
    const imageElement = loadedImages.get(item.id);
    if (!imageElement) {
      throw new Error("Image could not be loaded");
    }

    const page = pdf.addPage();
    await drawImageOnPage(pdf, page, imageElement, item, options);
  }

  const saved = await pdf.save();
  return new Uint8Array(saved);
}
