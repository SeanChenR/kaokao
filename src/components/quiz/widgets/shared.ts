import type { Rich } from "../../../data/schema";

/** 選項卡共用樣式 — data-[state=checked] 供 Radix,aria-checked 供手刻 checkbox,兩組並存缺一不可 */
export const optionCard =
  "flex items-center gap-3.5 w-full min-h-12 px-5 py-3 rounded-2xl cursor-pointer text-left " +
  "text-lg leading-[1.6] text-text bg-surface border-2 border-line " +
  "hover:border-primary motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-150 " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none " +
  "data-[state=checked]:border-primary data-[state=checked]:bg-selection data-[state=checked]:shadow-glow-primary " +
  "aria-checked:border-primary aria-checked:bg-selection aria-checked:shadow-glow-primary";

export function plainText(rich: Rich): string {
  return rich.flatMap((seg) => seg.map((t) => t.t)).join("");
}
