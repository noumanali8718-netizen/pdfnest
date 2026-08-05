import { PDFDocument, PDFName, PDFDict } from "@cantoo/pdf-lib";

export type CompressionLevel = "low" | "balanced" | "maximum";

// Metadata keys that are always optional per the PDF spec and never
// required for correct rendering. Removing them is a safe, lossless
// size optimisation.
const METADATA_KEYS = [
  "Title",
  "Author",
  "Subject",
  "Keywords",
  "Creator",
  "Producer",
  "CreationDate",
  "ModDate",
];

function stripMetadata(pdfDoc: PDFDocument) {
  const infoRef = pdfDoc.context.trailerInfo.Info;
  if (!infoRef) return;

  const infoDict = pdfDoc.context.lookupMaybe(infoRef, PDFDict);
  if (!infoDict) return;

  for (const key of METADATA_KEYS) {
    infoDict.delete(PDFName.of(key));
  }
}

function stripPageLabels(pdfDoc: PDFDocument) {
  // PageLabels live in the document catalog and are only used for
  // display numbering (e.g. "i, ii, iii"). Removing them is safe.
  pdfDoc.catalog.delete(PDFName.of("PageLabels"));
}

/**
 * Browser-based PDF compression is limited.
 *
 * pdf-lib does not re-encode images or optimise internal streams, so a
 * true re-compression engine (Ghostscript, qpdf, etc.) is required to
 * meaningfully shrink image-heavy documents. The only safe, lossless
 * operations we can perform entirely in the browser are:
 *
 *   1. Drop unreferenced objects (pdf-lib does this on save).
 *   2. Strip optional document metadata (Info dictionary).
 *   3. Remove page labels (maximum level).
 *
 * This function deliberately keeps the same interface so the UI can be
 * wired to a real compression engine later without changing the component.
 *
 * We never claim a PDF became smaller — the caller compares the returned
 * sizes and reports honestly.
 *
 * @returns The processed PDF bytes and both sizes for comparison.
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel
): Promise<{
  bytes: Uint8Array<ArrayBuffer>;
  originalSize: number;
  compressedSize: number;
}> {
  const fileBuffer = await file.arrayBuffer();
  const originalSize = fileBuffer.byteLength;
  const pdfDoc = await PDFDocument.load(fileBuffer);

  // --- Level: balanced / maximum — strip top-level metadata ---
  if (level === "balanced" || level === "maximum") {
    stripMetadata(pdfDoc);
  }

  // --- Level: maximum — also remove page labels ---
  if (level === "maximum") {
    stripPageLabels(pdfDoc);
  }

  const saved = await pdfDoc.save();
  const compressedSize = saved.byteLength;

  return {
    bytes: new Uint8Array(saved),
    originalSize,
    compressedSize,
  };
}

