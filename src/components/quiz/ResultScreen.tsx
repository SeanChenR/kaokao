import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { springSnappy } from "../../motion/presets";
import { melody } from "../../audio/blip";
import { isCorrect } from "../../quiz/score";
import { formatMs } from "../../quiz/time";
import { drawnQuestions, useQuiz } from "../../stores/quiz";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LeaderboardList } from "./LeaderboardList";
import { ReviewList } from "./ReviewList";
import { ZhuyinText } from "../ZhuyinText";
import { UI, UI_PLAIN } from "../../ui-text.gen";
import type { ReactNode } from "react";

const STAR_COLORS = ["text-primary", "text-success", "text-accent"];

interface Tier {
  emoji: string;
  title: (n: number) => ReactNode;
  message: ReactNode;
  confetti: "full" | "light" | "none";
}

const TIERS: Tier[] = [
  { emoji: "🌟", title: () => <ZhuyinText rich={UI.tierPerfectTitle!} />, message: <ZhuyinText rich={UI.tierPerfectMsg!} />, confetti: "full" },
  {
    emoji: "✨",
    title: (n) => (<><ZhuyinText rich={UI.starLightUp!} /> {n} <ZhuyinText rich={UI.questionUnit!} />!</>),
    message: <ZhuyinText rich={UI.tierGoodMsg!} />,
    confetti: "light",
  },
  {
    emoji: "💫",
    title: (n) => (<><ZhuyinText rich={UI.starLit!} /> {n} <ZhuyinText rich={UI.starUnit!} /></>),
    message: <ZhuyinText rich={UI.tierSomeMsg!} />,
    confetti: "none",
  },
  { emoji: "🌙", title: () => <ZhuyinText rich={UI.tierZeroTitle!} />, message: <ZhuyinText rich={UI.tierZeroMsg!} />, confetti: "none" },
];

function tierOf(score: number, total: number): Tier {
  if (score === total) return TIERS[0]!;
  if (score >= Math.ceil(total * 0.6)) return TIERS[1]!;
  if (score > 0) return TIERS[2]!;
  return TIERS[3]!;
}

const CONFETTI_COLORS = ["#a277ff", "#61ffca", "#ffca85", "#ff6767", "#82e2ff", "#f694ff"];

async function fireConfetti(level: "full" | "light"): Promise<void> {
  try {
    const { default: confetti } = await import("canvas-confetti");
    // 自建 canvas 掛 aria-hidden(spec: confetti SHALL be decorative)
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";
    document.body.appendChild(canvas);
    try {
      const instance = confetti.create(canvas, { resize: true });
      const count = level === "full" ? 160 : 70;
      await instance({ particleCount: count, spread: 75, origin: { y: 0.25 }, colors: CONFETTI_COLORS });
    } finally {
      canvas.remove();
    }
  } catch {
    // 裝飾非核心,失敗靜默略過(design 失敗模式)
  }
}

/** 結果頁 — spec: results-screen 三 Requirement */
export function ResultScreen() {
  const answers = useQuiz((s) => s.answers);
  const autoSubmitted = useQuiz((s) => s.autoSubmitted);
  const lastEntryId = useQuiz((s) => s.lastEntryId);
  const startedAt = useQuiz((s) => s.startedAt);
  const finishedAt = useQuiz((s) => s.finishedAt);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firedRef = useRef(false);
  const reduced = useReducedMotion();

  const questions = drawnQuestions();
  const total = questions.length;
  const score = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const tier = tierOf(score, total);
  const elapsedSec = finishedAt !== null && startedAt !== null ? Math.round((finishedAt - startedAt) / 1000) : 0; // 與寫榜同一捨入

  useEffect(() => {
    headingRef.current?.focus();
    if (firedRef.current) return; // StrictMode 雙掛載冪等
    firedRef.current = true;
    const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMedia && tier.confetti !== "none") void fireConfetti(tier.confetti);
    const cancelMelody =
      tier.confetti === "full" ? melody([523, 659, 784]) : tier.confetti === "light" ? melody([523, 659]) : undefined;
    return cancelMelody; // 早離開結果頁時清掉殘留音符
    // 只在掛載時觸發一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="max-w-2xl w-full mx-auto px-4 pt-2 pb-8 flex flex-col gap-6">
      <Card className="px-6 py-8 text-center">
        {autoSubmitted && <p className="text-warning font-bold mb-2 leading-[1.6]"><ZhuyinText rich={UI.autoSubmitted!} /></p>}
        <div aria-hidden="true" className="flex justify-center gap-3 mb-3">
          {questions.map((q, i) => {
            const ok = isCorrect(q, answers[q.id]);
            return (
              <motion.span
                key={q.id}
                initial={reduced ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={reduced ? { duration: 0 } : { ...springSnappy, delay: i * 0.12 }}
                className={`inline-block text-3xl leading-none ${ok ? `${STAR_COLORS[i % 3]} drop-shadow-[0_0_10px_currentColor]` : "text-muted opacity-40"}`}
              >
                {ok ? "★" : "☆"}
              </motion.span>
            );
          })}
        </div>
        <p aria-hidden="true" className="text-4xl">{tier.emoji}</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold text-text focus:outline-none leading-[1.6]">
          {tier.title(score)}
        </h1>
        <p className="mt-1.5 text-sm text-muted leading-[1.6]">{tier.message}</p>
        <p role="status" className="sr-only">{`答對 ${score} 題，共 ${total} 題`}</p>
        <div className="mt-5 inline-flex items-baseline gap-3 px-7 py-3.5 rounded-2xl bg-bg border border-line">
          <span className="font-num text-4xl font-bold text-primary leading-none">{score}/{total}</span>
          <span className="text-sm text-muted leading-[1.6]"><ZhuyinText rich={UI.elapsedLabel!} /> {formatMs(elapsedSec * 1000)}</span>
        </div>
      </Card>

      <section aria-label="作答回顧">
        <h2 className="text-base font-bold text-text mb-3 leading-[1.6]"><ZhuyinText rich={UI.review!} /></h2>
        <ReviewList questions={questions} answers={answers} />
      </section>

      <section aria-label="排行榜">
        <h2 className="text-base font-bold text-text mb-3 leading-[1.6]"><ZhuyinText rich={UI.leaderboardTitle!} /></h2>
        <LeaderboardList highlightId={lastEntryId} />
      </section>

      <Button aria-label={UI_PLAIN.playAgain} className="w-full py-3.5 text-lg leading-[1.6]" onClick={() => useQuiz.getState().reset()}>
        <ZhuyinText rich={UI.playAgain!} />
      </Button>
    </main>
  );
}
