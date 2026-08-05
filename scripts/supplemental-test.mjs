// Supplemental verification: wrong-file rejection + remaining routes.
// Uses fresh page navigations with waits to avoid detached-frame issues.
import puppeteer from "puppeteer-core";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PDF_DIR = join(__dirname, "test-pdfs");

const results = [];
function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  let toastText = "";

  // Listen for toast content in the DOM (sonner renders toasts in a container)
  page.on("console", (m) => {
    if (m.type() === "error") console.log("  [console.error]", m.text());
  });

  // --- Wrong file type rejection ---
  await page.goto(`${BASE_URL}/pdf-to-images`, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector('input[type="file"]', { timeout: 15000 });
  writeFileSync(join(PDF_DIR, "not-a-pdf.txt"), "not a pdf at all");
  const inputs = await page.$$('input[type="file"]');
  await inputs[0].uploadFile(join(PDF_DIR, "not-a-pdf.txt"));
  // Poll for a toast (sonner auto-dismisses; catch it quickly)
  for (let i = 0; i < 20; i++) {
    const t = await page.evaluate(() => {
      // sonner renders toasts with role="status" or data-sonner-toast
      const els = Array.from(document.querySelectorAll('[data-sonner-toast], [role="status"], [data-sonner-toast-region] li'));
      return els.map((e) => e.textContent).join(" ");
    });
    if (t.includes("valid PDF")) { toastText = t; break; }
    await new Promise((r) => setTimeout(r, 300));
  }
  record("Wrong file type rejected", toastText.includes("valid PDF"), toastText);

  // --- Verify the file was NOT added (no file info shown) ---
  const fileInfoShown = await page.evaluate(() => document.body.innerText.includes("not-a-pdf"));
  record("Invalid file not added to UI", !fileInfoShown, `fileInfoShown=${fileInfoShown}`);

  // --- Remaining routes, one at a time with fresh navigation ---
  const routes = ["/rotate-pdf", "/reorder-pages", "/page-numbers", "/watermark-pdf"];
  for (const route of routes) {
    await page.goto("about:blank").catch(() => {});
    await new Promise((r) => setTimeout(r, 500));
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle0", timeout: 25000 }).catch((e) => {
      // networkidle can fail on font/icon loads; retry with domcontentloaded
      return page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 });
    });
    await new Promise((r) => setTimeout(r, 1500));
    const h1 = await page.$eval("h1", (el) => el.textContent).catch(() => "");
    const hasTitle = await page.evaluate(() => document.title).catch(() => "");
    record(`Route ${route} loads`, h1.length > 0, `h1=${h1}, title=${hasTitle}`);
  }

  await browser.close();

  console.log("\n=========== SUPPLEMENTAL SUMMARY ===========");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`PASS: ${passed}  FAIL: ${failed}`);
  for (const r of results) if (!r.pass) console.log(`  FAILED: ${r.name} — ${r.detail}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
