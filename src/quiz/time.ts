import { QUIZ_DURATION_MS } from "../stores/quiz";

export function deadlineOf(startedAt: number): number {
  return startedAt + QUIZ_DURATION_MS;
}

/** 每 tick 由 deadline 對錶重算 — 免 setInterval drift 與背景分頁 throttle 誤差 */
export function remainingMs(deadline: number, now: number): number {
  return Math.max(0, deadline - now);
}

export function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
