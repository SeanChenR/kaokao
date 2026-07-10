import { describe, expect, test } from "bun:test";

// spec: theme-system / Token contrast compliance — WCAG AA 自動化 gate
const css = await Bun.file(new URL("./theme.css", import.meta.url)).text();

function tokensOf(theme: "dark" | "light"): Record<string, string> {
  const start = css.indexOf(`[data-theme="${theme}"]`);
  const body = css.slice(start, css.indexOf("}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg: string, bg: string): number {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const BODY_PAIRS = ["text", "muted"] as const; // ≥ 4.5 on bg + surface
const UI_PAIRS = ["primary", "success", "error", "warning", "info", "accent"] as const; // ≥ 3.0 on surface

describe.each(["dark", "light"] as const)("%s theme AA", (theme) => {
  const t = tokensOf(theme);

  test.each(BODY_PAIRS.flatMap((fg) => (["bg", "surface"] as const).map((bg) => [fg, bg] as const)))(
    "%s on %s ≥ 4.5",
    (fg, bg) => {
      expect(ratio(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(4.5);
    },
  );

  test.each(UI_PAIRS)("%s on surface ≥ 3.0", (fg) => {
    expect(ratio(t[fg]!, t.surface!)).toBeGreaterThanOrEqual(3.0);
  });
});
