import { motion, useReducedMotion } from "motion/react";
import { RadioGroup } from "radix-ui";
import { springSoft } from "../../../motion/presets";
import type { SingleQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { optionCard } from "./shared";
import { blip } from "../../../audio/blip";

interface SingleChoiceProps {
  question: SingleQ;
  value: number | null | undefined;
  onChange: (value: number) => void;
}

/** 單選 — Radix RadioGroup;string↔number 轉換內收;不可取消(design Decision 2) */
export function SingleChoice({ question, value, onChange }: SingleChoiceProps) {
  const reduced = useReducedMotion();
  return (
    <RadioGroup.Root
      aria-labelledby={`stem-${question.id}`}
      value={value === null || value === undefined ? "" : String(value)}
      onValueChange={(v) => {
        const n = Number(v);
        if (n !== value) blip(660, 0.09);
        onChange(n);
      }}
      className="mt-6 flex flex-col gap-2.5"
    >
      {question.options.map((opt, i) => (
        <RadioGroup.Item key={i} value={String(i)} asChild>
          <motion.button whileTap={reduced ? undefined : { scale: 1.02 }} transition={springSoft} className={optionCard}>
          <span
            aria-hidden="true"
            className="flex-none w-6 h-6 rounded-full border-2 border-current inline-flex items-center justify-center"
          >
            <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
          </span>
          <ZhuyinText rich={opt} />
          </motion.button>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
