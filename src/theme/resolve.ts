export type ThemePreference = "auto" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

/**
 * 三態主題解析的單一真相。
 * index.html 的 pre-paint inline script 內有此規則的同步複本(無法 import),
 * 修改這裡時必須同步該 script;prepaint.test.ts 鎖住兩者的關鍵行為。
 */
export function resolveTheme(stored: ThemePreference, systemDark: boolean): EffectiveTheme {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}
