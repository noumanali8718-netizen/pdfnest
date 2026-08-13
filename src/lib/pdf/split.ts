import { PDFDocument } from "@cantoo/pdf-lib";

export type SplitMode = "range" | "single" | "every" | "everyN";

export async function getPageCount(file: File): Promise<number> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  return pdf.getPageCount();
}

async function createPdfFromLoadedSource(
  sourcePdf: PDFDocument,
  pageIndices: number[]
): Promise<Uint8Array<ArrayBuffer>> {
  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  const saved = await outputPdf.save();
  // Copy into a fresh ArrayBuffer-backed Uint8Array so the bytes are
  // guaranteed to be a valid BlobPart (pdf-lib returns ArrayBufferLike).
  return new Uint8Array(saved);
}

async function newDocumentWithPages(
  source: File,
  pageIndices: number[]
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await source.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes);
  return createPdfFromLoadedSource(sourcePdf, pageIndices);
}

/** Extract a page range (1-based inclusive) into a single new PDF. */
export async function splitPdfRange(
  file: File,
  startPage: number,
  endPage: number
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  if (startPage < 1 || endPage < startPage || endPage > totalPages) {
    throw new Error("Invalid page range");
  }

  const pageIndices: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pageIndices.push(i - 1);
  }

  return createPdfFromLoadedSource(pdf, pageIndices);
}

/** Extract a single page (1-based) into its own PDF. */
export async function splitPdfSinglePage(
  file: File,
  pageNumber: number
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  if (pageNumber < 1 || pageNumber > totalPages) {
    throw new Error("Invalid page number");
  }

  return createPdfFromLoadedSource(pdf, [pageNumber - 1]);
}

/** Split every page into its own PDF. Returns an array of PDF bytes. */
export async function splitPdfEveryPage(
  file: File
): Promise<Uint8Array<ArrayBuffer>[]> {
  const fileBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes);
  const totalPages = sourcePdf.getPageCount();

  const results: Uint8Array<ArrayBuffer>[] = [];
  for (let i = 1; i <= totalPages; i++) {
    results.push(await createPdfFromLoadedSource(sourcePdf, [i - 1]));
  }

  return results;
}

/** Split the document into chunks of N pages each. */
export async function splitPdfEveryN(
  file: File,
  chunkSize: number
): Promise<Uint8Array<ArrayBuffer>[]> {
  const fileBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes);
  const totalPages = sourcePdf.getPageCount();

  if (chunkSize < 1 || chunkSize > totalPages) {
    throw new Error("Invalid interval");
  }

  const results: Uint8Array<ArrayBuffer>[] = [];
  for (let start = 1; start <= totalPages; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, totalPages);
    const pageIndices: number[] = [];
    for (let i = start; i <= end; i++) {
      pageIndices.push(i - 1);
    }
    results.push(await createPdfFromLoadedSource(sourcePdf, pageIndices));
  }

  return results;
}

/**
 * Extract arbitrary pages (1-based) into a single new PDF, preserving the
 * requested order. Used by the Extract Pages tool. Reuses the same
 * page-copying logic as the split helpers.
 */
export async function extractPages(
  file: File,
  pageNumbers: number[]
): Promise<Uint8Array<ArrayBuffer>> {
  const pageIndices = pageNumbers.map((page) => page - 1);
  return newDocumentWithPages(file, pageIndices);
}

/**
 * Delete arbitrary pages (1-based) from a PDF and return the remaining
 * pages as a single new PDF. Throws if the deletion list would remove
 * every page. Reuses the same page-copying logic as the split/extract
 * helpers. Page numbers are converted to 0-based pdf-lib indices here
 * before being passed to newDocumentWithPages.
 */
export async function deletePages(
  file: File,
  pageNumbers: number[]
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  const deleteSet = new Set(pageNumbers);
  const keepPageIndices: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (!deleteSet.has(p)) keepPageIndices.push(p - 1);
  }

  if (keepPageIndices.length === 0) {
    throw new Error("You must keep at least one page.");
  }

  return newDocumentWithPages(file, keepPageIndices);
}

