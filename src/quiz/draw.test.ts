import { describe, expect, test } from "bun:test";
import bankJson from "../data/questions.json";
import type { QuestionBank } from "../data/schema";
import { draw, TYPE_ORDER } from "./draw";

// spec: quiz-session / Question drawing

const bank = bankJson as unknown as QuestionBank;

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("draw", () => {
  test("returns exactly five questions in fixed type order", () => {
    const qs = draw(bank, seeded(42));
    expect(qs).toHaveLength(5);
    expect(qs.map((q) => q.type)).toEqual([...TYPE_ORDER]);
  });

  test("same seed reproduces the same draw", () => {
    expect(draw(bank, seeded(7)).map((q) => q.id)).toEqual(draw(bank, seeded(7)).map((q) => q.id));
  });

  test("different seeds reach different same-type questions", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) ids.add(draw(bank, seeded(i))[0]!.id);
    expect(ids.size).toBeGreaterThan(1);
  });

  test("within-type selection is uniform (chi-square-ish tolerance)", () => {
    const singles = bank.questions.filter((q) => q.type === "single");
    const counts = new Map<string, number>();
    const rng = seeded(1234);
    const N = 4000;
    for (let i = 0; i < N; i++) {
      const id = draw(bank, rng)[0]!.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const expected = N / singles.length;
    for (const q of singles) {
      const c = counts.get(q.id) ?? 0;
      expect(Math.abs(c - expected) / expected).toBeLessThan(0.15);
    }
  });
});
