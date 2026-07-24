import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const videoDir = join(scriptDir, "..");
const assetDir = join(videoDir, "public", "assets");
const captureDir = join(videoDir, ".capture-tmp");
const baseUrl = process.env.CHEM3D_CAPTURE_URL ?? "http://127.0.0.1:5173";
const viewport = { width: 1920, height: 1080 };

await mkdir(assetDir, { recursive: true });
await mkdir(captureDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];

const preparePage = async (page, route) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`${route}: ${message.text()}`);
    }
  });

  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor({ state: "visible" });
  await page.waitForTimeout(1300);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = "auto";
  });
};

const dragCanvas = async (page, deltaX, deltaY) => {
  const canvas = page.locator("canvas");
  if ((await canvas.count()) !== 1) {
    throw new Error(`Expected exactly one 3D canvas, found ${await canvas.count()}`);
  }

  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error("3D canvas is not visible");
  }

  const startX = box.x + box.width * 0.52;
  const startY = box.y + box.height * 0.5;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX * 0.45, startY + deltaY * 0.45, { steps: 14 });
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 18 });
  await page.mouse.up();
};

const clickWithoutScroll = async (page, name) => {
  const button = page.getByRole("button", { name, exact: true });
  if ((await button.count()) !== 1) {
    throw new Error(`Expected one button named ${name}, found ${await button.count()}`);
  }
  await button.evaluate((element) => element.click());
};

const recordClip = async ({ name, route, action }) => {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "zh-CN",
    recordVideo: { dir: captureDir, size: viewport },
  });
  const page = await context.newPage();
  await preparePage(page, route);
  await action(page);
  await page.waitForTimeout(800);

  const video = page.video();
  await page.close();
  await context.close();
  if (!video) {
    throw new Error(`Video capture unavailable for ${name}`);
  }
  await video.saveAs(join(assetDir, `${name}.webm`));
  process.stdout.write(`captured ${name}.webm\n`);
};

const captureScreenshot = async ({ name, route, action }) => {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "zh-CN",
  });
  const page = await context.newPage();
  await preparePage(page, route);
  if (action) {
    await action(page);
  }
  await page.screenshot({ path: join(assetDir, `${name}.png`) });
  await context.close();
  process.stdout.write(`captured ${name}.png\n`);
};

try {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`Frontend returned HTTP ${response.status}`);
  }

  await recordClip({
    name: "home",
    route: "/",
    action: async (page) => {
      await page.waitForTimeout(1600);
      await page.mouse.wheel(0, 420);
      await page.waitForTimeout(1400);
      await page.mouse.wheel(0, 520);
      await page.waitForTimeout(1500);
      await page.mouse.wheel(0, -940);
      await page.waitForTimeout(1300);
    },
  });

  await recordClip({
    name: "modules-search",
    route: "/modules",
    action: async (page) => {
      const search = page.getByRole("searchbox", { name: "搜索结构" });
      await search.fill("H₂O");
      await page.waitForTimeout(1700);
      await search.fill("");
      await page.waitForTimeout(800);
      await clickWithoutScroll(page, "晶体结构");
      await page.waitForTimeout(2100);
    },
  });

  await recordClip({
    name: "ch4-angle",
    route: "/module/tetrahedral-ch4",
    action: async (page) => {
      await dragCanvas(page, 180, -55);
      await page.waitForTimeout(1300);
      await clickWithoutScroll(page, "键角");
      await page.waitForTimeout(1800);
      await clickWithoutScroll(page, "旋转");
      await page.waitForTimeout(6800);
    },
  });

  await recordClip({
    name: "nh3-lone-pair",
    route: "/module/pyramidal-nh3",
    action: async (page) => {
      await clickWithoutScroll(page, "孤电子对");
      await clickWithoutScroll(page, "键角");
      await page.waitForTimeout(1200);
      await dragCanvas(page, -150, 35);
      await page.waitForTimeout(3400);
    },
  });

  await recordClip({
    name: "h2o-lone-pairs",
    route: "/module/v-shape-h2o",
    action: async (page) => {
      await clickWithoutScroll(page, "孤电子对");
      await clickWithoutScroll(page, "键角");
      await page.waitForTimeout(1200);
      await dragCanvas(page, 145, 20);
      await page.waitForTimeout(3400);
    },
  });

  await recordClip({
    name: "nacl-crystal",
    route: "/module/nacl-crystal",
    action: async (page) => {
      await dragCanvas(page, 160, -40);
      await page.waitForTimeout(1300);
      await clickWithoutScroll(page, "六配位");
      await page.waitForTimeout(1800);
      await clickWithoutScroll(page, "标签");
      await page.waitForTimeout(2800);
    },
  });

  await captureScreenshot({ name: "home", route: "/" });
  await captureScreenshot({ name: "paths", route: "/paths" });
  await captureScreenshot({ name: "exam", route: "/exam" });
} finally {
  await browser.close();
}

if (consoleErrors.length > 0) {
  throw new Error(`Browser console errors:\n${consoleErrors.join("\n")}`);
}

process.stdout.write("all real-site assets captured without browser console errors\n");
