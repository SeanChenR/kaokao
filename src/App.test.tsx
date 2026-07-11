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
  test("phase routing: start → quiz → result placeholder", async () => {
    const { useQuiz } = await import("./stores/quiz");
    const { useSettings } = await import("./stores/settings");
    useQuiz.getState().reset();
    useSettings.setState({ lastName: "" });
    const { App } = await import("./App");
    const { container } = render(<App />);
    expect(screen.getByRole("heading", { name: /考考/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /注音/ })).toBeTruthy();
    const starfield = container.querySelector('[aria-hidden="true"]');
    expect(starfield!.className).toContain("pointer-events-none");

    useQuiz.getState().start("小星");
    expect(await screen.findByRole("timer")).toBeTruthy();
    expect(screen.getByText(/第 1\/5 題/)).toBeTruthy();

    useQuiz.getState().submit({ auto: true });
    expect(await screen.findByText("時間到,自動交卷!")).toBeTruthy();
  });
});
