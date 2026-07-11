import { expect, test } from "@playwright/test";

const SHOT = process.env.SHOT_DIR ?? "test-results";

test("dark-OS first paint is dark (FOUC guard)", async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: /考\s*考/ })).toBeVisible();
});

test("toggle switches theme and persists across reload", async ({ browser }) => {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /切換為深色/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

for (const theme of ["light", "dark"] as const) {
  for (const [w, h, tag] of [[375, 750, "mobile"], [1280, 800, "desktop"]] as const) {
    test(`screenshot ${theme} ${tag}`, async ({ browser }) => {
      const page = await browser.newPage({
        colorScheme: theme,
        viewport: { width: w, height: h },
      });
      await page.goto("/");
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${SHOT}/shell-${theme}-${tag}.png` });
    });
  }
}
