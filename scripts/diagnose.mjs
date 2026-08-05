// Focused diagnostic: upload a PDF, click convert, and capture the full
// page state + console errors so we can see why conversion may be failing.
import puppeteer from "puppeteer-core";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PDF = join(__dirname, "test-pdfs", "single-page.pdf");

const consoleErrors = [];
const pageErrors = [];

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") {
      consoleErrors.push(m.text());
      console.log(`  [console.error] ${m.text()}`);
    } else {
      console.log(`  [console.${m.type()}] ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => {
    pageErrors.push(e.message);
    console.log(`  [pageerror] ${e.message}`);
  });
  page.on("requestfailed", (r) => {
    console.log(`  [requestfailed] ${r.url()} :: ${r.failure()?.errorText}`);
  });

  await page.goto(`${BASE_URL}/pdf-to-images`, { waitUntil: "networkidle0", timeout: 30000 });
  console.log("Loaded page. Title:", await page.title());

  // Wait for the file input
  await page.waitForSelector('input[type="file"]', { timeout: 15000 });
  console.log("Found file input. Uploading...");
  const inputs = await page.$$('input[type="file"]');
  await inputs[0].uploadFile(PDF);
  console.log("Uploaded file. Waiting 5s...");
  await new Promise((r) => setTimeout(r, 5000));

  // Capture page text to see file info and page count
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("--- BODY TEXT AFTER UPLOAD ---");
  console.log(bodyText.slice(0, 1500));
  console.log("--- END BODY TEXT ---");

  // Check if convert button is present and enabled
  const convertInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const convert = buttons.find((b) => b.textContent && b.textContent.includes("Convert to Images"));
    if (!convert) return { found: false };
    return { found: true, disabled: convert.disabled, text: convert.textContent };
  });
  console.log("Convert button:", JSON.stringify(convertInfo));

  // Click convert
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const convert = buttons.find((b) => b.textContent && b.textContent.includes("Convert to Images"));
    if (convert) convert.click();
  });
  console.log("Clicked convert. Waiting 10s...");
  await new Promise((r) => setTimeout(r, 10000));

  const afterText = await page.evaluate(() => document.body.innerText);
  console.log("--- BODY TEXT AFTER CONVERT (10s) ---");
  console.log(afterText.slice(0, 2000));
  console.log("--- END ---");

  console.log("\nConsole errors:", JSON.stringify(consoleErrors, null, 2));
  console.log("Page errors:", JSON.stringify(pageErrors, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
