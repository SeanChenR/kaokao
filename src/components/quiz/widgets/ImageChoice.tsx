import { RadioGroup } from "radix-ui";
import type { ImageQ, Rich } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { ShapeIcon } from "./ShapeIcon";

interface ImageChoiceProps {
  question: ImageQ;
  value: number | null | undefined;
  onChange: (value: number) => void;
}

function plainText(rich: Rich): string {
  return rich.flatMap((seg) => seg.map((t) => t.t)).join("");
}

/** 圖片題 — lucide 圖形卡(design Decision 6);radio 語意,label=形狀名 */
export function ImageChoice({ question, value, onChange }: ImageChoiceProps) {
  return (
    <RadioGroup.Root
      aria-labelledby={`stem-${question.id}`}
      value={value === null || value === undefined ? "" : String(value)}
      onValueChange={(v) => onChange(Number(v))}
      className="mt-6 grid grid-cols-2 gap-3.5 max-w-105"
    >
      {question.shapes.map((shape, i) => {
        const selected = value === i;
        return (
          <RadioGroup.Item
            key={i}
            value={String(i)}
            aria-label={plainText(shape.label)}
            className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl cursor-pointer
              bg-surface border-2 border-line hover:border-primary
              motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none
              data-[state=checked]:border-primary data-[state=checked]:bg-selection"
          >
            <ShapeIcon code={shape.code} index={i} selected={selected} />
            <span aria-hidden="true" className="text-sm text-muted leading-[1.9]">
              <ZhuyinText rich={shape.label} />
            </span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
