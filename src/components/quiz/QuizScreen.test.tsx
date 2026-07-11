import { beforeEach, describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";

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

describe("QuizScreen", () => {
  test("question change moves focus to the stem heading", async () => {
    const { useQuiz } = await import("../../stores/quiz");
    act(() => useQuiz.getState().start("焦點"));
    const { QuizScreen } = await import("./QuizScreen");
    render(<QuizScreen />);
    fireEvent.click(screen.getByRole("button", { name: "下一題" }));
    const stem = await screen.findByRole("heading", { level: 2 });
    expect(document.activeElement).toBe(stem);
  });

  // spec: quiz-session / Deadline wins over an open dialog
  test("deadline passing while the dialog is open force-submits with auto flag", async () => {
    const { useQuiz } = await import("../../stores/quiz");
    act(() => useQuiz.getState().start("歸零"));
    // 把 deadline 壓到 1.2 秒後
    act(() => useQuiz.setState({ startedAt: Date.now() - (600_000 - 1200) }));
    const { QuizScreen } = await import("./QuizScreen");
    render(<QuizScreen />);
    // 跳到最後一題開 dialog
    act(() => useQuiz.getState().goTo(4));
    fireEvent.click(await screen.findByRole("button", { name: "送出答案" }));
    expect(await screen.findByText(/沒寫完喔/)).toBeTruthy();
    // 等 deadline 過:自動送出、dialog 隨 QuizScreen 卸載
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2400));
    });
    expect(useQuiz.getState().phase).toBe("result");
    expect(useQuiz.getState().autoSubmitted).toBe(true);
  });
});
