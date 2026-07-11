import { test } from "@playwright/test";

const SHOT = process.env.SHOT_DIR ?? "test-results";

for (const theme of ["light", "dark"] as const) {
  for (const [w, h, tag] of [[375, 750, "mobile"], [1280, 800, "desktop"]] as const) {
    test(`shots ${theme} ${tag}`, async ({ browser }) => {
      const page = await browser.newPage({ colorScheme: theme, viewport: { width: w, height: h } });
      await page.goto("/");
      await page.waitForTimeout(350);
      await page.screenshot({ path: `${SHOT}/start-${theme}-${tag}.png` });
      await page.getByLabel("你的名字").fill("小星");
      await page.getByRole("button", { name: "開始測驗" }).click();
      await page.waitForTimeout(350);
      for (const [i, type] of ["single", "multi", "fill", "match", "image"].entries()) {
        await page.screenshot({ path: `${SHOT}/q-${type}-${theme}-${tag}.png` });
        if (i < 4) await page.getByRole("button", { name: "下一題" }).click();
        await page.waitForTimeout(250);
      }
    });
  }
}

import bankJson from "../src/data/questions.json" with { type: "json" };

const plainStem = (rich: Array<Array<{ t: string }>>) => rich.flatMap((s) => s.map((t) => t.t)).join("");

for (const theme of ["light", "dark"] as const) {
  test(`result shots ${theme}`, async ({ browser }) => {
    const page = await browser.newPage({ colorScheme: theme, viewport: { width: 375, height: 900 } });
    await page.goto("/");
    await page.getByLabel("你的名字").fill("截圖星");
    await page.getByRole("button", { name: "開始測驗" }).click();
    // 快速全對作答
    for (let i = 0; i < 5; i++) {
      const stem = (await page.getByRole("heading", { level: 2 }).textContent())!.replace(/[ㄅ-ㄩˊˇˋ˙\s]/g, "");
      const q = bankJson.questions.find((x) => plainStem(x.stem as never).replace(/\s/g, "") === stem)!;
      if (q.type === "single" || q.type === "image") await page.getByRole("radio").nth((q as { answer: number }).answer).click();
      else if (q.type === "multi") for (const j of (q as { answer: number[] }).answer) await page.getByRole("checkbox").nth(j).click();
      else if (q.type === "fill") await page.getByRole("textbox").fill((q as { accept: string[] }).accept[0]!);
      else {
        const ans = (q as { answer: number[] }).answer;
        for (let li = 0; li < ans.length; li++) {
          await page.getByTestId("match-left").getByRole("button").nth(li).click();
          await page.getByTestId("match-right").getByRole("button").nth(ans[li]!).click();
        }
      }
      if (i < 4) await page.getByRole("button", { name: "下一題" }).click();
    }
    await page.getByRole("button", { name: "送出答案" }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOT}/result-perfect-${theme}.png`, fullPage: true });
  });
}
