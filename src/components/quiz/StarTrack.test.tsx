import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { StarTrack } from "./StarTrack";

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  stubMatchMedia();
});

describe("StarTrack", () => {
  test("labels, current step, jump, and textual progress", async () => {
    const { useQuiz, bank, drawnQuestions } = await import("../../stores/quiz");
    useQuiz.getState().start("測試");
    const qs = drawnQuestions();
    const first = qs[0]!;
    useQuiz.getState().setAnswer(first.id, 0);
    render(<StarTrack questions={qs} answers={useQuiz.getState().answers} current={0} />);
    expect(screen.getByRole("button", { name: "第 1 題(已作答)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "第 2 題(還沒寫)" })).toBeTruthy();
    const current = screen.getByRole("button", { name: /第 1 題/ });
    expect(current.getAttribute("aria-current")).toBe("step");
    fireEvent.click(screen.getByRole("button", { name: /第 3 題/ }));
    expect(useQuiz.getState().current).toBe(2);
    expect(screen.getByText(/已答 1\/5/)).toBeTruthy();
    void bank;
  });
});
