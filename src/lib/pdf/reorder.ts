import { PDFDocument } from "@cantoo/pdf-lib";

/**
 * Reorder the pages of a PDF according to the given 1-based page order.
 *
 * @param file    - The original PDF file.
 * @param pageOrder - Array of 1-based page numbers in the desired order.
 * @returns       - The reordered PDF as a Uint8Array.
 */
export async function reorderPdf(
  file: File,
  pageOrder: number[]
): Promise<Uint8Array<ArrayBuffer>> {
  if (pageOrder.length === 0) {
    throw new Error("Page order must contain at least one page.");
  }

  const fileBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes);
  const totalPages = sourcePdf.getPageCount();

  // Validate that every page number is within range
  for (const pageNum of pageOrder) {
    if (pageNum < 1 || pageNum > totalPages) {
      throw new Error(
        `Page ${pageNum} is outside this PDF (it has ${totalPages} pages).`
      );
    }
  }

  // Validate that we have exactly the right number of unique pages
  const uniquePages = new Set(pageOrder);
  if (uniquePages.size !== totalPages) {
    throw new Error(
      "Every page must appear exactly once in the reordered sequence."
    );
  }

  const outputPdf = await PDFDocument.create();

  // Copy pages in the requested order (convert 1-based to 0-based indices)
  const pageIndices = pageOrder.map((pageNum) => pageNum - 1);
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  const saved = await outputPdf.save();
  return new Uint8Array(saved);
}
