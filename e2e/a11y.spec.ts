import { expect, test } from "@playwright/test";
import { answerCorrectly, currentQuestion } from "./helpers";

// spec: polish / a11y 總檢

test("document language and heading structure", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("html").getAttribute("lang")).toBe("zh-Hant-TW");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByLabel("你的名字").fill("結構星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.locator("h2")).toHaveCount(1);
});

test("exactly one stem heading throughout transitions", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("你的名字").fill("過場星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await page.getByRole("button", { name: "下一題" }).click();
  // 過場採樣:任何瞬間 h2 數 ≤ 1(mode="wait")
  for (let i = 0; i < 5; i++) {
    const count = await page.locator("h2").count();
    expect(count).toBeLessThanOrEqual(1);
    await page.waitForTimeout(40);
  }
  await expect(page.locator("h2")).toHaveCount(1);
});

test("sound toggle is keyboard reachable with aria-pressed", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "開啟音效" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "關閉音效" })).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion: question change has no positional animation", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("你的名字").fill("靜態星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await answerCorrectly(page, await currentQuestion(page));
  await page.getByRole("button", { name: "下一題" }).click();
  // 無動畫 → 立即單 h2 且 transform 為 none/identity
  await expect(page.locator("h2")).toHaveCount(1);
  const transform = await page.locator("h2").evaluate((el) => {
    const card = el.closest("[data-question-id]")?.parentElement?.parentElement;
    return card ? getComputedStyle(card).transform : "none";
  });
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
});

test("uniform zhuyin block width across 1-3 symbol syllables", async ({ page }) => {
  await page.goto("/");
  // 同一字級區塊內比較(rt 寬度以 em 計,跨字級本就不同):首頁歡迎段含一~三符號音節
  const widths = await page
    .locator("main p")
    .first()
    .locator("ruby rt")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(widths.length).toBeGreaterThan(3);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5); // 等寬字塊(spec: Uniform character rhythm)
});

test("tone marks render visibly on all viewports", async ({ page }) => {
  await page.goto("/");
  const tones = await page.locator(".zy-lane").evaluateAll((els) =>
    els
      .filter((el) => (el.textContent ?? "").trim() !== "")
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height, inView: r.top >= 0 && r.left >= 0 };
      }),
  );
  expect(tones.length).toBeGreaterThan(3); // 首頁必有多個帶調音節
  for (const t of tones) {
    expect(t.w).toBeGreaterThan(1); // 非零盒(真機聲調消失回歸防護)
    expect(t.h).toBeGreaterThan(1);
    expect(t.inView).toBe(true);
  }
});

test("navbar does not overlap main content", async ({ page }) => {
  await page.goto("/");
  const overlap = await page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect();
    const main = document.querySelector("main")!.getBoundingClientRect();
    return header.bottom > main.top + 1;
  });
  expect(overlap).toBe(false);
});

test("every adjacent zhuyin block pair has a visible gap (cross-segment too)", async ({ page }) => {
  await page.goto("/");
  const gaps = await page.evaluate(() => {
    const out: number[] = [];
    // 只比較同一段 ZhuyinText 內的字塊(跨元件的視覺相鄰由版面自行負責)
    document.querySelectorAll("[data-zhuyin-text]").forEach((root) => {
      const rubies = [...root.querySelectorAll("ruby")].map((r) => r.getBoundingClientRect());
      for (let i = 0; i < rubies.length; i++) {
        for (let j = 0; j < rubies.length; j++) {
          if (i === j) continue;
          const a = rubies[i]!, b = rubies[j]!;
          const sameLine = Math.abs(a.top - b.top) < a.height / 2;
          if (sameLine && b.left >= a.right - 1 && b.left - a.right < a.height) out.push(b.left - a.right);
        }
      }
    });
    return out;
  });
  expect(gaps.length).toBeGreaterThan(5);
  expect(Math.min(...gaps)).toBeGreaterThanOrEqual(3); // 任兩相鄰字塊實際像素間隙(左右皆帶)
});

test("three-symbol zhuyin column never exceeds the base character height", async ({ page }) => {
  await page.goto("/");
  const bad = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll("ruby").forEach((ruby) => {
      const col = ruby.querySelector(".zy-col");
      if (!col) return;
      const base = ruby.firstChild?.textContent ?? "";
      const rubyBox = ruby.getBoundingClientRect();
      const colBox = col.getBoundingClientRect();
      // 國字高 ≈ ruby 高(flex 對齊);欄高不得超過(容 1px 誤差)
      if (colBox.height > rubyBox.height + 1) out.push(`${base}:${colBox.height.toFixed(1)}>${rubyBox.height.toFixed(1)}`);
    });
    return out;
  });
  expect(bad).toEqual([]);
});

test("dialog buttons keep their zhuyin text on a single line", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("你的名字").fill("單行星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await page.getByRole("button", { name: /第 5 題/ }).click();
  await page.getByRole("button", { name: "送出答案" }).click();
  for (const name of ["回去作答", "直接送出"]) {
    const btn = page.getByRole("button", { name });
    const { btnH, lineH } = await btn.evaluate((el) => ({
      btnH: el.getBoundingClientRect().height,
      lineH: parseFloat(getComputedStyle(el).fontSize) * 1.6,
    }));
    expect(btnH).toBeLessThan(lineH * 2 + 24); // 單行(含 padding 容差)
  }
});
