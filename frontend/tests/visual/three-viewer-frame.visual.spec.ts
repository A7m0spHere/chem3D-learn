import { expect, test, type Locator } from "@playwright/test";
import { inflateSync } from "node:zlib";

const viewers = [
  { route: "/module/tetrahedral-ch4", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/pyramidal-nh3", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/v-shape-h2o", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/linear-co2", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/planar-bf3", viewer: "molecule-viewer", stage: "molecule-viewer-canvas" },
  { route: "/module/polarity-judgment", viewer: "molecular-polarity-viewer", stage: "molecular-polarity-canvas" },
  { route: "/module/sigma-bond-orbitals", viewer: "sigma-bond-orbitals-viewer", stage: "sigma-bond-orbitals-canvas" },
  { route: "/module/pi-bond-orbitals", viewer: "pi-bond-orbitals-viewer", stage: "pi-bond-orbitals-canvas" },
  { route: "/module/hybrid-orbitals-sp", viewer: "hybrid-orbitals-sp-viewer", stage: "hybrid-orbitals-sp-canvas" },
  { route: "/module/ionic-bond-formation", viewer: "ionic-bond-formation-viewer", stage: "ionic-bond-formation-canvas" },
  { route: "/module/coordinate-bond-formation", viewer: "coordinate-bond-formation-viewer", stage: "coordinate-bond-formation-canvas" },
  { route: "/module/organic-coplanar", viewer: "organic-coplanar-viewer", stage: "organic-coplanar-canvas" },
  { route: "/module/ethylene-planar", viewer: "ethylene-planar-viewer", stage: "ethylene-planar-canvas" },
  { route: "/module/benzene-planar", viewer: "benzene-planar-viewer", stage: "benzene-planar-canvas" },
  { route: "/module/acetylene-linear", viewer: "acetylene-linear-viewer", stage: "acetylene-linear-canvas" },
  { route: "/module/nacl-crystal", viewer: "nacl-viewer", stage: "nacl-canvas" },
  { route: "/module/cscl-crystal", viewer: "cscl-viewer", stage: "cscl-canvas" },
  { route: "/module/sodium-metal-crystal", viewer: "sodium-metal-viewer", stage: "sodium-metal-canvas" },
  { route: "/module/diamond-crystal", viewer: "diamond-viewer", stage: "diamond-canvas" },
  { route: "/module/graphite-structure", viewer: "graphite-viewer", stage: "graphite-canvas" },
  { route: "/module/hbn-structure", viewer: "hbn-viewer", stage: "hbn-canvas" },
  { route: "/module/zinc-metal-crystal", viewer: "zinc-metal-viewer", stage: "zinc-metal-canvas" },
  { route: "/module/tetrahedral-voids", viewer: "tetrahedral-voids-viewer", stage: "tetrahedral-voids-canvas" },
  { route: "/module/octahedral-voids", viewer: "octahedral-voids-viewer", stage: "octahedral-voids-canvas" },
  { route: "/module/pba-prussian-blue-analogues", viewer: "pba-viewer", stage: "pba-canvas" },
  { route: "/module/batio3-perovskite", viewer: "batio3-viewer", stage: "batio3-canvas" },
  { route: "/module/metal-close-packing", viewer: "metal-close-packing-viewer", stage: "metal-close-packing-canvas" },
  { route: "/module/zns-polytypes", viewer: "zns-viewer", stage: "zns-canvas" },
  { route: "/module/mof-metal-organic-framework", viewer: "mof5-viewer", stage: "mof5-canvas" },
  { route: "/module/mxene-2d-material", viewer: "mxene-viewer", stage: "mxene-canvas" },
  { route: "/module/ren3-high-pressure-nitride", viewer: "ren3-viewer", stage: "ren3-canvas" },
] as const;

const bondingBasicsMobileViewers = [
  {
    route: "/module/hybrid-orbitals-sp",
    viewer: "hybrid-orbitals-sp-viewer",
    stage: "hybrid-orbitals-sp-canvas",
    modes: [
      { testId: "bonding-basics-mode-sp", labels: ["sp 杂化模拟", "180°", "未杂化 p 轨道 ×2"] },
      { testId: "bonding-basics-mode-sp2", labels: ["sp² 杂化模拟", "120°", "未杂化 p 轨道 ×1"] },
      { testId: "bonding-basics-mode-sp3", labels: ["sp³ 杂化模拟", "109.5°", "无未杂化 p 轨道"] },
    ],
  },
  {
    route: "/module/ionic-bond-formation",
    viewer: "ionic-bond-formation-viewer",
    stage: "ionic-bond-formation-canvas",
    modes: [
      { testId: "bonding-basics-mode-transfer", labels: ["金属原子", "非金属原子", "电子转移形成离子"] },
      { testId: "bonding-basics-mode-attraction", labels: ["阳离子", "阴离子", "异号电荷静电吸引"] },
      { testId: "bonding-basics-mode-lattice", labels: ["阳离子", "阴离子", "阴阳离子交替排列"] },
    ],
  },
  {
    route: "/module/coordinate-bond-formation",
    viewer: "coordinate-bond-formation-viewer",
    stage: "coordinate-bond-formation-canvas",
    modes: [
      { testId: "bonding-basics-mode-donor", labels: ["提供体", "接受体", "孤对电子", "指向空轨道"] },
      { testId: "bonding-basics-mode-overlap", labels: ["提供体", "接受体", "孤对电子", "指向空轨道"] },
      { testId: "bonding-basics-mode-formed", labels: ["提供体", "接受体", "孤对电子", "形成配位键"] },
    ],
  },
] as const;

async function expectVisibleStageLabel(stage: Locator, label: string) {
  const labelLocator = stage.getByText(label, { exact: true });
  await expect(labelLocator.first()).toBeVisible();
}

async function setRangeValue(slider: Locator, value: number) {
  await slider.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeSetter?.call(input, String(nextValue));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function expectStageScreenshotHasDetail(stage: Locator) {
  const screenshot = await stage.screenshot();
  const image = decodePng(screenshot);
  const [baseR, baseG, baseB] = image.pixels;
  let detailedPixels = 0;

  for (let i = 0; i < image.pixels.length; i += 4) {
    const diff =
      Math.abs(image.pixels[i] - baseR) +
      Math.abs(image.pixels[i + 1] - baseG) +
      Math.abs(image.pixels[i + 2] - baseB);
    if (diff > 35) {
      detailedPixels += 1;
    }
  }

  expect(detailedPixels).toBeGreaterThan(image.width * image.height * 0.01);
}

function decodePng(buffer: Buffer) {
  const signature = buffer.subarray(0, 8);
  expect(signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  expect(bitDepth).toBe(8);
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  expect(bytesPerPixel).toBeGreaterThan(0);

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const stride = width * bytesPerPixel;
  const raw = new Uint8Array(height * stride);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset];
    readOffset += 1;

    const rowStart = y * stride;
    const previousRowStart = rowStart - stride;
    for (let x = 0; x < stride; x += 1) {
      const rawValue = inflated[readOffset + x];
      const left = x >= bytesPerPixel ? raw[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? raw[previousRowStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? raw[previousRowStart + x - bytesPerPixel] : 0;

      let value = rawValue;
      if (filter === 1) {
        value += left;
      } else if (filter === 2) {
        value += up;
      } else if (filter === 3) {
        value += Math.floor((left + up) / 2);
      } else if (filter === 4) {
        value += paethPredictor(left, up, upperLeft);
      }
      raw[rowStart + x] = value & 0xff;
    }

    readOffset += stride;
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let source = 0, target = 0; source < raw.length; source += bytesPerPixel, target += 4) {
    pixels[target] = raw[source];
    pixels[target + 1] = raw[source + 1];
    pixels[target + 2] = raw[source + 2];
    pixels[target + 3] = bytesPerPixel === 4 ? raw[source + 3] : 255;
  }

  return { height, pixels, width };
}

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
}

test.describe("真实 3D Viewer 三段式布局", () => {
  for (const item of viewers) {
    test(`${item.route} 顶部、Canvas、底部按文档流排列`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto(item.route);

      const viewer = page.getByTestId(item.viewer);
      const topbar = page.getByTestId(`${item.viewer}-topbar`);
      const stage = page.getByTestId(item.stage);
      const summary = page.getByTestId(`${item.viewer}-summary`);

      await expect(viewer).toBeVisible({ timeout: 15_000 });
      await expect(stage).toBeVisible();
      await expect(topbar).toBeVisible();
      await expect(summary).toBeVisible();

      const [topbarBox, stageBox, summaryBox] = await Promise.all([
        topbar.boundingBox(),
        stage.boundingBox(),
        summary.boundingBox(),
      ]);

      expect(topbarBox).not.toBeNull();
      expect(stageBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(stageBox!.y + 1);
      expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
      expect(stageBox!.height).toBeGreaterThan(200);

      const hasHorizontalOverflow = await viewer.evaluate(
        (element) => element.scrollWidth > element.clientWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test("390px 下普通分子、专题和晶体 Viewer 不覆盖 Canvas", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });

    for (const item of [viewers[2], viewers[5], viewers[9]]) {
      await page.goto(item.route);
      const viewer = page.getByTestId(item.viewer);
      const stage = page.getByTestId(item.stage);
      const summary = page.getByTestId(`${item.viewer}-summary`);

      await expect(viewer).toBeVisible();
      await expect(stage).toBeVisible();
      await expect(summary).toBeVisible();

      const [stageBox, summaryBox] = await Promise.all([
        stage.boundingBox(),
        summary.boundingBox(),
      ]);
      expect(stageBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
      expect(stageBox!.height).toBeGreaterThan(200);
    }
  });

  test("杂化轨道 Viewer 在桌面和手机下渲染非空 Canvas", async ({ page }) => {
    test.setTimeout(60_000);

    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/module/hybrid-orbitals-sp");
      const stage = page.getByTestId("hybrid-orbitals-sp-canvas");

      await expect(stage.locator("canvas")).toBeVisible();
      await expect(page.getByTestId("hybrid-progress-slider")).toBeVisible();
      await expect(page.getByTestId("hybrid-render-solid")).toBeVisible();
      await expect(page.getByTestId("hybrid-render-cloud")).toBeVisible();
      await page.waitForTimeout(300);
      await expectStageScreenshotHasDetail(stage);
    }
  });

  test("杂化轨道专题可切换进度和实体/电子云视图", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/hybrid-orbitals-sp");

    const stage = page.getByTestId("hybrid-orbitals-sp-canvas");
    const progressSlider = page.getByTestId("hybrid-progress-slider");
    await expect(progressSlider).toBeVisible();

    await setRangeValue(progressSlider, 0);
    await expect(page.getByTestId("hybrid-progress-value")).toHaveText("0%");
    await expectVisibleStageLabel(stage, "0% 杂化");
    await expectVisibleStageLabel(stage, "s 轨道");
    await expectVisibleStageLabel(stage, "p 轨道");
    await expect(stage.getByText("主瓣", { exact: true })).toHaveCount(0);
    await expect(stage.getByText("副瓣", { exact: true })).toHaveCount(0);
    await page.waitForTimeout(300);
    await expect(stage).toHaveScreenshot("hybrid-orbitals-source-state-viewer.png", {
      maxDiffPixelRatio: 0.005,
    });

    await setRangeValue(progressSlider, 45);
    await expect(page.getByTestId("hybrid-progress-value")).toHaveText("45%");
    await expectVisibleStageLabel(stage, "45% 杂化");

    await page.getByTestId("hybrid-render-cloud").click();
    await expect(page.getByTestId("hybrid-footer-meta")).toContainText("电子云");
    await expectStageScreenshotHasDetail(stage);

    await page.getByTestId("hybrid-render-solid").click();
    await expect(page.getByTestId("hybrid-footer-meta")).toContainText("实体轨道");
  });

  test.describe("新增成键基础模块 390px 手机宽度", () => {
    for (const item of bondingBasicsMobileViewers) {
      test(`${item.route} viewer 与 3D 标注保持可读`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(item.route);

        const viewer = page.getByTestId(item.viewer);
        const topbar = page.getByTestId(`${item.viewer}-topbar`);
        const stage = page.getByTestId(item.stage);
        const summary = page.getByTestId(`${item.viewer}-summary`);

        await expect(viewer).toBeVisible();
        await expect(topbar).toBeVisible();
        await expect(stage).toBeVisible();
        await expect(stage.locator("canvas")).toBeVisible();
        await expect(summary).toBeVisible();

        if (item.route === "/module/hybrid-orbitals-sp") {
          await expect(page.getByTestId("hybrid-progress-slider")).toBeVisible();
          await expect(page.getByTestId("hybrid-render-solid")).toBeVisible();
          await expect(page.getByTestId("hybrid-render-cloud")).toBeVisible();
          await expect(page.getByTestId("hybrid-toggle-unhybridized-p")).toBeVisible();
        }

        const [topbarBox, stageBox, summaryBox] = await Promise.all([
          topbar.boundingBox(),
          stage.boundingBox(),
          summary.boundingBox(),
        ]);

        expect(topbarBox).not.toBeNull();
        expect(stageBox).not.toBeNull();
        expect(summaryBox).not.toBeNull();
        expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(stageBox!.y + 1);
        expect(stageBox!.y + stageBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
        expect(stageBox!.height).toBeGreaterThan(320);

        const hasPageHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        const hasViewerHorizontalOverflow = await viewer.evaluate(
          (element) => element.scrollWidth > element.clientWidth + 1,
        );
        expect(hasPageHorizontalOverflow).toBe(false);
        expect(hasViewerHorizontalOverflow).toBe(false);

        for (const mode of item.modes) {
          const modeButton = page.getByTestId(mode.testId);
          await expect(modeButton).toBeVisible();
          await modeButton.click();
          await page.evaluate(() => window.scrollTo(0, 0));

          for (const label of mode.labels) {
            await expectVisibleStageLabel(stage, label);
          }
        }
      });
    }
  });
});
