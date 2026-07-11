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
      await page.screenshot({ path: `${SHOT}/quiz-${theme}-${tag}.png` });
    });
  }
}
