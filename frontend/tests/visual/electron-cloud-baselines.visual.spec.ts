import { expect, test, type Page } from "@playwright/test";

type ElectronCloudScenario = {
  id: string;
  title: string;
  route: string;
  stageTestId: string;
  prepare: (page: Page) => Promise<void>;
};

const electronCloudScenarios: ElectronCloudScenario[] = [
  {
    id: "01-nh3-lone-pair",
    title: "NH3 孤电子对",
    route: "/module/pyramidal-nh3",
    stageTestId: "molecule-viewer-canvas",
    prepare: async (page) => {
      await page.getByTestId("molecule-toggle-lone-pairs").click();
      await expect(page.getByTestId("molecule-viewer-canvas").getByText("孤电子对", { exact: true })).toBeVisible();
    },
  },
  {
    id: "02-h2o-lone-pairs",
    title: "H2O 两对孤电子对",
    route: "/module/v-shape-h2o",
    stageTestId: "molecule-viewer-canvas",
    prepare: async (page) => {
      await page.getByTestId("molecule-toggle-lone-pairs").click();
      await expect(page.getByTestId("molecule-viewer-canvas").getByText("孤电子对", { exact: true })).toBeVisible();
    },
  },
  {
    id: "03-organic-amine-lone-pair",
    title: "胺基孤电子对",
    route: "/module/organic-coplanar",
    stageTestId: "organic-coplanar-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "胺基" }).click();
      await expect(page.getByTestId("organic-coplanar-canvas").getByText("NH2 · 空间示意", { exact: true })).toBeVisible();
    },
  },
  {
    id: "04-coordinate-bond-lone-pair",
    title: "配位键孤对电子",
    route: "/module/coordinate-bond-formation",
    stageTestId: "coordinate-bond-formation-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "提供体" }).click();
      await expect(page.getByTestId("coordinate-bond-formation-canvas").getByText("孤对电子", { exact: true })).toBeVisible();
    },
  },
  {
    id: "05-sigma-orbital-overlap",
    title: "s-p σ 键轨道重叠",
    route: "/module/sigma-bond-orbitals",
    stageTestId: "sigma-bond-orbitals-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "s-p σ 键" }).click();
      await page.getByRole("button", { exact: true, name: "标注" }).click();
      await expect(page.getByTestId("sigma-bond-orbitals-canvas").getByText("s-p 头碰头重叠", { exact: true })).toBeVisible();
    },
  },
  {
    id: "06-pi-orbital-cloud",
    title: "p-p π 电子云",
    route: "/module/pi-bond-orbitals",
    stageTestId: "pi-bond-orbitals-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "成键后" }).click();
      await page.getByRole("button", { exact: true, name: "标注" }).click();
      await expect(page.getByTestId("pi-bond-orbitals-canvas").getByText("π 电子云", { exact: true })).toBeVisible();
    },
  },
  {
    id: "07-hybrid-orbital-cloud",
    title: "杂化轨道采样点云",
    route: "/module/hybrid-orbitals-sp",
    stageTestId: "hybrid-orbitals-sp-canvas",
    prepare: async (page) => {
      await page.getByTestId("hybrid-render-cloud").click();
      await expect(page.getByTestId("hybrid-cloud-density-legend")).toHaveText("采样点表示电子云密度");
    },
  },
  {
    id: "08-bond-polarity-cloud",
    title: "键极性电子云偏移",
    route: "/module/polarity-judgment",
    stageTestId: "molecular-polarity-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "电负性" }).click();
      await expect(page.getByTestId("electron-cloud-density-label")).toBeVisible();
    },
  },
  {
    id: "09-ethylene-pi-cloud",
    title: "乙烯 π 电子云",
    route: "/module/ethylene-planar",
    stageTestId: "ethylene-planar-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "π 键" }).click();
      await expect(page.getByTestId("ethylene-planar-viewer").getByText("C=C 双键｜1 个 σ 键 + 1 个 π 键", { exact: true })).toBeVisible();
    },
  },
  {
    id: "10-benzene-delocalized-pi-cloud",
    title: "苯环离域 π 电子云",
    route: "/module/benzene-planar",
    stageTestId: "benzene-planar-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "大 π 键" }).click();
      await expect(page.getByTestId("benzene-pi-label")).toBeVisible();
    },
  },
  {
    id: "11-acetylene-two-pi-clouds",
    title: "乙炔两组 π 电子云",
    route: "/module/acetylene-linear",
    stageTestId: "acetylene-linear-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "π 键" }).click();
      await expect(page.getByTestId("acetylene-linear-viewer").getByText("C≡C 三键｜两组互相垂直的 π 键", { exact: true })).toBeVisible();
    },
  },
  {
    id: "12-graphite-delocalized-pi-cloud",
    title: "石墨离域 π 电子云",
    route: "/module/graphite-structure",
    stageTestId: "graphite-canvas",
    prepare: async (page) => {
      await page.getByRole("button", { exact: true, name: "离域 π 电子" }).click();
      await expect(page.getByTestId("graphite-viewer").getByText("C｜离域 π 电子", { exact: true })).toBeVisible();
    },
  },
];

test.describe("电子云场景统一视觉基线", () => {
  for (const scenario of electronCloudScenarios) {
    test(scenario.title, async ({ page }) => {
      test.setTimeout(90_000);

      await page.goto(scenario.route);
      await page.addStyleTag({ content: "header { display: none !important; }" });
      await scenario.prepare(page);

      const stage = page.getByTestId(scenario.stageTestId);
      const canvas = stage.locator("canvas");
      await expect(canvas).toBeVisible();
      await page.waitForTimeout(800);
      await canvas.evaluate((element) => {
        const root = (
          element as HTMLCanvasElement & {
            __r3f?: { root?: { getState?: () => { invalidate?: () => void } } };
          }
        ).__r3f?.root;
        root?.getState?.().invalidate?.();
      });
      await page.waitForTimeout(200);
      await expect(stage).toHaveScreenshot(`${scenario.id}.png`, { timeout: 20_000 });
    });
  }
});
