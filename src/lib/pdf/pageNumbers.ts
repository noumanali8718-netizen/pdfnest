import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
} from "@cantoo/pdf-lib";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type PageNumberPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type PageNumberFormat =
  | "1"
  | "01"
  | "001"
  | "Page 1"
  | "Page 01"
  | "Page 001"
  | "1 / Total"
  | "Page 1 of Total";

export type PageNumberColorId =
  | "black"
  | "dark-gray"
  | "blue"
  | "red"
  | "green";

export type PageNumberColor = {
  id: PageNumberColorId;
  label: string;
  /** 0-255 RGB components. Convert to 0-1 before passing to pdf-lib rgb(). */
  rgb: { r: number; g: number; b: number };
  /** CSS hex string used by the preview swatches and preview text. */
  hex: string;
};

export type PageNumberOptions = {
  position: PageNumberPosition;
  startingNumber: number;
  format: PageNumberFormat;
  fontSize: number;
  margin: number;
  colorId: PageNumberColorId;
  includeFirstPage: boolean;
};

/* ------------------------------------------------------------------ */
/* Constants — single source of truth for every configurable option   */
/* ------------------------------------------------------------------ */

/**
 * Reusable color mapping used by BOTH the live preview (hex for CSS) and
 * the pdf-lib drawing (rgb for PDF text). Adding a new color here makes it
 * instantly available everywhere without touching component code.
 */
export const PAGE_NUMBER_COLORS: Record<PageNumberColorId, PageNumberColor> = {
  black: {
    id: "black",
    label: "Black",
    rgb: { r: 0, g: 0, b: 0 },
    hex: "#000000",
  },
  "dark-gray": {
    id: "dark-gray",
    label: "Dark Gray",
    rgb: { r: 75, g: 85, b: 99 },
    hex: "#4B5563",
  },
  blue: {
    id: "blue",
    label: "Blue",
    rgb: { r: 37, g: 99, b: 235 },
    hex: "#2563EB",
  },
  red: {
    id: "red",
    label: "Red",
    rgb: { r: 220, g: 38, b: 38 },
    hex: "#DC2626",
  },
  green: {
    id: "green",
    label: "Green",
    rgb: { r: 22, g: 163, b: 74 },
    hex: "#16A34A",
  },
};

export const PAGE_NUMBER_POSITIONS: {
  id: PageNumberPosition;
  label: string;
}[] = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
];

export const PAGE_NUMBER_FORMATS: PageNumberFormat[] = [
  "1",
  "01",
  "001",
  "Page 1",
  "Page 01",
  "Page 001",
  "1 / Total",
  "Page 1 of Total",
];

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24];

export const MARGIN_OPTIONS = [10, 20, 30, 40];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Read the number of pages in a PDF file. */
export async function getPageCount(file: File): Promise<number> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  return pdf.getPageCount();
}

/**
 * Format a page number according to the selected format.
 * `totalPages` is used by the two "of Total" formats.
 */
export function formatPageNumber(
  pageNumber: number,
  totalPages: number,
  format: PageNumberFormat
): string {
  switch (format) {
    case "1":
      return String(pageNumber);
    case "01":
      return String(pageNumber).padStart(2, "0");
    case "001":
      return String(pageNumber).padStart(3, "0");
    case "Page 1":
      return `Page ${pageNumber}`;
    case "Page 01":
      return `Page ${String(pageNumber).padStart(2, "0")}`;
    case "Page 001":
      return `Page ${String(pageNumber).padStart(3, "0")}`;
    case "1 / Total":
      return `${pageNumber} / ${totalPages}`;
    case "Page 1 of Total":
      return `Page ${pageNumber} of ${totalPages}`;
  }
}

/**
 * Return the bottom-left corner (x, y) of a text box for one of the six
 * supported positions. Coordinates are in pdf-lib space with the origin at
 * the bottom-left of the page. `textWidth` and `textHeight` are the measured
 * dimensions of the text at the chosen font size.
 */
export function calculatePosition(
  pageWidth: number,
  pageHeight: number,
  position: PageNumberPosition,
  textWidth: number,
  textHeight: number,
  margin: number
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: margin, y: pageHeight - margin - textHeight };
    case "top-center":
      return {
        x: (pageWidth - textWidth) / 2,
        y: pageHeight - margin - textHeight,
      };
    case "top-right":
      return {
        x: pageWidth - margin - textWidth,
        y: pageHeight - margin - textHeight,
      };
    case "bottom-left":
      return { x: margin, y: margin };
    case "bottom-center":
      return { x: (pageWidth - textWidth) / 2, y: margin };
    case "bottom-right":
      return { x: pageWidth - margin - textWidth, y: margin };
  }
}

/**
 * Draw a page number onto a PDF page. Reuses `calculatePosition` so the
 * preview and the generated PDF stay in sync, and the shared color mapping
 * so pdf-lib always uses the same color as the preview.
 */
export function drawPageNumber(
  page: PDFPage,
  text: string,
  position: PageNumberPosition,
  fontSize: number,
  margin: number,
  font: PDFFont,
  color: PageNumberColor
): void {
  const { width, height } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const textHeight = font.heightAtSize(fontSize);
  const { x, y } = calculatePosition(
    width,
    height,
    position,
    textWidth,
    textHeight,
    margin
  );

  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(color.rgb.r / 255, color.rgb.g / 255, color.rgb.b / 255),
  });
}

/**
 * Add page numbers to every page of a PDF (or every page except the first
 * when `includeFirstPage` is false). When the first page is skipped, the
 * second page receives the starting number and numbering continues from
 * there. Existing content, page sizes and page order are preserved.
 * Returns the new PDF bytes ready for download.
 */
export async function addPageNumbers(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  if (totalPages === 0) {
    throw new Error("PDF has no pages");
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const color = PAGE_NUMBER_COLORS[options.colorId];

  let numberValue = options.startingNumber;

  for (let index = 0; index < totalPages; index++) {
    const page = pdf.getPage(index);

    if (index === 0 && !options.includeFirstPage) {
      continue;
    }

    const text = formatPageNumber(numberValue, totalPages, options.format);
    drawPageNumber(
      page,
      text,
      options.position,
      options.fontSize,
      options.margin,
      font,
      color
    );

    numberValue += 1;
  }

  const saved = await pdf.save();
  // Copy into a fresh ArrayBuffer-backed Uint8Array so the bytes are
  // guaranteed to be a valid BlobPart (pdf-lib returns ArrayBufferLike).
  return new Uint8Array(saved);
}

