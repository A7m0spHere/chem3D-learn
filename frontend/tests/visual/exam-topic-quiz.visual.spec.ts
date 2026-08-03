import { expect, test } from "@playwright/test";

test.describe("晶胞均摊轻量自测", () => {
  test("键盘作答后立即反馈，并支持逐题和整组重试", async ({ page }) => {
    await page.goto("/exam/exam-crystal-formula");

    const quiz = page.getByTestId("exam-topic-quiz");
    const edgeQuestion = page.getByTestId("quiz-question-edge-contribution");
    const occupancyQuestion = page.getByTestId("quiz-question-average-occupancy");
    const formulaQuestion = page.getByTestId("quiz-question-simplest-formula");

    await expect(quiz.getByRole("heading", { name: "三步自测：从位置到化学式" })).toBeVisible();
    await expect(quiz.getByRole("group")).toHaveCount(3);
    await expect(page.getByTestId("quiz-progress")).toHaveText("已作答 0/3 · 答对 0 题");

    const edgeOptions = edgeQuestion.getByRole("radio");
    await edgeOptions.nth(0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(edgeOptions.nth(1)).toBeChecked();
    await expect(edgeQuestion.getByRole("status")).toContainText("回答正确");
    await expect(edgeQuestion.getByRole("status")).toContainText("由相邻 4 个晶胞共享");

    await edgeQuestion.getByRole("button", { name: "重试第 1 题" }).click();
    await expect(edgeQuestion.getByRole("status")).toHaveCount(0);
    await expect(edgeOptions.nth(1)).not.toBeChecked();

    await occupancyQuestion.getByRole("radio", { name: "9 个" }).check();
    await expect(occupancyQuestion.getByRole("status")).toContainText("回答错误");
    await expect(occupancyQuestion.getByRole("status")).toContainText("画面中的位置数");
    await occupancyQuestion.getByRole("radio", { name: "2 个" }).check();
    await expect(occupancyQuestion.getByRole("status")).toContainText("回答正确");

    await edgeQuestion.getByRole("radio", { name: "1/4" }).check();
    await formulaQuestion.getByRole("radio", { name: "AB₃" }).check();
    await expect(page.getByTestId("quiz-progress")).toHaveText("已作答 3/3 · 答对 3 题");

    await quiz.getByRole("button", { name: "重新练习全部题目" }).click();
    await expect(page.getByTestId("quiz-progress")).toHaveText("已作答 0/3 · 答对 0 题");
    await expect(quiz.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(quiz.getByRole("status")).toHaveCount(0);
  });

  test("只在目标专题出现，并在 390px 下保持可读和可触控", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/exam/exam-crystal-formula");

    const quiz = page.getByTestId("exam-topic-quiz");
    await expect(quiz).toBeVisible();
    await expect(quiz.getByRole("radio")).toHaveCount(12);

    const optionLabels = quiz.locator("label");
    for (let index = 0; index < await optionLabels.count(); index += 1) {
      const box = await optionLabels.nth(index).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await quiz.getByRole("radio", { name: "A₈B₆" }).check();
    await expect(quiz.getByRole("status")).toContainText("回答错误");
    await expect(quiz.getByRole("button", { name: "重试第 3 题" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/exam/exam-coordination-number");
    await expect(page.getByTestId("exam-topic-quiz")).toHaveCount(0);
  });
});
