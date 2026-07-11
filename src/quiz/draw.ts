import type { QType, Question, QuestionBank } from "../data/schema";

/** 固定題型順序:題型全覆蓋 + demo 可重現(design Decision 5) */
export const TYPE_ORDER: readonly QType[] = ["single", "multi", "fill", "match", "image"];

/** 每題型隨機抽一題;rng 可注入以利測試 */
export function draw(bank: QuestionBank, rng: () => number = Math.random): Question[] {
  return TYPE_ORDER.map((type) => {
    const pool = bank.questions.filter((q) => q.type === type);
    if (pool.length === 0) throw new Error(`題庫缺題型:${type}`);
    return pool[Math.floor(rng() * pool.length)]!;
  });
}
