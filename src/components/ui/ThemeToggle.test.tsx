import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

// spec: base-components / Theme toggle control、Minimum touch target

function stubMatchMedia(dark: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: dark,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as never;
}

beforeEach(() => {
  localStorage.clear();
  stubMatchMedia(false);
});

describe("ThemeToggle", () => {
  test("toggling flips data-theme, stores manual preference, updates aria-label", async () => {
    const { ThemeToggle } = await import(`./ThemeToggle.tsx?t=${Math.random()}`);
    const { initThemeSync, useSettings } = await import("../../stores/settings");
    initThemeSync();
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    const labelBefore = btn.getAttribute("aria-label")!;
    expect(labelBefore).toContain("深色"); // 目前淡色 → 動作是切到深色
    fireEvent.click(btn);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(useSettings.getState().theme).toBe("dark");
    expect(btn.getAttribute("aria-label")).toContain("淺色");
  });

  test("is a native button with 44px hit area classes", async () => {
    const { ThemeToggle } = await import(`./ThemeToggle.tsx?t=${Math.random()}`);
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.className).toContain("min-h-11");
    expect(btn.className).toContain("min-w-11");
  });
});
