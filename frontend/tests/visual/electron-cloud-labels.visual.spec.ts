import { expect, test } from "@playwright/test";

test.describe("电子云演示与标签", () => {
  test("杂化轨道的电子云视图说明采样点密度", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/hybrid-orbitals-sp");

    await page.getByTestId("hybrid-render-cloud").click();

    await expect(page.getByTestId("hybrid-cloud-density-legend")).toHaveText("采样点表示电子云密度");
  });

  test("电负性示意将电子云标签独立显示", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/module/polarity-judgment");

    const cloudLabel = page.getByTestId("electron-cloud-density-label");
    const electronegativityHint = page.getByTestId("electronegativity-hint-label");
    await expect(cloudLabel).toHaveText("电子云偏向 F");
    await expect(cloudLabel).toBeVisible();
    await expect(electronegativityHint).toHaveText("F 更吸电子");
    await expect(electronegativityHint).toBeVisible();

    const [cloudLabelBox, electronegativityHintBox] = await Promise.all([
      cloudLabel.boundingBox(),
      electronegativityHint.boundingBox(),
    ]);

    expect(cloudLabelBox).not.toBeNull();
    expect(electronegativityHintBox).not.toBeNull();
    expect(electronegativityHintBox!.x + electronegativityHintBox!.width + 4).toBeLessThanOrEqual(cloudLabelBox!.x);
  });
});
