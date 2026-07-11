import { RadioGroup } from "radix-ui";
import type { SingleQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";

interface SingleChoiceProps {
  question: SingleQ;
  value: number | null | undefined;
  onChange: (value: number) => void;
}

export const optionCard =
  "flex items-center gap-3.5 w-full min-h-12 px-5 py-3 rounded-2xl cursor-pointer text-left " +
  "text-lg leading-[1.9] text-text bg-surface border-2 border-line " +
  "hover:border-primary motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none " +
  "data-[state=checked]:border-primary data-[state=checked]:bg-selection data-[state=checked]:shadow-glow-primary " +
  "aria-checked:border-primary aria-checked:bg-selection aria-checked:shadow-glow-primary";

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
