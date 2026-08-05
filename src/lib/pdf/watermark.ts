import {
  PDFDocument,
  PDFFont,
  PDFImage,
  PDFPage,
  degrees,
  rgb,
  StandardFonts,
} from "@cantoo/pdf-lib";
import { getPageCount, calculatePosition } from "./pageNumbers";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type WatermarkType = "text" | "image";

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "tile";

export type ApplyTo = "all" | "first" | "last";

export type WatermarkColorId = "black" | "gray" | "red" | "blue" | "green";

export type WatermarkFontStyle = "regular" | "bold";

export type WatermarkColor = {
  id: WatermarkColorId;
  label: string;
  /** 0-255 RGB components (converted to 0-1 before passing to pdf-lib). */
  rgb: { r: number; g: number; b: number };
  /** CSS hex string used by the preview swatches and preview text. */
  hex: string;
};

type BaseWatermarkOptions = {
  position: WatermarkPosition;
  /** 0.1 to 1 (100%). */
  opacity: number;
  /** Rotation in degrees, -180 to 180. */
  rotation: number;
  applyTo: ApplyTo;
};

export type TextWatermarkOptions = BaseWatermarkOptions & {
  type: "text";
  text: string;
  fontSize: number;
  colorId: WatermarkColorId;
  fontStyle: WatermarkFontStyle;
};

export type ImageWatermarkOptions = BaseWatermarkOptions & {
  type: "image";
  image: File;
  /** 0.2 to 1.5 (150%). */
  scale: number;
};

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

/* ------------------------------------------------------------------ */
/* Constants — single source of truth for every configurable option   */
/* ------------------------------------------------------------------ */

/**
 * Reusable color mapping used by BOTH the live preview (hex for CSS) and
 * the pdf-lib drawing (rgb for PDF text). Adding a new color here makes it
 * instantly available everywhere without touching component code.
 */
export const WATERMARK_COLORS: Record<WatermarkColorId, WatermarkColor> = {
  black: {
    id: "black",
    label: "Black",
    rgb: { r: 0, g: 0, b: 0 },
    hex: "#000000",
  },
  gray: {
    id: "gray",
    label: "Gray",
    rgb: { r: 107, g: 114, b: 128 },
    hex: "#6B7280",
  },
  red: {
    id: "red",
    label: "Red",
    rgb: { r: 220, g: 38, b: 38 },
    hex: "#DC2626",
  },
  blue: {
    id: "blue",
    label: "Blue",
    rgb: { r: 37, g: 99, b: 235 },
    hex: "#2563EB",
  },
  green: {
    id: "green",
    label: "Green",
    rgb: { r: 22, g: 163, b: 74 },
    hex: "#16A34A",
  },
};

export const WATERMARK_POSITIONS: {
  id: WatermarkPosition;
  label: string;
}[] = [
  { id: "center", label: "Center" },
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "tile", label: "Tile" },
];

export const APPLY_TO_OPTIONS: { id: ApplyTo; label: string }[] = [
  { id: "all", label: "All Pages" },
  { id: "first", label: "First Page Only" },
  { id: "last", label: "Last Page Only" },
];

export const FONT_STYLES: { id: WatermarkFontStyle; label: string }[] = [
  { id: "regular", label: "Regular" },
  { id: "bold", label: "Bold" },
];

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 72;

export const OPACITY_MIN = 0.1;
export const OPACITY_MAX = 1;

export const ROTATION_MIN = -180;
export const ROTATION_MAX = 180;

export const SCALE_MIN = 0.2;
export const SCALE_MAX = 1.5;

/* ------------------------------------------------------------------ */
/* Re-exported helper (no duplication)                                */
/* ------------------------------------------------------------------ */

export { getPageCount };

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Return the bottom-left corner (x, y) of a watermark box for one of the
 * supported positions. The 6 outer positions reuse the shared
 * `calculatePosition` from the Page Numbers pipeline; `center` and `tile`
 * are added here. `w`/`h` are the measured dimensions of the watermark
 * element.
 */
export function calculateWatermarkPosition(
  pageWidth: number,
  pageHeight: number,
  position: WatermarkPosition,
  w: number,
  h: number,
  margin: number
): { x: number; y: number } {
  // "center" and "tile" both start from the page center; tile is then
  // repeated across the page by applyWatermarkToPage.
  if (position === "center" || position === "tile") {
    return { x: (pageWidth - w) / 2, y: (pageHeight - h) / 2 };
  }
  return calculatePosition(pageWidth, pageHeight, position, w, h, margin);
}

/**
 * Compute the bottom-left corner (x, y) to pass to pdf-lib's drawText /
 * drawImage so that the watermark's geometric center stays at (centerX,
 * centerY) after the built-in rotation is applied.
 *
 * pdf-lib rotates around the element's bottom-left corner. To keep the box
 * centered on the target point, we back-rotate the half-extent offset by the
 * rotation angle and subtract it from the target center.
 */
function getRotatedBottomLeft(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  angleDegrees: number
): { x: number; y: number } {
  const radians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = width / 2;
  const dy = height / 2;
  // Rotate the (dx, dy) offset by -angle (to undo the forward rotation).
  const rotatedDX = dx * cos + dy * sin;
  const rotatedDY = -dx * sin + dy * cos;
  return { x: centerX - rotatedDX, y: centerY - rotatedDY };
}

/**
 * Normalize any angle in degrees into a value usable by the preview so the
 * preview rotation and the PDF rotation stay consistent (pdf-lib's rotate
 * option accepts any angle, including negatives).
 */
export function calculateRotation(angleDegrees: number): number {
  // Normalize to [0, 360).
  return ((angleDegrees % 360) + 360) % 360;
}

/**
 * Resolve which 0-based page indices should receive the watermark based on
 * the "apply to" mode. Kept as a separate function so odd/even/custom page
 * modes can be added later without changing the processing pipeline.
 */
export function resolvePagesToApply(
  totalPages: number,
  applyTo: ApplyTo
): number[] {
  switch (applyTo) {
    case "first":
      return totalPages > 0 ? [0] : [];
    case "last":
      return totalPages > 0 ? [totalPages - 1] : [];
    case "all":
    default: {
      const indices: number[] = [];
      for (let i = 0; i < totalPages; i++) indices.push(i);
      return indices;
    }
  }
}

/** Pick the embedded font for a font style (keeps font architecture expandable). */
function getFont(pdf: PDFDocument, style: WatermarkFontStyle): Promise<PDFFont> {
  const fontName =
    style === "bold" ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
  return pdf.embedFont(fontName);
}

/**
 * Draw a rotated text watermark whose geometric center lands at the center
 * of the box `(x, y, width, height)`, using pdf-lib drawing APIs only.
 * No page flattening / rasterization occurs.
 */
function drawRotatedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  font: PDFFont,
  color: WatermarkColor,
  opacity: number,
  angleDegrees: number
): void {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const { x: drawX, y: drawY } = getRotatedBottomLeft(
    centerX,
    centerY,
    width,
    height,
    angleDegrees
  );
  page.drawText(text, {
    x: drawX,
    y: drawY,
    size: fontSize,
    font,
    color: rgb(color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255),
    opacity,
    rotate: degrees(angleDegrees),
  });
}

/**
 * Draw a rotated image watermark whose geometric center lands at the center
 * of the box `(x, y, drawWidth, drawHeight)`, using pdf-lib drawing APIs
 * only. No page flattening / rasterization occurs.
 */
function drawRotatedImage(
  page: PDFPage,
  image: PDFImage,
  x: number,
  y: number,
  drawWidth: number,
  drawHeight: number,
  opacity: number,
  angleDegrees: number
): void {
  const centerX = x + drawWidth / 2;
  const centerY = y + drawHeight / 2;
  const { x: drawX, y: drawY } = getRotatedBottomLeft(
    centerX,
    centerY,
    drawWidth,
    drawHeight,
    angleDegrees
  );
  page.drawImage(image, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
    opacity,
    rotate: degrees(angleDegrees),
  });
}

/** Apply a single watermark element to a page at the given placement. */
function applyWatermarkToPage(
  page: PDFPage,
  options: WatermarkOptions,
  font: PDFFont | null,
  image: PDFImage | null,
  placement: { x: number; y: number; width: number; height: number }
): void {
  const { position, opacity, rotation } = options;

  if (position === "tile") {
    // Tile the watermark across the page in a grid.
    const { width: pageW, height: pageH } = page.getSize();
    const stepX = placement.width * 2;
    const stepY = placement.height * 2;
    const startX = -placement.width;
    const startY = -placement.height;

    for (let y = startY; y < pageH + placement.height; y += stepY) {
      for (let x = startX; x < pageW + placement.width; x += stepX) {
        if (options.type === "text" && font) {
          drawRotatedText(
            page,
            options.text,
            x,
            y,
            placement.width,
            placement.height,
            options.fontSize,
            font,
            WATERMARK_COLORS[options.colorId],
            opacity,
            rotation
          );
        } else if (options.type === "image" && image) {
          drawRotatedImage(
            page,
            image,
            x,
            y,
            placement.width,
            placement.height,
            opacity,
            rotation
          );
        }
      }
    }
    return;
  }

  if (options.type === "text" && font) {
    drawRotatedText(
      page,
      options.text,
      placement.x,
      placement.y,
      placement.width,
      placement.height,
      options.fontSize,
      font,
      WATERMARK_COLORS[options.colorId],
      opacity,
      rotation
    );
  } else if (options.type === "image" && image) {
    drawRotatedImage(
      page,
      image,
      placement.x,
      placement.y,
      placement.width,
      placement.height,
      opacity,
      rotation
    );
  }
}

/**
 * Add a TEXT watermark to a PDF. Preserves all original content, page size,
 * and metadata; the watermark is drawn on top with pdf-lib drawing APIs only
 * (no rasterization, no flattening). Returns the new PDF bytes.
 */
export async function addTextWatermark(
  file: File,
  options: Omit<TextWatermarkOptions, "type">
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const font = await getFont(pdf, options.fontStyle);
  const totalPages = pdf.getPageCount();

  const pageIndices = resolvePagesToApply(totalPages, options.applyTo);

  for (const index of pageIndices) {
    const page = pdf.getPage(index);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);
    const placement = {
      ...calculateWatermarkPosition(
        width,
        height,
        options.position,
        textWidth,
        textHeight,
        Math.min(textWidth, textHeight) * 0.5
      ),
      width: textWidth,
      height: textHeight,
    };
    applyWatermarkToPage(
      page,
      { ...options, type: "text" },
      font,
      null,
      placement
    );
  }

  const saved = await pdf.save();
  return new Uint8Array(saved);
}

/**
 * Add an IMAGE watermark to a PDF. PNG/JPG/JPEG only. Preserves all original
 * content, page size, and metadata; the watermark is drawn with pdf-lib
 * drawing APIs only (no rasterization, no flattening). Returns the new PDF
 * bytes.
 */
export async function addImageWatermark(
  file: File,
  options: Omit<ImageWatermarkOptions, "type">
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  const imageBytes = await options.image.arrayBuffer();
  const isPng = options.image.type === "image/png";
  const isJpeg =
    options.image.type === "image/jpeg" ||
    options.image.type === "image/jpg" ||
    /\.jpe?g$/i.test(options.image.name);

  let image: PDFImage;
  if (isPng) {
    image = await pdf.embedPng(imageBytes);
  } else if (isJpeg) {
    image = await pdf.embedJpg(imageBytes);
  } else {
    throw new Error("Only PNG and JPG images are supported.");
  }

  const pageIndices = resolvePagesToApply(totalPages, options.applyTo);

  for (const index of pageIndices) {
    const page = pdf.getPage(index);
    const { width, height } = page.getSize();

    // Base image size is 40% of the shorter page dimension, scaled by options.scale.
    const baseExtent = Math.min(width, height) * 0.4;
    const drawWidth = baseExtent * options.scale;
    const drawHeight = baseExtent * options.scale;

    const placement = {
      ...calculateWatermarkPosition(
        width,
        height,
        options.position,
        drawWidth,
        drawHeight,
        Math.min(width, height) * 0.05
      ),
      width: drawWidth,
      height: drawHeight,
    };
    applyWatermarkToPage(
      page,
      { ...options, type: "image" },
      null,
      image,
      placement
    );
  }

  const saved = await pdf.save();
  return new Uint8Array(saved);
}

/**
 * Unified dispatcher. Routes to the text or image processing pipeline based
 * on the watermark type. This is the single entry point the UI calls, so
 * future watermark types (e.g. custom fonts, logo presets) can be added
 * without changing the component's call site.
 */
export async function applyWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array<ArrayBuffer>> {
  if (options.type === "text") {
    const { type: _type, ...textOptions } = options;
    return addTextWatermark(file, textOptions);
  }
  const { type: _type, ...imageOptions } = options;
  return addImageWatermark(file, imageOptions);
}
