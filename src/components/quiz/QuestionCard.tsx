import { useEffect, useRef } from "react";
import type { Question } from "../../data/schema";
import type { AnswerValue } from "../../quiz/answers";
import { Card } from "../ui/Card";
import { ZhuyinText } from "../ZhuyinText";
import { QuestionSlot } from "./QuestionSlot";
import { UI } from "../../ui-text.gen";

const TYPE_LABELS = {
  single: UI.typeSingle!,
  multi: UI.typeMulti!,
  fill: UI.typeFill!,
  match: UI.typeMatch!,
  image: UI.typeImage!,
} as const;

const TYPE_HINTS = {
  single: UI.hintSingle!,
  multi: UI.hintMulti!,
  fill: UI.hintFill!,
  match: UI.hintMatch!,
  image: UI.hintImage!,
} as const;

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

/** 題卡 — 切題後焦點移至題幹(spec: quiz-navigation / focus management) */
export function QuestionCard({ question, index, total, value, onChange }: QuestionCardProps) {
  const stemRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // mode="wait" 下本卡 mount 即為進場;等兩拍讓 spring 起步後對焦,preventScroll 防位移中捲動
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => stemRef.current?.focus({ preventScroll: true }));
    });
    return () => cancelAnimationFrame(id);
  }, [question.id]);

  return (
    <Card className="px-6 py-7 sm:px-8">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-base font-bold text-primary font-num leading-[1.6]"><ZhuyinText rich={UI.questionNo!} /> {index + 1} <ZhuyinText rich={UI.questionUnit!} /></span>
        <span className="text-sm text-muted font-num leading-[1.6]"><ZhuyinText rich={UI.totalPrefix!} /> {total} <ZhuyinText rich={UI.questionUnit!} /></span>
        <span className="ml-auto text-sm font-bold px-3 py-1 rounded-full text-info bg-bg border border-line leading-[1.6]">
          <ZhuyinText rich={TYPE_LABELS[question.type]} />
        </span>
      </div>

      <h2
        ref={stemRef}
        id={`stem-${question.id}`}
        data-question-id={question.id}
        tabIndex={-1}
        className="mt-4 text-question font-bold text-text focus:outline-none"
      >
        <ZhuyinText rich={question.stem} />
      </h2>
      <p className="mt-1 text-sm text-muted leading-[1.6]"><ZhuyinText rich={TYPE_HINTS[question.type]} /></p>

      <QuestionSlot question={question} value={value} onChange={onChange} />
    </Card>
  );
}
