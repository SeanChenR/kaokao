import type { Question } from "../../data/schema";
import { type AnswerValue, isAnswered } from "../../quiz/answers";
import { useQuiz } from "../../stores/quiz";

interface StarTrackProps {
  questions: Question[];
  answers: Record<string, AnswerValue>;
  current: number;
}

const STAR_COLORS = ["text-primary", "text-success", "text-accent"];

/** 星空進度軌道 — 唯一跳題入口(spec: quiz-navigation / Star track progress and jumping) */
export function StarTrack({ questions, answers, current }: StarTrackProps) {
  const answered = questions.map((q) => isAnswered(q, answers[q.id]));
  const answeredTotal = answered.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative h-13 w-full max-w-65" aria-label="題目進度">
        <svg viewBox="0 0 260 52" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <path
            d="M6,44 Q130,4 254,44"
            fill="none"
            stroke="var(--line)"
            strokeWidth="2"
            strokeDasharray="3 6"
            strokeLinecap="round"
          />
        </svg>
        {questions.map((q, i) => {
          const lit = answered[i];
          const isCurrent = i === current;
          const xPercent = [10, 30, 50, 70, 90][i];
          const bottomPx = [10, 22, 26, 22, 10][i];
          return (
            <button
              key={q.id}
              type="button"
              aria-label={`第 ${i + 1} 題(${lit ? "已作答" : "還沒寫"})`}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => useQuiz.getState().goTo(i)}
              className={`absolute -translate-x-1/2 min-w-11 min-h-11 flex items-center justify-center
                cursor-pointer bg-transparent border-none p-0
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full focus-visible:outline-none
                ${isCurrent ? "motion-safe:animate-pulse" : ""}`}
              style={{ left: `${xPercent}%`, bottom: `${bottomPx - 14}px` }}
            >
              <span
                aria-hidden="true"
                className={`${isCurrent ? "text-2xl" : "text-lg"} leading-none motion-safe:transition-all motion-safe:duration-300
                  ${lit ? `${STAR_COLORS[i % 3]} drop-shadow-[0_0_8px_currentColor]` : "text-muted opacity-50"}`}
              >
                {lit ? "★" : "☆"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted font-num">
        第 {current + 1}/5 題・已答 {answeredTotal}/5
      </p>
    </div>
  );
}
