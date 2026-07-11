import { useEffect, useRef, useState } from "react";
import { formatMs, remainingMs } from "../../quiz/time";
import { useQuiz } from "../../stores/quiz";

interface CountdownTimerProps {
  deadline: number;
}

/** 倒數計時 — spec: quiz-navigation / Countdown display accessibility */
export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => remainingMs(deadline, Date.now()));
  const announced = useRef<{ min: boolean; ten: boolean }>({ min: false, ten: false });
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    announced.current = { min: false, ten: false }; // deadline 變更即重置一次性播報
    const tick = () => {
      const ms = remainingMs(deadline, Date.now());
      setRemaining(ms);
      if (ms <= 60_000 && !announced.current.min) {
        announced.current.min = true;
        setAnnouncement("剩下 1 分鐘,時間到會自動交卷喔");
      }
      if (ms <= 10_000 && !announced.current.ten) {
        announced.current.ten = true;
        setAnnouncement("剩下 10 秒,即將自動交卷!");
      }
      if (ms <= 0) {
        clearInterval(interval);
        useQuiz.getState().submit({ auto: true });
      }
    };
    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [deadline]);

  const warning = remaining <= 60_000;

  return (
    <div
      role="timer"
      aria-label="剩餘時間"
      className={`inline-flex items-center gap-1.5 font-num font-bold text-lg px-3 py-1.5 rounded-xl
        ${warning ? "text-warning bg-warning/10 motion-safe:animate-pulse" : "text-text"}`}
    >
      <span aria-hidden="true">⏱</span>
      {formatMs(remaining)}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
