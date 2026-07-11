import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import bankJson from "../data/questions.json";
import type { Question, QuestionBank } from "../data/schema";
import { type AnswerValue, isAnswered } from "../quiz/answers";
import { draw } from "../quiz/draw";
import { useSettings } from "./settings";

export const bank = bankJson as unknown as QuestionBank;

export const QUIZ_DURATION_MS = 10 * 60 * 1000;

export type Phase = "start" | "quiz" | "result";

interface QuizState {
  phase: Phase;
  name: string;
  drawnIds: string[];
  current: number;
  answers: Record<string, AnswerValue>;
  startedAt: number | null;
  autoSubmitted: boolean;
  start: (name: string) => void;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  setAnswer: (id: string, value: AnswerValue) => void;
  submit: (opts: { auto?: boolean }) => void;
  reset: () => void;
}

const initial = {
  phase: "start" as Phase,
  name: "",
  drawnIds: [] as string[],
  current: 0,
  answers: {} as Record<string, AnswerValue>,
  startedAt: null as number | null,
  autoSubmitted: false,
};

export const useQuiz = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initial,
      start: (name) => {
        const trimmed = name.trim();
        if (trimmed === "" || trimmed.length > 12) return;
        useSettings.getState().setLastName(trimmed);
        set({
          ...initial,
          phase: "quiz",
          name: trimmed,
          drawnIds: draw(bank).map((q) => q.id),
          startedAt: Date.now(),
        });
      },
      goTo: (i) => {
        if (get().phase !== "quiz") return;
        if (i < 0 || i >= get().drawnIds.length) return;
        set({ current: i });
      },
      next: () => get().goTo(get().current + 1),
      prev: () => get().goTo(get().current - 1),
      setAnswer: (id, value) => {
        if (get().phase !== "quiz") return;
        set((s) => ({ answers: { ...s.answers, [id]: value } }));
      },
      submit: ({ auto = false }) => {
        if (get().phase !== "quiz") return; // idempotent guard
        set({ phase: "result", autoSubmitted: auto });
      },
      reset: () => set({ ...initial }),
    }),
    {
      name: "kaokao-quiz",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        phase: s.phase,
        name: s.name,
        drawnIds: s.drawnIds,
        current: s.current,
        answers: s.answers,
        startedAt: s.startedAt,
        autoSubmitted: s.autoSubmitted,
      }),
      onRehydrateStorage: () => (state) => {
        // 題庫改版後殘留的 drawnIds → 整場重來(design: 失敗模式)
        if (!state) return;
        const ids = new Set(bank.questions.map((q) => q.id));
        if (state.phase !== "start" && !state.drawnIds.every((id) => ids.has(id))) {
          state.reset();
        }
      },
    },
  ),
);

export function drawnQuestions(): Question[] {
  const byId = new Map(bank.questions.map((q) => [q.id, q]));
  return useQuiz
    .getState()
    .drawnIds.map((id) => byId.get(id))
    .filter((q): q is Question => q !== undefined);
}

export function answeredCount(): number {
  const { answers } = useQuiz.getState();
  return drawnQuestions().filter((q) => isAnswered(q, answers[q.id])).length;
}

export function unansweredCount(): number {
  return drawnQuestions().length - answeredCount();
}
