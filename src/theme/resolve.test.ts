import { describe, expect, test } from "bun:test";
import { resolveTheme } from "./resolve";

// spec: theme-system / Theme resolution with three-state preference — Example: Resolution table
const table = [
  { stored: "auto", systemDark: true, effective: "dark" },
  { stored: "auto", systemDark: false, effective: "light" },
  { stored: "light", systemDark: true, effective: "light" },
  { stored: "light", systemDark: false, effective: "light" },
  { stored: "dark", systemDark: true, effective: "dark" },
  { stored: "dark", systemDark: false, effective: "dark" },
] as const;

describe("resolveTheme", () => {
  for (const { stored, systemDark, effective } of table) {
    test(`stored=${stored} systemDark=${systemDark} → ${effective}`, () => {
      expect(resolveTheme(stored, systemDark)).toBe(effective);
    });
  }

  test("unknown stored value falls back to auto behaviour", () => {
    expect(resolveTheme("corrupted" as never, true)).toBe("dark");
    expect(resolveTheme(undefined as never, false)).toBe("light");
  });
});
