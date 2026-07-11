import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { SubmitDialog } from "./SubmitDialog";

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

describe("SubmitDialog", () => {
  test("announces the unanswered count with safe/confirm actions", () => {
    render(<SubmitDialog open unanswered={3} onOpenChange={() => {}} />);
    expect(screen.getByText((_, el) => el?.tagName === "H2" && (el.textContent ?? "").includes("還有 3 題沒寫完喔"))).toBeTruthy();
    expect(screen.getByRole("button", { name: "回去作答" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "直接送出" })).toBeTruthy();
  });

  test("closed renders nothing", () => {
    const { container } = render(<SubmitDialog open={false} unanswered={3} onOpenChange={() => {}} />);
    expect(container.querySelector("[role=alertdialog]")).toBeNull();
    expect(screen.queryByText(/沒寫完喔/)).toBeNull();
  });
});
