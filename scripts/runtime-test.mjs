// Robust runtime verification for the PDF to Images tool.
// Uses CDP download browser events to reliably capture downloads.
import puppeteer from "puppeteer-core";
import { existsSync, readdirSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PDF_DIR = join(__dirname, "test-pdfs");
const DOWNLOAD_DIR = join(__dirname, "downloads");
mkdirSync(DOWNLOAD_DIR, { recursive: true });

const results = [];
function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

let browser, page, client;
let consoleErrors = [], pageErrors = [], failedRequests = [];

async function launch() {
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  page = await browser.newPage();
  client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: DOWNLOAD_DIR,
  });
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("requestfailed", (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
}

function clearDownloads() {
  for (const f of readdirSync(DOWNLOAD_DIR)) {
    try { unlinkSync(join(DOWNLOAD_DIR, f)); } catch {}
  }
}

function listDownloads() {
  return readdirSync(DOWNLOAD_DIR).filter((f) => !f.endsWith(".crdownload"));
}

async function waitForDownloads(expected, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const files = listDownloads();
    if (files.length >= expected) return files;
    await new Promise((r) => setTimeout(r, 500));
  }
  return listDownloads();
}

async function resetToFreshPage() {
  // Navigate fresh to clear the uploaded file state.
  await page.goto(`${BASE_URL}/pdf-to-images`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector('input[type="file"]', { timeout: 15000 });
}

async function uploadAndConvert(fileName, format, label, expectedCount) {
  console.log(`\n=== Test: ${label} (${fileName}, ${format}) ===`);
  const consoleBefore = consoleErrors.length;
  await clearDownloads();
  await resetToFreshPage();

  // Upload
  const inputs = await page.$$('input[type="file"]');
  await inputs[0].uploadFile(join(PDF_DIR, fileName));
  // Wait for page count to appear (options section shows)
  await page.waitForFunction(
    () => document.body.innerText.includes("Convert to Images"),
    { timeout: 20000 }
  );

  // Select format
  if (format) {
    await page.evaluate((fmt) => {
      const buttons = Array.from(document.querySelectorAll('button[role="radio"]'));
      const target = buttons.find((b) => b.textContent && b.textContent.trim().startsWith(fmt));
      if (target) target.click();
    }, format);
    await new Promise((r) => setTimeout(r, 300));
  }

  // Click convert
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const convert = buttons.find((b) => b.textContent && b.textContent.includes("Convert to Images"));
    if (convert) convert.click();
  });

  // Wait for Result heading
  const resultShown = await page
    .waitForFunction(
      () => Array.from(document.querySelectorAll("h3")).some((h) => h.textContent.trim() === "Result"),
      { timeout: 60000 }
    )
    .then(() => true)
    .catch(() => false);
  record(`${label}: ${format} result shown`, resultShown);

  // Wait for downloads
  const files = await waitForDownloads(expectedCount, 30000);
  record(`${label}: ${format} downloaded ${expectedCount} file(s)`, files.length >= expectedCount, `got=${files.length}: ${files.join(", ")}`);

  const newErrors = consoleErrors.slice(consoleBefore).filter((e) => !e.includes("favicon"));
  record(`${label}: ${format} no new console errors`, newErrors.length === 0, newErrors.join(" | "));
}

async function main() {
  await launch();
  try {
    await page.goto(`${BASE_URL}/pdf-to-images`, { waitUntil: "networkidle0", timeout: 30000 });
    record("Page loads /pdf-to-images", true);
    await page.waitForFunction(() => document.body.innerText.includes("PDF to Images"), { timeout: 10000 });
    record("Tool title renders", true);

    // Single-page JPG
    await uploadAndConvert("single-page.pdf", "JPG", "Single-page", 1);
    // Single-page PNG
    await uploadAndConvert("single-page.pdf", "PNG", "Single-page", 1);
    // Multi-page JPG (3 pages -> 1 zip)
    await uploadAndConvert("portrait-text.pdf", "JPG", "Multi-page", 1);
    // Multi-page PNG
    await uploadAndConvert("portrait-text.pdf", "PNG", "Multi-page", 1);
    // Landscape
    await uploadAndConvert("landscape.pdf", "JPG", "Landscape", 1);
    // Rotated
    await uploadAndConvert("rotated.pdf", "JPG", "Rotated", 1);
    // Image-heavy
    await uploadAndConvert("image-heavy.pdf", "JPG", "Image-heavy", 1);
    // Large 50-page
    await uploadAndConvert("large-50.pdf", "JPG", "Large 50-page", 1);

    // Error handling: wrong file type
    console.log("\n=== Error handling: wrong file type ===");
    await clearDownloads();
    await resetToFreshPage();
    writeFileSync(join(PDF_DIR, "not-a-pdf.txt"), "this is not a pdf");
    const inputs = await page.$$('input[type="file"]');
    await inputs[0].uploadFile(join(PDF_DIR, "not-a-pdf.txt"));
    await new Promise((r) => setTimeout(r, 2000));
    const bodyText = await page.evaluate(() => document.body.innerText);
    record("Wrong file type rejected", bodyText.includes("valid PDF"), bodyText.slice(0, 60));

    // Console / network verification
    console.log("\n=== Browser verification ===");
    record("No page errors", pageErrors.length === 0, pageErrors.join(" | "));
    record("No failed requests (excl favicon)", failedRequests.filter((f) => !f.includes("favicon")).length === 0, failedRequests.join(" | "));
    record("No DOMMatrix errors", !consoleErrors.some((e) => e.includes("DOMMatrix")), "");
    record("No worker errors", !consoleErrors.some((e) => /worker|pdfjs|pdf/i.test(e)), consoleErrors.join(" | "));
    record("No MIME errors", !consoleErrors.some((e) => /MIME|mime/i.test(e)), "");
    record("No CORS errors", !consoleErrors.some((e) => /CORS|blocked|webgl/i.test(e)), "");

    // Homepage
    console.log("\n=== Homepage / navigation ===");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 30000 });
    const hasCard = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links.some((a) => a.getAttribute("href") === "/pdf-to-images");
    });
    record("Homepage has PDF to Images link", hasCard);

    // Existing tools
    const routes = ["/split-pdf","/compress-pdf","/extract-pages","/delete-pages","/rotate-pdf","/reorder-pages","/page-numbers","/watermark-pdf"];
    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle0", timeout: 20000 });
        const h1 = await page.$eval("h1", (el) => el.textContent).catch(() => "");
        record(`Route ${route} loads`, h1.length > 0, `h1=${h1}`);
      } catch (e) {
        record(`Route ${route} loads`, false, e.message);
      }
    }
  } catch (e) {
    console.error("FATAL:", e);
    record("Test script completed", false, e.message);
  } finally {
    await browser.close();
  }

  console.log("\n\n=========== SUMMARY ===========");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`PASS: ${passed}  FAIL: ${failed}`);
  for (const r of results) if (!r.pass) console.log(`  FAILED: ${r.name} — ${r.detail}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
