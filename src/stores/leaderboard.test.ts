import { beforeEach, describe, expect, test } from "bun:test";

async function fresh() {
  return (await import(`./leaderboard.ts?t=${Math.random()}`)) as typeof import("./leaderboard");
}

beforeEach(() => {
  localStorage.clear();
});

describe("leaderboard store", () => {
  test("ships demo seed as initial state, persisted once, never re-seeded", async () => {
    const a = await fresh();
    expect(a.useLeaderboard.getState().entries).toHaveLength(5);
    expect(a.useLeaderboard.getState().entries.every((e) => e.demo)).toBe(true);
    a.useLeaderboard.getState().add({ name: "真人", score: 5, elapsedSec: 100 });
    const b = await fresh(); // reload
    const demos = b.useLeaderboard.getState().entries.filter((e) => e.demo);
    expect(demos).toHaveLength(5);
    expect(b.useLeaderboard.getState().entries).toHaveLength(6);
  });

  test("orders by score desc then elapsed asc, keeps top 10", async () => {
    const { useLeaderboard } = await fresh();
    for (let i = 0; i < 12; i++) {
      useLeaderboard.getState().add({ name: `p${i}`, score: i % 6, elapsedSec: 600 - i });
    }
    const entries = useLeaderboard.getState().entries;
    expect(entries).toHaveLength(10);
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1]!;
      const cur = entries[i]!;
      expect(prev.score > cur.score || (prev.score === cur.score && prev.elapsedSec <= cur.elapsedSec)).toBe(true);
    }
  });

  test("same score tie broken by faster time", async () => {
    const { useLeaderboard } = await fresh();
    useLeaderboard.getState().add({ name: "慢", score: 5, elapsedSec: 300 });
    const fastId = useLeaderboard.getState().add({ name: "快", score: 5, elapsedSec: 100 });
    const names = useLeaderboard.getState().entries.map((e) => e.name);
    expect(names.indexOf("快")).toBeLessThan(names.indexOf("慢"));
    expect(typeof fastId).toBe("string");
  });

  test("rankOf reports overall rank even when off the board", async () => {
    const { useLeaderboard, rankOf } = await fresh();
    // 填滿高分
    for (let i = 0; i < 10; i++) useLeaderboard.getState().add({ name: `神${i}`, score: 5, elapsedSec: 50 + i });
    const id = useLeaderboard.getState().add({ name: "我", score: 0, elapsedSec: 500 });
    expect(useLeaderboard.getState().entries.some((e) => e.id === id)).toBe(false); // 不在 Top10
    expect(rankOf(id)).toBeGreaterThan(10);
  });

  test("duplicate names highlight only by id", async () => {
    const { useLeaderboard } = await fresh();
    useLeaderboard.getState().add({ name: "小明", score: 3, elapsedSec: 200 });
    const mine = useLeaderboard.getState().add({ name: "小明", score: 4, elapsedSec: 150 });
    const matches = useLeaderboard.getState().entries.filter((e) => e.id === mine);
    expect(matches).toHaveLength(1);
  });
});
