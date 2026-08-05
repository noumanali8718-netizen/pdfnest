import { PDFDocument } from "@cantoo/pdf-lib";

export async function mergePdf(files: File[]) {
  // Create a new empty PDF
  const mergedPdf = await PDFDocument.create();

  // Loop through every uploaded PDF
  for (const file of files) {
    // Convert the file into bytes
    const fileBytes = await file.arrayBuffer();

    // Load the PDF
    const pdf = await PDFDocument.load(fileBytes);

    // Copy all pages
    const copiedPages = await mergedPdf.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    // Add each page to the merged document
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  // Save the merged PDF
  const mergedBytes = await mergedPdf.save();

  // Return the merged file
  return mergedBytes;
}