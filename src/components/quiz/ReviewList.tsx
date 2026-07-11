import type { Question, Rich } from "../../data/schema";
import type { AnswerValue } from "../../quiz/answers";
import { isCorrect } from "../../quiz/score";
import { ZhuyinText } from "../ZhuyinText";
import { UI } from "../../ui-text.gen";

interface ReviewListProps {
  questions: Question[];
  answers: Record<string, AnswerValue>;
}

const NO_ANSWER = <ZhuyinText rich={UI.noAnswer!} />;

function SingleLikeReview({ q, value }: { q: Question & { type: "single" | "image" }; value: AnswerValue | undefined }) {
  const label = (i: number | null | undefined): Rich | null => {
    if (i === null || i === undefined) return null;
    return q.type === "single" ? (q.options[i] ?? null) : (q.shapes[i]?.label ?? null);
  };
  const mine = label(value as number | null | undefined);
  const correct = label(q.answer);
  const ok = isCorrect(q, value);
  return (
    <div className="mt-2 text-sm leading-[1.6]">
      <p className="text-muted">
        <ZhuyinText rich={UI.myAnswer!} />
        {mine ? <ZhuyinText rich={mine} className={ok ? "text-success" : "text-error"} /> : <span className="text-error">{NO_ANSWER}</span>}
      </p>
      {!ok && correct && (
        <p className="text-muted">
          <ZhuyinText rich={UI.correctAnswer!} />
          <ZhuyinText rich={correct} className="text-success" />
        </p>
      )}
    </div>
  );
}

function FillReview({ q, value }: { q: Question & { type: "fill" }; value: AnswerValue | undefined }) {
  const mine = typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  const ok = isCorrect(q, value);
  return (
    <div className="mt-2 text-sm leading-[1.6]">
      <p className="text-muted">
        <ZhuyinText rich={UI.myAnswer!} />
        {mine ? <span className={ok ? "text-success" : "text-error"}>{mine}</span> : <span className="text-error">{NO_ANSWER}</span>}
      </p>
      {!ok && <p className="text-muted"><ZhuyinText rich={UI.correctAnswer!} /><span className="text-success">{q.accept[0]}</span></p>}
    </div>
  );
}

/** multi 三態:✓ 正確選、△ 漏選、✗ 多選(spec: Structured answer review / Multi review shows the delta) */
function MultiReview({ q, value }: { q: Question & { type: "multi" }; value: AnswerValue | undefined }) {
  const chosen = new Set(Array.isArray(value) ? (value as number[]) : []);
  const correct = new Set(q.answer);
  return (
    <ul className="mt-2 text-sm leading-[1.6] flex flex-col gap-0.5">
      {q.options.map((opt, i) => {
        const state = chosen.has(i)
          ? correct.has(i)
            ? { mark: "✓", text: UI.correctPick!, cls: "text-success" }
            : { mark: "✗", text: UI.wrongPick!, cls: "text-error" }
          : correct.has(i)
            ? { mark: "△", text: UI.missedPick!, cls: "text-warning" }
            : null;
        if (!state) return null;
        return (
          <li key={i} className={`${state.cls} flex items-center gap-1.5`}>
            <span aria-hidden="true">{state.mark}</span>
            <ZhuyinText rich={opt} />
            <span className="text-muted"><ZhuyinText rich={state.text} /></span>
          </li>
        );
      })}
    </ul>
  );
}

/** match 逐列:左項|你的連線|正解(spec: 部分連線照實顯示) */
function MatchReview({ q, value }: { q: Question & { type: "match" }; value: AnswerValue | undefined }) {
  const pairs = Array.isArray(value) ? (value as (number | null)[]) : q.left.map(() => null);
  return (
    <ul className="mt-2 text-sm leading-[1.6] flex flex-col gap-0.5">
      {q.left.map((left, li) => {
        const mineIdx = pairs[li] ?? null;
        const mineLabel = mineIdx !== null ? (q.right[mineIdx] ?? null) : null; // 越界(資料改版/竄改)走未作答
        const correctIdx = q.answer[li]!;
        const ok = mineIdx === correctIdx;
        return (
          <li key={li} className="flex items-center gap-1.5 flex-wrap">
            <ZhuyinText rich={left} />
            <span aria-hidden="true">→</span>
            {mineLabel ? (
              <ZhuyinText rich={mineLabel} className={ok ? "text-success" : "text-error"} />
            ) : (
              <span className="text-error">{NO_ANSWER}</span>
            )}
            {!ok && (
              <span className="text-muted">
                (<ZhuyinText rich={UI.rightAnswerIs!} />
                <ZhuyinText rich={q.right[correctIdx]!} className="text-success" />)
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** 作答回顧 — ul/li 語意、文字 badge 非純色(spec: Structured answer review) */
export function ReviewList({ questions, answers }: ReviewListProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {questions.map((q, i) => {
        const ok = isCorrect(q, answers[q.id]);
        return (
          <li
            key={q.id}
            className={`px-4 py-3.5 rounded-2xl bg-surface border border-line border-l-4 ${ok ? "border-l-success" : "border-l-error"}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-sm font-bold text-muted font-num flex-none leading-[1.6]"><ZhuyinText rich={UI.questionNo!} /> {i + 1} <ZhuyinText rich={UI.questionUnit!} /></span>
              <span className="flex-1 text-sm text-text leading-[1.6]"><ZhuyinText rich={q.stem} /></span>
              <span
                className={`flex-none text-xs font-bold px-2.5 py-1 rounded-full text-surface leading-[1.6] ${ok ? "bg-success" : "bg-error"}`}
              >
                <ZhuyinText rich={ok ? UI.correctBadge! : UI.wrongBadge!} />
              </span>
            </div>
            {(q.type === "single" || q.type === "image") && <SingleLikeReview q={q} value={answers[q.id]} />}
            {q.type === "fill" && <FillReview q={q} value={answers[q.id]} />}
            {q.type === "multi" && <MultiReview q={q} value={answers[q.id]} />}
            {q.type === "match" && <MatchReview q={q} value={answers[q.id]} />}
          </li>
        );
      })}
    </ul>
  );
}
