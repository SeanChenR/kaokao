import type { Question } from "../../data/schema";
import type { AnswerValue, AnswerValueMap } from "../../quiz/answers";
import { FillBlank } from "./widgets/FillBlank";
import { ImageChoice } from "./widgets/ImageChoice";
import { Matching } from "./widgets/Matching";
import { MultiChoice } from "./widgets/MultiChoice";
import { SingleChoice } from "./widgets/SingleChoice";

export interface QuestionSlotProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

/** 五題型分派 — number 契約不外洩,string 轉換收在各 widget 內(design Decision 1) */
export function QuestionSlot({ question, value, onChange }: QuestionSlotProps) {
  switch (question.type) {
    case "single":
      return (
        <SingleChoice question={question} value={value as AnswerValueMap["single"] | undefined} onChange={onChange} />
      );
    case "multi":
      return (
        <MultiChoice question={question} value={value as AnswerValueMap["multi"] | undefined} onChange={onChange} />
      );
    case "fill":
      return <FillBlank question={question} value={value as AnswerValueMap["fill"] | undefined} onChange={onChange} />;
    case "match":
      return <Matching question={question} value={value as AnswerValueMap["match"] | undefined} onChange={onChange} />;
    case "image":
      return (
        <ImageChoice question={question} value={value as AnswerValueMap["image"] | undefined} onChange={onChange} />
      );
  }
}
