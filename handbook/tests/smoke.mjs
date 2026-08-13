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
    bodyWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
  }));
  if (metrics.bodyWidth > metrics.viewportWidth + 2) {
    throw new Error(`${label}: horizontal overflow ${metrics.bodyWidth} > ${metrics.viewportWidth}`);
  }
  if (metrics.brokenImages) throw new Error(`${label}: ${metrics.brokenImages} broken images`);
}

async function waitForImages(page) {
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await desktop.goto(baseURL, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: "你现在卡在哪一步？" }).waitFor();
  if (await desktop.getByRole("button", { name: "打开导航" }).isVisible()) {
    throw new Error("desktop shell exposed the mobile menu button");
  }
  if (await desktop.locator(".stage-card").count() !== 6) {
    throw new Error("desktop stage navigation is incomplete");
  }
  await assertPageFits(desktop, "desktop stage navigation");

  await desktop.getByRole("link", { name: /排序与提取/ }).click();
  await desktop.getByRole("link", { name: /不会提取/ }).click();
  await desktop.getByRole("heading", { name: "接下来可以试什么" }).waitFor();
  if (await desktop.locator(".path-card").count() < 3) {
    throw new Error("stuck-point page did not expose curated next steps");
  }
  await assertPageFits(desktop, "desktop stuck-point detail");

  await desktop.goto(`${baseURL}#/mechanisms?view=atlas&axis=operation&item=B8_group_match_order`, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: "分组排序" }).last().waitFor();
  if (!desktop.url().includes("axis=operation") || !desktop.url().includes("item=B8_group_match_order")) {
    throw new Error("mechanism atlas state is not represented in the URL");
  }
  if (await desktop.locator(".axis-question[aria-current='page']").count() !== 1 || await desktop.locator(".atlas-item[aria-current='page']").count() !== 1) {
    throw new Error("mechanism atlas does not expose its current axis and item");
  }
  await assertPageFits(desktop, "desktop mechanism atlas");

  await desktop.getByRole("link", { name: "资料搜索" }).click();
  await desktop.getByPlaceholder(/题名、分区、作者或题面原文/).fill("完成数独");
  await desktop.getByRole("button", { name: "检索", exact: true }).click();
  await desktop.getByRole("button", { name: "仅题面", exact: true }).click();
  await desktop.getByRole("button", { name: /包含官方提示/ }).click();
  await desktop.getByRole("link", { name: "打开 #1 - CCBC 11" }).click();
  await waitForImages(desktop);
  await desktop.locator(".spoiler-stack").scrollIntoViewIfNeeded();
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

  await desktop.getByRole("button", { name: "切换搜索范围" }).click();
  await desktop.keyboard.press("Escape");
  if (!await desktop.getByRole("button", { name: "切换搜索范围" }).evaluate((element) => element === document.activeElement)) {
    throw new Error("modal did not restore focus to its opener");
  }

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  await mobile.goto(baseURL, { waitUntil: "networkidle" });
  await mobile.getByRole("heading", { name: "你现在卡在哪一步？" }).waitFor();
  const mobileState = await mobile.evaluate(() => ({
    bottomNavVisible: getComputedStyle(document.querySelector(".bottom-nav")).display !== "none",
    sidebarHidden: getComputedStyle(document.querySelector(".sidebar")).display === "none",
    topbarHeight: document.querySelector(".topbar").getBoundingClientRect().height,
    brandWidth: document.querySelector(".mobile-brand").getBoundingClientRect().width,
  }));
  if (!mobileState.bottomNavVisible || !mobileState.sidebarHidden || mobileState.topbarHeight > 64 || mobileState.brandWidth > 46) {
    throw new Error(`mobile shell failed: ${JSON.stringify(mobileState)}`);
  }
  await assertPageFits(mobile, "mobile stage navigation");

  const menuButton = mobile.locator("[data-action='mobile-menu']");
  await menuButton.click();
  if (await menuButton.getAttribute("aria-expanded") !== "true") throw new Error("mobile menu did not announce open state");
  if (!await mobile.locator(".sidebar").isVisible()) throw new Error("mobile menu did not open");
  if (!await mobile.locator(".mobile-menu-close").isVisible()) throw new Error("mobile menu has no visible close button");
  await mobile.locator(".mobile-menu-scrim").click({ position: { x: 380, y: 220 } });
  if (await menuButton.getAttribute("aria-expanded") !== "false") throw new Error("mobile menu did not announce closed state");

  await mobile.goto(`${baseURL}#/mechanisms?view=atlas&axis=extraction&item=C2_indexed_extract`, { waitUntil: "networkidle" });
  await mobile.getByRole("heading", { name: "序号提取" }).last().waitFor();
  await assertPageFits(mobile, "mobile mechanism atlas");

  await mobile.goto(`${baseURL}#/puzzles`, { waitUntil: "networkidle" });
  await mobile.getByRole("heading", { name: "历年题库" }).waitFor();
  await assertPageFits(mobile, "mobile puzzle library");

  await mobile.goto(`${baseURL}#/puzzle/${encodeURIComponent("ccbc11:problem:1")}`, { waitUntil: "networkidle" });
  await mobile.getByRole("heading", { name: "#1 - CCBC 11" }).waitFor();
  const detailMetrics = await mobile.evaluate(() => ({
    mainWidth: document.querySelector(".main-content").getBoundingClientRect().width,
    detailColumn: getComputedStyle(document.querySelector(".detail-panel")).gridColumnStart,
  }));
  if (detailMetrics.mainWidth < 350 || detailMetrics.detailColumn !== "1") {
    throw new Error(`mobile puzzle detail collapsed: ${JSON.stringify(detailMetrics)}`);
  }
  await assertPageFits(mobile, "mobile puzzle detail");

  await mobile.goto(`${baseURL}#/puzzle/${encodeURIComponent("ccbc11:problem:10")}`, { waitUntil: "networkidle" });
  await mobile.locator(".content-prose table").first().waitFor();
  await assertPageFits(mobile, "mobile puzzle table");

  await mobile.goto(`${baseURL}#/quick`, { waitUntil: "networkidle" });
  await assertPageFits(mobile, "mobile quick reference");
  await mobile.screenshot({ path: "/tmp/ccbc-handbook-mobile.png", fullPage: false });

  const compact = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await compact.goto(`${baseURL}#/puzzles`, { waitUntil: "networkidle" });
  await compact.getByRole("heading", { name: "历年题库" }).waitFor();
  const compactLibrary = await compact.evaluate(() => ({
    toolbarColumns: getComputedStyle(document.querySelector(".library-toolbar")).gridTemplateColumns.split(" ").length,
    checkboxHeight: document.querySelector(".library-toolbar .checkbox-label").getBoundingClientRect().height,
  }));
  if (compactLibrary.toolbarColumns !== 2 || compactLibrary.checkboxHeight > 60) {
    throw new Error(`compact library toolbar failed: ${JSON.stringify(compactLibrary)}`);
  }
  await assertPageFits(compact, "compact puzzle library");

  await compact.goto(`${baseURL}#/puzzle/${encodeURIComponent("ccbc11:problem:10")}`, { waitUntil: "networkidle" });
  await compact.locator(".content-prose table").first().waitFor();
  const compactDetail = await compact.evaluate(() => ({
    mainWidth: document.querySelector(".main-content").getBoundingClientRect().width,
    detailColumn: getComputedStyle(document.querySelector(".detail-panel")).gridColumnStart,
  }));
  if (compactDetail.mainWidth < 600 || compactDetail.detailColumn !== "1") {
    throw new Error(`compact puzzle detail failed: ${JSON.stringify(compactDetail)}`);
  }
  await assertPageFits(compact, "compact puzzle detail");
  await compact.close();

  console.log(JSON.stringify({
    desktopScreenshot: "/tmp/ccbc-handbook-desktop.png",
    mobileScreenshot: "/tmp/ccbc-handbook-mobile.png",
    mobileState,
  }, null, 2));
} finally {
  await browser.close();
}
