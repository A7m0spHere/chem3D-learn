import { expect, test } from "@playwright/test";

test.describe("能力扩展专题接线", () => {
  test("exam-diamond-si 从考试卡片进入详情页并连到金刚石 3D 模块", async ({ page }) => {
    await page.goto("/exam");

    const diamondCard = page.locator("article").filter({ hasText: "金刚石与单晶硅" });
    const detailLink = diamondCard.getByRole("link", { name: /进入专题/ });

    await expect(diamondCard).toBeVisible();
    await expect(diamondCard.getByText("已开放", { exact: true })).toBeVisible();
    await expect(detailLink).toHaveAttribute("href", "/exam/exam-diamond-si");

    await detailLink.click();

    await expect(page).toHaveURL(/\/exam\/exam-diamond-si$/);
    await expect(page.getByRole("heading", { level: 1, name: "金刚石与单晶硅" })).toBeVisible();
    await expect(page.getByText("配位数 = 4 · 键角约 109.5°", { exact: true })).toBeVisible();
    await expect(page.getByText("N 个原子 → 4N / 2 = 2N 条共价键", { exact: true })).toBeVisible();

    const relatedModuleLink = page.getByRole("link", { name: /金刚石晶体结构/ });
    await expect(relatedModuleLink).toBeVisible();
    await expect(relatedModuleLink).toHaveAttribute("href", "/module/diamond-crystal");

    await relatedModuleLink.click();

    await expect(page).toHaveURL(/\/module\/diamond-crystal$/);
    await expect(page.getByText("正四面体配位的共价晶体", { exact: true })).toBeVisible();
  });
});
