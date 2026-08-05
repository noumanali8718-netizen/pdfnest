/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type ImageFormat = "jpg" | "png";

export type ImageQuality = "low" | "medium" | "high";

export type ToImagesOptions = {
  format: ImageFormat;
  /** 0.5 to 3.0 — multiplier applied to the page's base viewport scale. */
  scale: number;
  /** JPEG quality (0–1). Only used when `format` is "jpg". */
  quality: number;
};

export type ConvertedImage = {
  blob: Blob;
  filename: string;
};

/* ------------------------------------------------------------------ */
/* Worker setup (client-side only)                                    */
/* ------------------------------------------------------------------ */

/**
 * Point pdf.js at its bundled worker. Using the CDN worker keeps the main
 * bundle small and works in client components (where `window` is available).
 * pdfjs-dist is imported dynamically so it never runs on the server during
 * Next.js static generation (it references browser globals like DOMMatrix).
 */
async function configureWorker(): Promise<void> {
  const { GlobalWorkerOptions } = await import("pdfjs-dist");
  if (typeof window === "undefined") return;
  // pdfjs-dist v6 ships only ESM builds (`.mjs`). The project pins
  // 6.2.108. We self-host the worker from `public/` so it always
  // resolves for the exact installed version, works offline, and never
  // relies on a CDN that may not mirror this version. A page may
  // override the worker URL via `window.__pdfjsBaseUrl`.
  const baseUrl =
    (window as Window & { __pdfjsBaseUrl?: string }).__pdfjsBaseUrl ??
    `${window.location.origin}/pdf.worker.min.mjs`;
  GlobalWorkerOptions.workerSrc = baseUrl;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Map a quality level to a JPEG quality value (0–1) for canvas
 * `toBlob(..., 'image/jpeg', quality)`.
 */
export function qualityToJpegValue(quality: ImageQuality): number {
  switch (quality) {
    case "low":
      return 0.6;
    case "high":
      return 0.95;
    case "medium":
    default:
      return 0.8;
  }
}

/**
 * Render a single page of a loaded PDF document to a canvas, then export it
 * as an image blob in the requested format. The canvas is sized from the
 * page's viewport at the given scale so the image matches the page
 * dimensions (including any page rotation).
 */
async function renderPageToBlob(
  page: import("pdfjs-dist").PDFPageProxy,
  format: ImageFormat,
  scale: number,
  quality: number
): Promise<Blob> {
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: format === "png" });

  if (!context) {
    throw new Error("Canvas 2D context is not available.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  if (format === "jpg") {
    // White background so transparent PDFs render correctly as JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;

  return new Promise<Blob>((resolve, reject) => {
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not encode page as image."));
        }
      },
      mimeType,
      format === "jpg" ? quality : undefined
    );
  });
}

/* ------------------------------------------------------------------ */
/* Main API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Convert every page of a PDF file into images (JPG or PNG) entirely in the
 * browser. Returns one `ConvertedImage` per page. The original PDF is never
 * modified or uploaded anywhere.
 */
export async function pdfToImages(
  file: File,
  options: ToImagesOptions
): Promise<ConvertedImage[]> {
  await configureWorker();

  const { getDocument } = await import("pdfjs-dist");
  const bytes = await file.arrayBuffer();
  const loadingTask = getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  try {
    const { numPages } = pdf;
    const images: ConvertedImage[] = [];
    const baseName = file.name.replace(/\.pdf$/i, "") || "document";

    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const blob = await renderPageToBlob(
        page,
        options.format,
        options.scale,
        options.quality
      );
      images.push({
        blob,
        filename: `${baseName}-page-${String(pageNumber).padStart(2, "0")}.${
          options.format === "jpg" ? "jpg" : "png"
        }`,
      });
    }

    return images;
  } finally {
    // Always release the document so memory is freed in long sessions.
    await loadingTask.destroy();
  }
}
