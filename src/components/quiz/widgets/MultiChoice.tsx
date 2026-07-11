import type { MultiQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { optionCard } from "./shared";
import { blip } from "../../../audio/blip";
import { motion, useReducedMotion } from "motion/react";
import { springSoft } from "../../../motion/presets";
import { UI } from "../../../ui-text.gen";

interface MultiChoiceProps {
  question: MultiQ;
  value: number[] | undefined;
  onChange: (value: number[]) => void;
}

/** 多選 — 手刻 role=checkbox 卡(design Decision 3);回報遞增不重複索引 */
export function MultiChoice({ question, value = [], onChange }: MultiChoiceProps) {
  const reduced = useReducedMotion();
  const toggle = (i: number) => {
    const adding = !value.includes(i);
    if (adding) blip(660, 0.09); // 取消不響(spec: Deselection stays silent)
    const next = adding ? [...value, i].sort((a, b) => a - b) : value.filter((x) => x !== i);
    onChange(next);
  };

  return (
    <div role="group" aria-labelledby={`stem-${question.id}`} className="mt-6 flex flex-col gap-2.5">
      {question.options.map((opt, i) => {
        const checked = value.includes(i);
        return (
          <motion.button
            key={i}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(i)}
            whileTap={reduced ? undefined : { scale: 1.02 }}
            transition={springSoft}
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
          </motion.button>
        );
      })}
      <p className="text-xs text-muted min-h-4" aria-hidden="true">
        {value.length > 0 ? <ZhuyinText rich={UI.morePick!} /> : ""}
      </p>
    </div>
  );
}
