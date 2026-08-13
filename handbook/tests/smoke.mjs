import { createRequire } from "node:module";
import { existsSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");


const baseURL = process.env.HANDBOOK_URL || "http://127.0.0.1:8765/";
const executablePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const launchOptions = { headless: true };
if (existsSync(executablePath)) launchOptions.executablePath = executablePath;
const browser = await chromium.launch(launchOptions);

async function assertPageFits(page, label) {
  const metrics = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
  }));
  if (metrics.bodyWidth > metrics.viewportWidth + 2) {
    throw new Error(`${label}: horizontal overflow ${metrics.bodyWidth} > ${metrics.viewportWidth}`);
  }
  if (metrics.brokenImages) throw new Error(`${label}: ${metrics.brokenImages} broken images`);
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await desktop.goto(baseURL, { waitUntil: "networkidle" });
  await desktop.getByPlaceholder(/输入你看到的东西/).fill("完成数独");
  await desktop.getByRole("button", { name: "检索", exact: true }).click();
  await desktop.getByRole("button", { name: "仅题面", exact: true }).click();
  await desktop.getByRole("button", { name: /包含官方提示/ }).click();
  await desktop.getByRole("link", { name: "打开 #1 - CCBC 11" }).click();
  await desktop.getByRole("button", { name: /逐条查看官方提示/ }).click();
  if (await desktop.getByText("两个单词提示了需要看的数字").count()) {
    throw new Error("The second hint was exposed before requesting it");
  }
  await desktop.getByRole("button", { name: "显示下一条提示" }).click();
  await desktop.getByRole("button", { name: /显示最终答案/ }).click();
  await desktop.getByRole("button", { name: "确认显示答案" }).click();
  await desktop.getByText("CONFLUXES", { exact: true }).waitFor();
  await desktop.reload({ waitUntil: "networkidle" });
  if (await desktop.getByText("CONFLUXES", { exact: true }).count()) {
    throw new Error("The answer stayed visible after refresh");
  }
  await assertPageFits(desktop, "desktop puzzle");
  await desktop.screenshot({ path: "/tmp/ccbc-handbook-desktop.png", fullPage: false });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  await mobile.goto(baseURL, { waitUntil: "networkidle" });
  await mobile.getByPlaceholder(/输入你看到的东西/).waitFor();
  const mobileState = await mobile.evaluate(() => ({
    bottomNavVisible: getComputedStyle(document.querySelector(".bottom-nav")).display !== "none",
    sidebarHidden: getComputedStyle(document.querySelector(".sidebar")).display === "none",
    inputWidth: document.querySelector(".search-box-large input").getBoundingClientRect().width,
  }));
  if (!mobileState.bottomNavVisible || !mobileState.sidebarHidden || mobileState.inputWidth < 250) {
    throw new Error(`mobile shell failed: ${JSON.stringify(mobileState)}`);
  }
  await assertPageFits(mobile, "mobile home");
  await mobile.goto(`${baseURL}#/quick`, { waitUntil: "networkidle" });
  await assertPageFits(mobile, "mobile quick reference");
  await mobile.screenshot({ path: "/tmp/ccbc-handbook-mobile.png", fullPage: false });

  console.log(JSON.stringify({
    desktopScreenshot: "/tmp/ccbc-handbook-desktop.png",
    mobileScreenshot: "/tmp/ccbc-handbook-mobile.png",
    mobileState,
  }, null, 2));
} finally {
  await browser.close();
}
