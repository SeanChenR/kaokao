import { describe, expect, test } from "bun:test";

// spec: theme-system / Single CSS theme source、Token contrast compliance 的結構前提
const css = await Bun.file(new URL("./theme.css", import.meta.url)).text();

const TOKENS = [
  "--bg", "--surface", "--text", "--muted", "--primary", "--success",
  "--error", "--warning", "--info", "--accent", "--selection", "--line",
];

function block(theme: "dark" | "light"): string {
  const start = css.indexOf(`[data-theme="${theme}"]`);
  return css.slice(start, css.indexOf("}", start));
}

describe("theme.css contract", () => {
  test.each(["dark", "light"] as const)("%s block defines all tokens", (theme) => {
    const b = block(theme);
    for (const t of TOKENS) expect(b).toContain(`${t}:`);
  });

  test("@theme inline maps every color token to a utility variable", () => {
    for (const t of TOKENS.filter((x) => x !== "--line" && x !== "--selection")) {
      expect(css).toContain(`--color-${t.slice(2)}: var(${t})`);
    }
  });

  test("no color values defined inside prefers-color-scheme media queries", () => {
    expect(css).not.toContain("prefers-color-scheme");
  });

  test("dark custom variant keys off data-theme", () => {
    expect(css).toContain('@custom-variant dark');
    expect(css).toContain('[data-theme="dark"]');
  });

  test("theme transition is gated behind no-preference (reduced motion respected)", () => {
    const idx = css.indexOf("prefers-reduced-motion: no-preference");
    expect(idx).toBeGreaterThan(-1);
    expect(css.slice(idx).includes("transition")).toBe(true);
  });

  test("question type scale reserves ruby space", () => {
    expect(css).toContain("--text-question: 1.375rem");
    expect(css).toContain("--text-question--line-height: 1.6");
  });
});

test("ruby renders a fixed-width right-side vertical column (uniform rhythm)", () => {
  expect(css).toMatch(/rt\s*\{[^}]*font-size: 1em/); // 必須蓋掉 UA rt{font-size:50%}
  expect(css).toMatch(/rt\s*\{[^}]*width: 0\.72em/); // 等寬字塊(Sean:字距均勻)
  expect(css).toMatch(/rt\s*\{[^}]*color: var\(--info\)/);
  expect(css).toContain("writing-mode: vertical-lr");
  expect(css).toMatch(/zy-tone[\s\S]*?position: absolute/);
});
