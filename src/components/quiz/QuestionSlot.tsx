import type { Question } from "../../data/schema";
import type { AnswerValue } from "../../quiz/answers";

export interface QuestionSlotProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

/**
 * 作答元件插槽 — 契約由 quiz-flow 擁有,question-types change 以五題型實作替換內容。
 * ponytail: 佔位版只標示開發中,不模擬互動。
 */
export function QuestionSlot({ question }: QuestionSlotProps) {
  return (
    <p className="mt-6 text-sm text-muted border border-dashed border-line rounded-2xl p-6 text-center">
      「{question.type}」作答元件開發中(question-types change)
    </p>
  );
}
