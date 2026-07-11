import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Question } from "../../data/schema";
import { springSnappy } from "../../motion/presets";
import { type AnswerValue, isAnswered } from "../../quiz/answers";
import { useQuiz } from "../../stores/quiz";
import { ZhuyinText } from "../ZhuyinText";
import { UI } from "../../ui-text.gen";

interface StarTrackProps {
  questions: Question[];
  answers: Record<string, AnswerValue>;
  current: number;
}

const STAR_COLORS = ["text-primary", "text-success", "text-accent"];

/** 星空進度軌道 — 唯一跳題入口(spec: quiz-navigation / Star track progress and jumping) */
export function StarTrack({ questions, answers, current }: StarTrackProps) {
  const reduced = useReducedMotion();
  const answered = questions.map((q) => isAnswered(q, answers[q.id]));
  // 掛載當下已答的星不 pop(reload 續作場景);之後轉為已答才 pop(spec: pop when becomes answered)
  const poppedRef = useRef<Set<string> | null>(null);
  if (poppedRef.current === null) {
    poppedRef.current = new Set(questions.filter((_, i) => answered[i]).map((q) => q.id));
  }
  const answeredTotal = answered.filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0 max-w-65">
      <div className="relative h-13 w-full" aria-label="題目進度">
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
          const xPercent = [10, 30, 50, 70, 90][i] ?? 50;
          const bottomPx = [10, 22, 26, 22, 10][i] ?? 20;
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
              <span aria-hidden="true" className="flex flex-col items-center leading-none">
              <motion.span
                key={lit ? "lit" : "dim"}
                initial={reduced || !lit || poppedRef.current?.has(q.id) ? false : { scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={reduced ? { duration: 0 } : springSnappy}
                onAnimationComplete={() => lit && poppedRef.current?.add(q.id)}
                className={`${isCurrent ? "text-2xl" : "text-lg"} leading-none inline-block
                  ${lit ? `${STAR_COLORS[i % 3]} drop-shadow-[0_0_8px_currentColor]` : "text-muted opacity-50"}`}
              >
                {lit ? "★" : "☆"}
              </motion.span>
              <span className={`text-[0.55rem] font-num mt-0.5 ${isCurrent ? "text-primary font-bold" : "text-muted"}`}>
                {i + 1}
              </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted font-num leading-[1.6]">
        <ZhuyinText rich={UI.questionNo!} /> {current + 1}/5 <ZhuyinText rich={UI.questionUnit!} />・
        <ZhuyinText rich={UI.answeredLabel!} /> {answeredTotal}/5
      </p>
    </div>
  );
}
