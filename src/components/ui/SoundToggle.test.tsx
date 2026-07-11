import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(async () => {
  localStorage.clear();
  stubMatchMedia();
  const { useSettings } = await import("../../stores/settings");
  useSettings.setState({ sound: false });
});

describe("SoundToggle", () => {
  test("defaults off with muted icon; toggling flips aria-pressed and persists", async () => {
    const { SoundToggle } = await import("./SoundToggle");
    const { useSettings } = await import("../../stores/settings");
    render(<SoundToggle />);
    const btn = screen.getByRole("button", { name: "開啟音效" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.textContent).toContain("🔕");
    fireEvent.click(btn);
    expect(useSettings.getState().sound).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(localStorage.getItem("kaokao-settings")).toContain('"sound":true');
  });
});
