// Generates test PDFs for runtime verification of the PDF to Images tool.
// Uses pdf-lib (already a project dependency) to build PDFs in-memory.
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "test-pdfs");
mkdirSync(OUT, { recursive: true });

async function makePortraitTextPdf(pages) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([595, 842]); // A4 portrait
    page.drawText(`Portrait page ${i}`, {
      x: 50,
      y: 720,
      size: 32,
      font,
      color: rgb(0.1, 0.2, 0.6),
    });
    page.drawText("This is a text-only PDF page for testing.", {
      x: 50,
      y: 680,
      size: 14,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }
  return doc.save();
}

async function makeLandscapePdf(pages) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([842, 595]); // A4 landscape
    page.drawText(`Landscape page ${i}`, {
      x: 50,
      y: 400,
      size: 40,
      font,
      color: rgb(0.8, 0.2, 0.1),
    });
  }
  return doc.save();
}

async function makeRotatedPdf(pages) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([595, 842]);
    // Rotate each page by 90 degrees (clockwise)
    page.setRotation(degrees(90));
    page.drawText(`Rotated page ${i}`, {
      x: 50,
      y: 720,
      size: 32,
      font,
      color: rgb(0.2, 0.6, 0.2),
    });
  }
  return doc.save();
}

async function makeImageHeavyPdf(pages) {
  const doc = await PDFDocument.create();
  // Draw large colored rectangles to simulate image-heavy content.
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage([595, 842]);
    const colors = [rgb(0.9, 0.2, 0.2), rgb(0.2, 0.9, 0.2), rgb(0.2, 0.2, 0.9)];
    const c = colors[i % colors.length];
    page.drawRectangle({
      x: 50,
      y: 100,
      width: 495,
      height: 640,
      color: c,
    });
    page.drawRectangle({
      x: 100,
      y: 150,
      width: 395,
      height: 540,
      color: rgb(1, 1, 1),
    });
  }
  return doc.save();
}

async function makeSinglePagePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([300, 300]); // small square, single page
  page.drawText("Single page", { x: 60, y: 150, size: 24, font });
  return doc.save();
}

async function main() {
  const files = {
    "portrait-text.pdf": await makePortraitTextPdf(3),
    "landscape.pdf": await makeLandscapePdf(2),
    "rotated.pdf": await makeRotatedPdf(2),
    "image-heavy.pdf": await makeImageHeavyPdf(3),
    "single-page.pdf": await makeSinglePagePdf(),
    "large-50.pdf": await makePortraitTextPdf(50),
  };
  for (const [name, bytes] of Object.entries(files)) {
    writeFileSync(join(OUT, name), bytes);
    console.log(`Wrote ${name} (${bytes.length} bytes)`);
  }
  console.log("All test PDFs generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
