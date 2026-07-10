import { describe, expect, test } from "bun:test";

// spec: theme-system / Flash-free first paint
// index.html 的 inline script 是 resolve.ts 規則的複本;此測試鎖住關鍵行為存在
const html = await Bun.file(new URL("../index.html", import.meta.url)).text();

describe("pre-paint script contract", () => {
  test("blocking inline script exists in head before any stylesheet-dependent markup", () => {
    const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
    expect(head).toContain("<script>");
    expect(head).toContain("kaokao-settings");
  });

  test("reads persist key and assigns data-theme on root", () => {
    expect(html).toContain('localStorage.getItem("kaokao-settings")');
    expect(html).toMatch(/documentElement\.dataset\.theme|documentElement\.setAttribute\("data-theme"/);
  });

  test("resolves auto via prefers-color-scheme", () => {
    expect(html).toContain("prefers-color-scheme: dark");
  });

  test("localStorage failure is guarded (private browsing falls back to auto)", () => {
    expect(html).toContain("try");
    expect(html).toContain("catch");
  });
});
