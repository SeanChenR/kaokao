import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

// spec: zhuyin-rendering / Zhuyin display toggle

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as never;
}

beforeEach(() => {
  localStorage.clear();
  stubMatchMedia();
});

describe("ZhuyinToggle", () => {
  test("native button with aria-pressed reflecting state; click flips and persists", async () => {
    const { useSettings } = await import("../../stores/settings");
    useSettings.setState({ zhuyin: true });
    const { ZhuyinToggle } = await import("./ZhuyinToggle");
    render(<ZhuyinToggle />);
    const btn = screen.getByRole("button", { name: /注音/ });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.className).toContain("min-h-11");
    expect(btn.className).toContain("min-w-11");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(useSettings.getState().zhuyin).toBe(false);
    expect(localStorage.getItem("kaokao-settings")).toContain('"zhuyin":false');
  });
});
