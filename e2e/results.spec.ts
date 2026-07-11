import { expect, test, type Page } from "@playwright/test";
import { answerCorrectly, currentQuestion } from "./helpers";


async function playPerfect(page: Page, name: string) {
  await page.goto("/");
  await page.getByLabel("你的名字").fill(name);
  await page.getByRole("button", { name: "開始測驗" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await answerCorrectly(page, await currentQuestion(page));
    if (i < 4) await page.getByRole("button", { name: "下一題" }).click();
  }
  await page.getByRole("button", { name: "送出答案" }).click();
}

test("perfect run: 5/5, highlight on board, confetti canvas, review all correct", async ({ page }) => {
  await playPerfect(page, "滿分星");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("滿天星");
  await expect(page.getByText("5/5").first()).toBeVisible();
  await expect(page.getByText("(你)")).toBeVisible();
  await expect(page.getByText("答對了!")).toHaveCount(5);
  await expect(page.locator("canvas")).toHaveCount(1); // confetti 已注入
  await expect(page.getByText("示範").first()).toBeVisible(); // demo 標示
});

test("result page reload keeps score and highlight, no duplicate entry", async ({ page }) => {
  await playPerfect(page, "重整星");
  await expect(page.getByText("(你)")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("滿天星");
  await expect(page.getByText("(你)")).toHaveCount(1);
});

test("play again returns to start with new record in preview", async ({ page }) => {
  await playPerfect(page, "預覽星");
  await page.getByRole("button", { name: "再玩一次" }).click();
  await expect(page.getByRole("button", { name: "開始測驗" })).toBeVisible();
  await expect(page.getByText("今夜排行榜")).toBeVisible();
  await expect(page.getByText("預覽星")).toBeVisible(); // 滿分必在前五
});

test("zero-effort submit shows gentle tier without confetti", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("你的名字").fill("溫柔星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await page.getByRole("button", { name: /第 5 題/ }).click();
  await page.getByRole("button", { name: "送出答案" }).click();
  await page.getByRole("button", { name: "直接送出" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("先別灰心");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByText("(沒有作答)").first()).toBeVisible();
});
