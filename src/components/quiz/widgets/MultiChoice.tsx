import type { MultiQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { optionCard } from "./shared";

interface MultiChoiceProps {
  question: MultiQ;
  value: number[] | undefined;
  onChange: (value: number[]) => void;
}

/** 多選 — 手刻 role=checkbox 卡(design Decision 3);回報遞增不重複索引 */
export function MultiChoice({ question, value = [], onChange }: MultiChoiceProps) {
  const toggle = (i: number) => {
    const next = value.includes(i) ? value.filter((x) => x !== i) : [...value, i].sort((a, b) => a - b);
    onChange(next);
  };

  return (
    <div role="group" aria-labelledby={`stem-${question.id}`} className="mt-6 flex flex-col gap-2.5">
      {question.options.map((opt, i) => {
        const checked = value.includes(i);
        return (
          <button
            key={i}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(i)}
            className={optionCard}
          >
            <span
              aria-hidden="true"
              className={`flex-none w-6 h-6 rounded-lg border-2 inline-flex items-center justify-center text-sm font-bold
                ${checked ? "bg-primary border-primary text-surface" : "border-current"}`}
            >
              {checked ? "✓" : ""}
            </span>
            <ZhuyinText rich={opt} />
          </button>
        );
      })}
      <p className="text-xs text-muted min-h-4" aria-hidden="true">
        {value.length > 0 ? "還能再選喔!" : ""}
      </p>
    </div>
  );
}
