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

test("ruby v2: flex stacked column, reserved tone lane, no writing-mode/absolute", () => {
  expect(css).toMatch(/rt\s*\{[^}]*font-size: 1em/); // 蓋掉 UA rt font-size 50%
  expect(css).toMatch(/rt\s*\{[^}]*color: var\(--info\)/);
  expect(css).toMatch(/zy-lane[\s\S]*?width: 0\.42em/); // 恆佔位聲調 lane(等寬)
  expect(css).toMatch(/ruby\s*\{[^}]*margin-inline: 0\.1em 0\.3em/); // 左右自帶間距(右較大)
  expect(css).not.toContain("ruby + ruby"); // 相鄰選擇器已證明蓋不全
  expect(css).not.toContain("writing-mode:"); // 屬性不得使用(註解提及不算)
  expect(css).not.toMatch(/zy-(tone|lane)[\s\S]*?position: absolute/);
});
