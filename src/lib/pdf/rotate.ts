import { PDFDocument, degrees } from "@cantoo/pdf-lib";

/**
 * Rotate the given pages (1-based) of a PDF by a fixed angle in degrees.
 * Angles must be multiples of 90 (this tool uses -90, 90, 180, 270).
 *
 * Only the listed pages are rotated. All other pages are preserved
 * unchanged and the page order is kept intact. The rotation is applied
 * cumulatively relative to each page's existing rotation so repeated
 * operations compose correctly.
 */
export async function rotatePdf(
  file: File,
  pageNumbers: number[],
  angle: number
): Promise<Uint8Array<ArrayBuffer>> {
  const fileBytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(fileBytes);
  const totalPages = pdf.getPageCount();

  const rotateSet = new Set(pageNumbers);

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    if (!rotateSet.has(pageNumber)) continue;

    const page = pdf.getPage(pageNumber - 1);
    const current = page.getRotation().angle;
    // Normalize to [0, 360) and handle negative angles (e.g. -90).
    const next = ((current + angle) % 360 + 360) % 360;
    page.setRotation(degrees(next));
  }

  const saved = await pdf.save();
  // Copy into a fresh ArrayBuffer-backed Uint8Array so the bytes are
  // guaranteed to be a valid BlobPart (pdf-lib returns ArrayBufferLike).
  return new Uint8Array(saved);
}

