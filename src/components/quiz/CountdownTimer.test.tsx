import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen, act } from "@testing-library/react";
import { CountdownTimer } from "./CountdownTimer";

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  stubMatchMedia();
});

describe("CountdownTimer", () => {
  test("renders role=timer with m:ss", () => {
    render(<CountdownTimer deadline={Date.now() + 600_000} />);
    const timer = screen.getByRole("timer");
    expect(timer.textContent).toContain("10:00");
  });

  test("final minute switches to warning styling and announces once", async () => {
    render(<CountdownTimer deadline={Date.now() + 59_000} />);
    const timer = screen.getByRole("timer");
    expect(timer.className).toContain("text-warning");
    expect(timer.textContent).toContain("剩下 1 分鐘");
    // 再 tick 一秒,播報內容不重複追加(單一 live region 內容不變即不再播)
    await act(async () => { await new Promise((r) => setTimeout(r, 1100)); });
    const matches = timer.textContent!.match(/剩下 1 分鐘/g)!;
    expect(matches).toHaveLength(1);
  });
});
