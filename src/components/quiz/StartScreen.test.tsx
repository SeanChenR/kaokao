import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";

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

describe("StartScreen", () => {
  test("blank submit shows accessible error, not silent disable", async () => {
    const { useSettings } = await import("../../stores/settings");
    const { useQuiz } = await import("../../stores/quiz");
    useSettings.setState({ lastName: "" });
    useQuiz.getState().reset();
    const { StartScreen } = await import("./StartScreen");
    render(<StartScreen />);
    const btn = screen.getByRole("button", { name: "開始測驗" });
    fireEvent.click(btn);
    const input = screen.getByLabelText("你的名字");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const desc = document.getElementById(input.getAttribute("aria-describedby")!)!;
    expect(desc.textContent).toContain("先寫上名字");
  });

  test("valid name starts the quiz and prefills from lastName next time", async () => {
    const { useSettings } = await import("../../stores/settings");
    useSettings.setState({ lastName: "小美" });
    const { StartScreen } = await import("./StartScreen");
    const { useQuiz } = await import("../../stores/quiz");
    render(<StartScreen />);
    const input = screen.getByLabelText("你的名字") as HTMLInputElement;
    expect(input.value).toBe("小美");
    expect(screen.getByText("今夜排行榜")).toBeTruthy(); // 排行榜預覽(spec: Start screen preview)
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useQuiz.getState().phase).toBe("quiz");
  });
});
