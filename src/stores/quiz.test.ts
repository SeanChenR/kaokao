import { beforeEach, describe, expect, test } from "bun:test";

// spec: quiz-session / Quiz session state machine、Session survives a reload

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

async function fresh() {
  return (await import(`./quiz.ts?t=${Math.random()}`)) as typeof import("./quiz");
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  stubMatchMedia();
});

describe("quiz store", () => {
  test("start draws five, records timestamp, moves to quiz, and saves lastName", async () => {
    const { useQuiz } = await fresh();
    const { useSettings } = await import("./settings");
    useQuiz.getState().start("小明");
    const s = useQuiz.getState();
    expect(s.phase).toBe("quiz");
    expect(s.drawnIds).toHaveLength(5);
    expect(s.startedAt).toBeGreaterThan(0);
    expect(s.name).toBe("小明");
    expect(useSettings.getState().lastName).toBe("小明");
  });

  test("setAnswer is a no-op outside quiz phase; submit is idempotent", async () => {
    const { useQuiz } = await fresh();
    useQuiz.getState().start("小美");
    const qid = useQuiz.getState().drawnIds[0]!;
    useQuiz.getState().setAnswer(qid, 1);
    useQuiz.getState().submit({});
    expect(useQuiz.getState().phase).toBe("result");
    expect(useQuiz.getState().autoSubmitted).toBe(false);
    useQuiz.getState().submit({ auto: true }); // 第二次觸發應無效
    expect(useQuiz.getState().autoSubmitted).toBe(false);
    useQuiz.getState().setAnswer(qid, 2); // result 階段寫入無效
    expect(useQuiz.getState().answers[qid]).toBe(1);
  });

  test("auto submit sets the flag", async () => {
    const { useQuiz } = await fresh();
    useQuiz.getState().start("阿哲");
    useQuiz.getState().submit({ auto: true });
    expect(useQuiz.getState().autoSubmitted).toBe(true);
  });

  test("session state persists to sessionStorage and rehydrates", async () => {
    const a = await fresh();
    a.useQuiz.getState().start("欣妤");
    const ids = a.useQuiz.getState().drawnIds;
    const qid = ids[2]!;
    a.useQuiz.getState().setAnswer(qid, "12");
    const b = await fresh(); // 模擬 reload:新 module 實例,同 sessionStorage
    const s = b.useQuiz.getState();
    expect(s.phase).toBe("quiz");
    expect(s.drawnIds).toEqual(ids);
    expect(s.answers[qid]).toBe("12");
  });

  test("stale drawnIds (bank changed) resets to start on validation", async () => {
    sessionStorage.setItem("kaokao-quiz", JSON.stringify({
      state: { phase: "quiz", drawnIds: ["ghost-1","ghost-2","ghost-3","ghost-4","ghost-5"], answers: {}, name: "誰", startedAt: Date.now(), current: 0, autoSubmitted: false },
      version: 0,
    }));
    const { useQuiz } = await fresh();
    expect(useQuiz.getState().phase).toBe("start");
  });

  test("unansweredCount uses the shared isAnswered predicate", async () => {
    const { useQuiz, unansweredCount } = await fresh();
    useQuiz.getState().start("子睿");
    expect(unansweredCount()).toBe(5);
    const qid = useQuiz.getState().drawnIds[0]!;
    useQuiz.getState().setAnswer(qid, 0);
    expect(unansweredCount()).toBe(4);
  });
});

describe("submission scoring and leaderboard", () => {
  test("double trigger writes exactly one entry; auto elapsed caps at 600", async () => {
    const { useQuiz } = await fresh();
    const { useLeaderboard } = await import("./leaderboard");
    const before = useLeaderboard.getState().history.length;
    useQuiz.getState().start("榜上星");
    useQuiz.getState().submit({ auto: true });
    useQuiz.getState().submit({}); // 第二次觸發
    const history = useLeaderboard.getState().history;
    expect(history.length).toBe(before + 1);
    const mine = history[history.length - 1]!;
    expect(mine.name).toBe("榜上星");
    expect(mine.elapsedSec).toBe(600); // auto → deadline
    expect(useQuiz.getState().finishedAt).not.toBeNull();
    expect(useQuiz.getState().lastEntryId).toBe(mine.id);
  });

  test("finishedAt and lastEntryId survive rehydrate", async () => {
    const a = await fresh();
    a.useQuiz.getState().start("續命星");
    a.useQuiz.getState().submit({});
    const { finishedAt, lastEntryId } = a.useQuiz.getState();
    const b = await fresh();
    expect(b.useQuiz.getState().finishedAt).toBe(finishedAt);
    expect(b.useQuiz.getState().lastEntryId).toBe(lastEntryId);
  });
});
