import { expect, test, type Locator } from "@playwright/test";
import { inflateSync } from "node:zlib";

test.describe("晶体与空隙 Viewer 模式摘要", () => {
  test("NaCl 配位与计数结论位于 Viewer 外壳", async ({ page }) => {
    await page.goto("/module/nacl-crystal");
    const viewer = page.getByTestId("nacl-viewer");

    await page.getByRole("button", { exact: true, name: "六配位" }).click();
    await expect(viewer.getByText("NaCl｜最近邻配位关系", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "粒子计数" }).click();
    await expect(viewer.getByText("NaCl｜均摊法计数", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText("突出顶点、面心、棱心、体心位置，配合右侧公式理解 4 : 4。", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("石墨层间作用说明不覆盖 Canvas", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "层间作用力" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜较弱的范德华力", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText(
        "层间虚线只表示较弱的范德华力，不是普通 C-C 共价键。层与层之间容易相对滑动，可解释石墨较软、有润滑性。",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("石墨离域 π 电子云有独立视觉快照", async ({ page }) => {
    await page.goto("/module/graphite-structure");
    await page.getByRole("button", { exact: true, name: "离域 π 电子" }).click();

    const viewer = page.getByTestId("graphite-viewer");
    const canvasArea = page.getByTestId("graphite-canvas");
    await expect(viewer.getByText("C｜层内离域 π 电子", { exact: true })).toBeVisible();
    await expect(
      viewer.getByText(
        "每个 C 原子还有未参与 sp² 杂化的 p 轨道，形成层内离域 π 电子体系。电子可沿碳层移动，因此石墨能导电。",
        { exact: true },
      ),
    ).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("graphite-pi-electron-cloud-viewer.png");
  });

  test("h-BN 支持 B/N 交替、层间作用力和对比石墨模式", async ({ page }) => {
    await page.goto("/module/hbn-structure");

    const viewer = page.getByTestId("hbn-viewer");
    const canvasArea = page.getByTestId("hbn-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("BN｜B/N 交替层状结构", { exact: true })).toBeVisible();
    const hbnGuide = page.getByTestId("observation-guide-card");
    await expect(hbnGuide.getByText("课堂观察顺序", { exact: true })).toBeVisible();
    await expect(hbnGuide.locator("article")).toHaveCount(4);
    await expect(hbnGuide.getByText("先看 B/N 交替六元环", { exact: true })).toBeVisible();
    await expect(hbnGuide.getByText("再看层内 B-N 共价键", { exact: true })).toBeVisible();
    await expect(hbnGuide.getByText("接着区分层间弱相互作用", { exact: true })).toBeVisible();
    await expect(hbnGuide.getByText("最后对比石墨", { exact: true })).toBeVisible();
    await expect(
      hbnGuide.getByText("追问：如果把图中 B 和 N 全部改成 C，结构和导电性判断会发生什么变化？", {
        exact: true,
      }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "B-N 共价键" }).click();
    await expect(viewer.getByText("BN｜层内 B-N 共价键", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "层间作用力" }).click();
    await expect(viewer.getByText("BN｜层间弱相互作用", { exact: true })).toBeVisible();
    await expect(
      canvasArea.getByText(
        "层间虚线表示较弱相互作用。与石墨一样，层与层之间不是普通共价键，但 B/N 交替会带来不同的上下层对应方式。",
        { exact: true },
      ),
    ).toHaveCount(0);

    await page.getByRole("button", { exact: true, name: "对比石墨" }).click();
    await expect(viewer.getByText("BN｜像石墨，但不是石墨", { exact: true })).toBeVisible();
    await expect(page.getByText("h-BN 通常绝缘，石墨可导电。", { exact: true })).toBeVisible();
    await expect(page.getByText("B-N 共价键，有极性", { exact: true })).toBeVisible();
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("h-BN 在 390px 手机宽度下 viewer 非空且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/hbn-structure");

    const viewer = page.getByTestId("hbn-viewer");
    const topbar = page.getByTestId("hbn-viewer-topbar");
    const canvasArea = page.getByTestId("hbn-canvas");
    const summary = page.getByTestId("hbn-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

    const [topbarBox, canvasBox, summaryBox] = await Promise.all([
      topbar.boundingBox(),
      canvasArea.boundingBox(),
      summary.boundingBox(),
    ]);

    expect(topbarBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(canvasBox!.y + 1);
    expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("Zn 分层模式和四面体空隙计数使用底部信息区", async ({ page }) => {
    await page.goto("/module/zinc-metal-crystal");
    await page.getByRole("button", { exact: true, name: "分层堆积" }).click();
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("Zn｜A-B-A 层状堆积", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { exact: true, name: "堆积模型" }).click();
    await expect(
      page.getByTestId("zinc-metal-viewer").getByText("堆积模型 · 拖拽旋转", { exact: true }),
    ).toBeVisible();

    await page.goto("/module/tetrahedral-voids");
    await page.getByRole("button", { exact: true, name: "计数" }).click();
    const viewer = page.getByTestId("tetrahedral-voids-viewer");
    await expect(viewer.getByText("四面体空隙：2N", { exact: true })).toBeVisible();
    await expect(
      page.getByTestId("tetrahedral-voids-canvas").getByText("四面体空隙：2N", {
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("PBA 模块支持框架、配位、空位水合和结构类比模式", async ({ page }) => {
    await page.goto("/module/pba-prussian-blue-analogues");

    const viewer = page.getByTestId("pba-viewer");
    const canvasArea = page.getByTestId("pba-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("PBA｜双金属氰基桥联框架", { exact: true })).toBeVisible();
    const pbaGuide = page.getByTestId("observation-guide-card");
    await expect(pbaGuide.getByText("课堂观察顺序", { exact: true })).toBeVisible();
    await expect(pbaGuide.locator("article")).toHaveCount(5);
    await expect(pbaGuide.getByText("先找 M / M′ 两类金属节点", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("再看 M′(CN)₆ 八面体方向", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("切到空位水合，先保留理想桥联骨架", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("再看 □ 空位对组成变量的影响", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("最后看水和 A 位客体离子", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("建议切换到：空位水合 / 六氰空位", { exact: true })).toBeVisible();
    await expect(pbaGuide.getByText("建议切换到：空位水合 / 水合-A位", { exact: true })).toBeVisible();
    await expect(
      pbaGuide.getByText("追问：这张图里哪些部分是固定框架，哪些位置可能随样品组成改变？", {
        exact: true,
      }),
    ).toBeVisible();

    await page.getByRole("button", { exact: true, name: "配位骨架" }).click();
    await expect(viewer.getByText("PBA｜M′(CN)₆ 八面体方向", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "空位水合" }).click();
    await expect(viewer.getByText("PBA｜先看理想桥联骨架", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "六氰空位" }).click();
    await expect(viewer.getByText("PBA｜再看 □ 空位", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "水合/A位" }).click();
    await expect(viewer.getByText("PBA｜最后看水和客体离子", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "结构类比" }).click();
    await expect(viewer.getByText("PBA｜从普通晶胞到配位框架", { exact: true })).toBeVisible();
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("PBA 在 390px 手机宽度下 viewer 非空且不横向溢出", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/module/pba-prussian-blue-analogues");

    const viewer = page.getByTestId("pba-viewer");
    const topbar = page.getByTestId("pba-viewer-topbar");
    const canvasArea = page.getByTestId("pba-canvas");
    const summary = page.getByTestId("pba-viewer-summary");

    await expect(viewer).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(summary).toBeVisible();

    const [topbarBox, canvasBox, summaryBox] = await Promise.all([
      topbar.boundingBox(),
      canvasArea.boundingBox(),
      summary.boundingBox(),
    ]);

    expect(topbarBox).not.toBeNull();
    expect(canvasBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(topbarBox!.y + topbarBox!.height).toBeLessThanOrEqual(canvasBox!.y + 1);
    expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(summaryBox!.y + 1);
    expect(canvasBox!.height).toBeGreaterThan(200);

    const hasPageHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const hasViewerHorizontalOverflow = await viewer.evaluate(
      (element) => element.scrollWidth > element.clientWidth + 1,
    );
    expect(hasPageHorizontalOverflow).toBe(false);
    expect(hasViewerHorizontalOverflow).toBe(false);
    await expectCanvasAreaHasDetail(canvasArea);
  });

  test("CaF₂ 支持双配位、四面体空隙三阶段和反萤石对比模式", async ({ page }) => {
    await page.goto("/module/caf2-fluorite");

    const viewer = page.getByTestId("caf2-viewer");
    const canvasArea = page.getByTestId("caf2-canvas");
    await expect(viewer).toBeVisible();
    await expect(canvasArea.locator("canvas")).toBeVisible();
    await expect(viewer.getByText("CaF₂｜完整萤石晶胞", { exact: true })).toBeVisible();
    const caf2Guide = page.getByTestId("observation-guide-card");
    await expect(caf2Guide.getByText("自学观察顺序", { exact: true })).toBeVisible();
    await expect(caf2Guide.locator("article")).toHaveCount(4);
    await expect(caf2Guide.getByText("先看完整晶胞", { exact: true })).toBeVisible();
    await expect(caf2Guide.getByText("拆出 Ca²⁺ 骨架与四面体空隙", { exact: true })).toBeVisible();
    await expect(caf2Guide.getByText("分别数两种离子的配位数", { exact: true })).toBeVisible();
    await expect(caf2Guide.getByText("均摊计数并迁移到反萤石", { exact: true })).toBeVisible();
    await expect(
      caf2Guide.getByText(
        "自查：把 Ca²⁺ 与 F⁻ 的位置互换并换成 Li⁺ / O²⁻ 后，两种离子的配位数各是多少？化学式为什么变成 Li₂O？",
        { exact: true },
      ),
    ).toBeVisible();

    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("caf2-cell-viewer.png");

    await page.getByRole("button", { exact: true, name: "Ca²⁺ 8配位" }).click();
    await expect(viewer.getByText("CaF₂｜Ca²⁺ 的立方体 8 配位", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("caf2-ca-coordination-viewer.png");

    await page.getByRole("button", { exact: true, name: "F⁻ 4配位" }).click();
    await expect(viewer.getByText("CaF₂｜F⁻ 的四面体 4 配位", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "晶胞计数" }).click();
    await expect(viewer.getByText("CaF₂｜均摊法计数", { exact: true })).toBeVisible();

    await page.getByRole("button", { exact: true, name: "四面体空隙" }).click();
    await expect(viewer.getByText("CaF₂｜第一步：Ca²⁺ 面心立方骨架", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "显示空隙" }).click();
    await expect(viewer.getByText("CaF₂｜第二步：标出 8 个四面体空隙", { exact: true })).toBeVisible();
    await page.getByRole("button", { exact: true, name: "F⁻ 全部填入" }).click();
    await expect(viewer.getByText("CaF₂｜第三步：F⁻ 填满全部 8 个空隙", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("caf2-voids-filled-viewer.png");

    await page.getByRole("button", { exact: true, name: "反萤石对比" }).click();
    await expect(viewer.getByText("CaF₂｜反萤石：Li₂O 型结构", { exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    await expect(canvasArea).toHaveScreenshot("caf2-antifluorite-viewer.png");
    await expectCanvasAreaHasDetail(canvasArea);
  });
});

async function expectCanvasAreaHasDetail(canvasArea: Locator) {
  const screenshot = await canvasArea.screenshot();
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
