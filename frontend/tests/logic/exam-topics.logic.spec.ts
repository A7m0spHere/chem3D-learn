import { expect, test } from "@playwright/test";
import { examTopics } from "../../src/data/examTopics";

test("公开能力扩展目录只包含可进入的已开放专题", () => {
  expect(examTopics.map((topic) => topic.id)).not.toContain("exam-xeo");
  expect(examTopics).toHaveLength(16);

  for (const topic of examTopics) {
    expect(topic.status, `${topic.id} 应为已开放状态`).toBe("ready");
    expect(topic.route, `${topic.id} 应提供可进入链接`).toMatch(/^\/(exam|module)\//);
  }
});

test("公开专题分组数量与目录保持一致", () => {
  expect(examTopics.filter((topic) => topic.partition === "高频能力")).toHaveLength(5);
  expect(examTopics.filter((topic) => topic.partition === "高考真题结构")).toHaveLength(4);
  expect(examTopics.filter((topic) => topic.partition === "竞赛视野")).toHaveLength(7);
});
