import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

// spec: theme-system / Starfield background layer + App 殼層 smoke

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

describe("App shell", () => {
  test("renders brand title on a Card with ThemeToggle, starfield is aria-hidden", async () => {
    const { App } = await import("./App");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /考考/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /切換為/ })).toBeTruthy();
    const starfield = container.querySelector('[aria-hidden="true"]');
    expect(starfield).toBeTruthy();
    expect(starfield!.className).toContain("pointer-events-none");
  });
});
