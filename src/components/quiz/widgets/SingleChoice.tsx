import { RadioGroup } from "radix-ui";
import type { SingleQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { optionCard } from "./shared";

interface SingleChoiceProps {
  question: SingleQ;
  value: number | null | undefined;
  onChange: (value: number) => void;
}

/** 單選 — Radix RadioGroup;string↔number 轉換內收;不可取消(design Decision 2) */
export function SingleChoice({ question, value, onChange }: SingleChoiceProps) {
  return (
    <RadioGroup.Root
      aria-labelledby={`stem-${question.id}`}
      value={value === null || value === undefined ? "" : String(value)}
      onValueChange={(v) => onChange(Number(v))}
      className="mt-6 flex flex-col gap-2.5"
    >
      {question.options.map((opt, i) => (
        <RadioGroup.Item key={i} value={String(i)} className={optionCard}>
          <span
            aria-hidden="true"
            className="flex-none w-6 h-6 rounded-full border-2 border-current inline-flex items-center justify-center"
          >
            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
          </span>
          <ZhuyinText rich={opt} />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
