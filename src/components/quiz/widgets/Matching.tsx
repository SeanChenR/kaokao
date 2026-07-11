import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MatchQ, Rich } from "../../../data/schema";
import { useSettings } from "../../../stores/settings";
import { ZhuyinText } from "../../ZhuyinText";

interface MatchingProps {
  question: MatchQ;
  value: (number | null)[] | undefined;
  onChange: (value: (number | null)[]) => void;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
}

function plainText(rich: Rich): string {
  return rich.flatMap((seg) => seg.map((t) => t.t)).join("");
}

const itemCard =
  "w-full min-h-12 px-4 py-3 rounded-2xl cursor-pointer text-center text-lg leading-[1.9] " +
  "text-text bg-surface border-2 border-line motion-safe:transition-[border-color,box-shadow,opacity] motion-safe:duration-150 " +
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none";

/** 配對題 — 狀態機與連線量測契約見 design Decision 5 / spec: Matching interaction state machine */
export function Matching({ question, value, onChange }: MatchingProps) {
  const pairs: (number | null)[] = value ?? question.left.map(() => null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rightRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const zhuyin = useSettings((s) => s.zhuyin);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const next: Line[] = [];
    pairs.forEach((ri, li) => {
      if (ri === null) return;
      const le = leftRefs.current[li];
      const re = rightRefs.current[ri];
      if (!le || !re) return;
      const a = le.getBoundingClientRect();
      const b = re.getBoundingClientRect();
      next.push({
        x1: a.right - wr.left,
        y1: a.top - wr.top + a.height / 2,
        x2: b.left - wr.left,
        y2: b.top - wr.top + b.height / 2,
        key: `${li}-${ri}`,
      });
    });
    setLines(next);
  }, [pairs]);

  // 量測時機:layout 後 + 容器 resize + 字型載入完成 + 注音切換(design Decision 5)
  useLayoutEffect(() => {
    measure();
  }, [measure, zhuyin]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  const pickLeft = (li: number) => {
    if (pairs[li] !== null) {
      const next = [...pairs];
      next[li] = null;
      onChange(next);
      setSelectedLeft(null);
      setAnnouncement(`${plainText(question.left[li]!)} 的配對取消了`);
      return;
    }
    setSelectedLeft(li);
  };

  const pickRight = (ri: number) => {
    if (selectedLeft === null) return;
    const next = pairs.map((v) => (v === ri ? null : v)); // 右項被佔用 → 重配
    next[selectedLeft] = ri;
    onChange(next);
    setAnnouncement(`${plainText(question.left[selectedLeft]!)} 和 ${plainText(question.right[ri]!)} 配對了`);
    setSelectedLeft(null);
  };

  return (
    <div ref={wrapRef} role="group" aria-labelledby={`stem-${question.id}`} className="relative mt-6">
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-2 overflow-visible" aria-hidden="true">
        {lines.map((l) => (
          <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-x-9 gap-y-3">
        <div className="flex flex-col gap-3">
          {question.left.map((item, li) => {
            const paired = pairs[li] !== null;
            const active = selectedLeft === li;
            return (
              <button
                key={li}
                ref={(el) => {
                  leftRefs.current[li] = el;
                }}
                type="button"
                aria-pressed={active}
                onClick={() => pickLeft(li)}
                className={`${itemCard} ${active ? "border-accent shadow-glow-accent" : paired ? "opacity-60" : "hover:border-accent"}`}
              >
                <ZhuyinText rich={item} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {question.right.map((item, ri) => {
            const occupied = pairs.includes(ri);
            return (
              <button
                key={ri}
                ref={(el) => {
                  rightRefs.current[ri] = el;
                }}
                type="button"
                onClick={() => pickRight(ri)}
                className={`${itemCard} ${occupied ? "border-accent/60 opacity-60" : "hover:border-accent"}`}
              >
                <ZhuyinText rich={item} />
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
