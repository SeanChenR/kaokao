import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { MatchQ, MultiQ, SingleQ } from "../../data/schema";
import { ReviewList } from "./ReviewList";

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  stubMatchMedia();
  const { useSettings } = await import("../../stores/settings");
  useSettings.setState({ zhuyin: true });
});

const seg = (t: string) => [t.split("").map((ch) => (/\p{Script=Han}/u.test(ch) ? { t: ch, z: "ㄅ" } : { t: ch }))];

const multiQ: MultiQ = { id: "m", type: "multi", stem: seg("多選"), options: [seg("甲"), seg("乙"), seg("丙"), seg("丁")], answer: [0, 2] };
const matchQ: MatchQ = { id: "mt", type: "match", stem: seg("配對"), left: [seg("魚"), seg("鳥")], right: [seg("水"), seg("巢")], answer: [0, 1] };
const singleQ: SingleQ = { id: "s", type: "single", stem: seg("單選"), options: [seg("對的"), seg("錯的")], answer: 0 };

describe("ReviewList", () => {
  test("multi shows delta: correct, missed, wrongly chosen", () => {
    render(<ReviewList questions={[multiQ]} answers={{ m: [0, 3] }} />);
    expect(screen.getByText("(選對了)")).toBeTruthy(); // 0
    expect(screen.getByText("(漏選了)")).toBeTruthy(); // 2
    expect(screen.getByText("(多選了)")).toBeTruthy(); // 3
    expect(screen.getByText("再想想看")).toBeTruthy();
  });

  test("match shows partial connections as-is with correct pairing", () => {
    render(<ReviewList questions={[matchQ]} answers={{ mt: [1, null] }} />);
    const text = document.body.textContent!;
    expect(text).toContain("(沒有作答)"); // 鳥未連
    expect(text).toContain("正解:");
  });

  test("unanswered single shows placeholder and correct answer", () => {
    render(<ReviewList questions={[singleQ]} answers={{}} />);
    const text = document.body.textContent!;
    expect(text).toContain("(沒有作答)");
    expect(text).toContain("正確答案:");
    expect(screen.getByText("再想想看")).toBeTruthy();
  });

  test("correct single shows praise badge and hides correct-answer row", () => {
    render(<ReviewList questions={[singleQ]} answers={{ s: 0 }} />);
    expect(screen.getByText("答對了!")).toBeTruthy();
    expect(document.body.textContent).not.toContain("正確答案:");
  });
});
