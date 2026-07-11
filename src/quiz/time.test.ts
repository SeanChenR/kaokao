import { describe, expect, test } from "bun:test";
import { deadlineOf, formatMs, remainingMs } from "./time";

// spec: quiz-session / Deadline-based countdown — deadline 重算,不遞減

describe("time", () => {
  test("deadline = startedAt + 10min", () => {
    expect(deadlineOf(1000)).toBe(1000 + 600_000);
  });

  test("remaining recomputes from wall clock (background throttle immune)", () => {
    const dl = deadlineOf(0);
    expect(remainingMs(dl, 0)).toBe(600_000);
    expect(remainingMs(dl, 120_000)).toBe(480_000); // 背景兩分鐘後回來,直接對錶
    expect(remainingMs(dl, 700_000)).toBe(0); // 不出現負數
  });

  test("formats m:ss with tabular expectations", () => {
    expect(formatMs(600_000)).toBe("10:00");
    expect(formatMs(61_000)).toBe("1:01");
    expect(formatMs(9_000)).toBe("0:09");
    expect(formatMs(0)).toBe("0:00");
  });
});
