import { beforeEach, describe, expect, mock, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";

// spec: results-screen / Result reveal accessibility、Tiered feedback without blame

const confettiMock = mock((_: unknown) => Promise.resolve());
const createMock = mock((_canvas: unknown, _opts: unknown) => confettiMock);
mock.module("canvas-confetti", () => ({ default: { create: createMock } }));

function stubMatchMedia(reduced = false) {
  window.matchMedia = ((q: string) => ({
    matches: q.includes("reduce") ? reduced : false,
    media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  stubMatchMedia();
  confettiMock.mockClear();
  const { useSettings } = await import("../../stores/settings");
  useSettings.setState({ zhuyin: true });
});

async function submitWith(correctCount: "all" | "none") {
  const { useQuiz, drawnQuestions } = await import("../../stores/quiz");
  const { isCorrect } = await import("../../quiz/score");
  act(() => useQuiz.getState().reset());
  act(() => useQuiz.getState().start("結果星"));
  if (correctCount === "all") {
    const { bank } = await import("../../stores/quiz");
    for (const q of drawnQuestions()) {
      const answer =
        q.type === "single" || q.type === "image" ? q.answer
        : q.type === "multi" ? q.answer
        : q.type === "fill" ? q.accept[0]!
        : q.answer;
      act(() => useQuiz.getState().setAnswer(q.id, answer as never));
      if (!isCorrect(q, useQuiz.getState().answers[q.id])) throw new Error(`測試作答未對:${q.id}`);
    }
    void bank;
  }
  act(() => useQuiz.getState().submit({}));
}

describe("ResultScreen", () => {
  test("perfect score: status announces, heading focused, full confetti", async () => {
    await submitWith("all");
    const { ResultScreen } = await import("./ResultScreen");
    render(<ResultScreen />);
    expect(screen.getByRole("status").textContent).toBe("答對 5 題,共 5 題");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("滿天星");
    expect(document.activeElement).toBe(heading);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(confettiMock).toHaveBeenCalledTimes(1);
    expect((confettiMock.mock.calls[0]![0] as { particleCount: number }).particleCount).toBe(160);
  });

  test("zero score: gentle tier, no confetti, review available", async () => {
    await submitWith("none");
    const { ResultScreen } = await import("./ResultScreen");
    render(<ResultScreen />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("先別灰心");
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(confettiMock).not.toHaveBeenCalled();
    expect(screen.getByText("作答回顧")).toBeTruthy();
    expect(screen.getAllByText("再想想看").length).toBe(5);
  });

  test("reduced motion skips confetti even on perfect score", async () => {
    await submitWith("all");
    stubMatchMedia(true);
    const { ResultScreen } = await import("./ResultScreen");
    render(<ResultScreen />);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(confettiMock).not.toHaveBeenCalled();
  });
});
