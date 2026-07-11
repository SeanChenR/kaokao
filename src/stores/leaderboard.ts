import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  elapsedSec: number;
  at: number;
  /** 示範資料 — muted 樣式、永不高亮(spec: Demo seed entries) */
  demo?: true;
}

const TOP_N = 10;
const HISTORY_CAP = 200; // ponytail: 防 localStorage 無界成長;超過即丟最舊

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** demo seed 為 declarative initial state — persist merge 天然只 seed 一次(design Decision 4) */
const SEED: LeaderboardEntry[] = [
  { id: "seed-1", name: "小美", score: 5, elapsedSec: 214, at: 1751000000000, demo: true },
  { id: "seed-2", name: "阿哲", score: 4, elapsedSec: 188, at: 1751000100000, demo: true },
  { id: "seed-3", name: "欣妤", score: 4, elapsedSec: 301, at: 1751000200000, demo: true },
  { id: "seed-4", name: "子睿", score: 3, elapsedSec: 170, at: 1751000300000, demo: true },
  { id: "seed-5", name: "家豪", score: 3, elapsedSec: 260, at: 1751000400000, demo: true },
];

function byRank(a: LeaderboardEntry, b: LeaderboardEntry): number {
  return b.score - a.score || a.elapsedSec - b.elapsedSec;
}

interface LeaderboardState {
  entries: LeaderboardEntry[];
  /** 完整插入史(含被 Top10 擠掉的),rankOf 用;同樣 persist */
  history: LeaderboardEntry[];
  add: (entry: { name: string; score: number; elapsedSec: number }) => string;
}

export const useLeaderboard = create<LeaderboardState>()(
  persist(
    (set) => ({
      entries: SEED,
      history: SEED,
      add: (partial) => {
        const entry: LeaderboardEntry = { ...partial, id: newId(), at: Date.now() };
        set((s) => ({
          history: [...s.history, entry].slice(-HISTORY_CAP),
          entries: [...s.entries, entry].sort(byRank).slice(0, TOP_N),
        }));
        return entry.id;
      },
    }),
    {
      name: "kaokao-leaderboard",
      partialize: (s) => ({ entries: s.entries, history: s.history }),
    },
  ),
);

/** 以完整歷史計算總名次(可能 > Top10)— spec: Current-run highlight */
export function rankOf(id: string): number | null {
  const sorted = [...useLeaderboard.getState().history].sort(byRank);
  const idx = sorted.findIndex((e) => e.id === id);
  return idx === -1 ? null : idx + 1;
}
