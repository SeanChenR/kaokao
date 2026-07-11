import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";

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

describe("LeaderboardList", () => {
  test("highlights only the entry with matching id among same names", async () => {
    const { useLeaderboard } = await import("../../stores/leaderboard");
    useLeaderboard.setState({ entries: [], history: [] });
    useLeaderboard.getState().add({ name: "小明", score: 3, elapsedSec: 200 });
    const mine = useLeaderboard.getState().add({ name: "小明", score: 4, elapsedSec: 150 });
    const { LeaderboardList } = await import("./LeaderboardList");
    render(<LeaderboardList highlightId={mine} />);
    expect(screen.getAllByText("(你)")).toHaveLength(1);
  });

  test("off-board run shows overall rank line; demo entries are marked", async () => {
    const { useLeaderboard } = await import("../../stores/leaderboard");
    useLeaderboard.setState({
      entries: [{ id: "d1", name: "示範生", score: 5, elapsedSec: 100, at: 1, demo: true }],
      history: [{ id: "d1", name: "示範生", score: 5, elapsedSec: 100, at: 1, demo: true }],
    });
    for (let i = 0; i < 9; i++) useLeaderboard.getState().add({ name: `神${i}`, score: 5, elapsedSec: 50 + i });
    const mine = useLeaderboard.getState().add({ name: "我", score: 0, elapsedSec: 550 });
    const { LeaderboardList } = await import("./LeaderboardList");
    render(<LeaderboardList highlightId={mine} />);
    expect(screen.getByText(/你這次的名次/)).toBeTruthy();
    expect(screen.getByText("示範")).toBeTruthy();
  });
});
