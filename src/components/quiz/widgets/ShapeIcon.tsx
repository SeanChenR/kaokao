import { Circle, Heart, Hexagon, Square, Star, Triangle } from "lucide-react";
import type { ShapeCode } from "../../../data/schema";

const SHAPES = { circle: Circle, triangle: Triangle, square: Square, star: Star, heart: Heart, hexagon: Hexagon };

/** 圖形色彩輪替 — 純裝飾不承載作答資訊;排除 accent(配對連線語意色) */
const COLORS = ["text-primary", "text-success", "text-info"];

interface ShapeIconProps {
  code: ShapeCode;
  index: number;
  selected?: boolean;
}

export function ShapeIcon({ code, index, selected = false }: ShapeIconProps) {
  const Icon = SHAPES[code];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${COLORS[index % COLORS.length]} ${selected ? "drop-shadow-[0_0_10px_currentColor]" : ""}`}
    >
      <Icon size={56} strokeWidth={1.5} fill="currentColor" fillOpacity={0.85} />
    </span>
  );
}
