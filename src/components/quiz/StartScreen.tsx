import { useId, useState } from "react";
import { useQuiz } from "../../stores/quiz";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LeaderboardList } from "./LeaderboardList";

/** 開始畫面 — spec: quiz-session 開始條件;錯誤回饋 a11y(aria-invalid + describedby) */
export function StartScreen() {
  const lastName = useSettings((s) => s.lastName);
  const [name, setName] = useState(lastName);
  const [showError, setShowError] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const tryStart = () => {
    if (name.trim() === "") {
      setShowError(true);
      return;
    }
    useQuiz.getState().start(name);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <Card className="w-full max-w-md px-8 py-9 text-center">
        <p className="text-sm tracking-[0.35em] text-info mb-1.5">星空自習室</p>
        <h1 className="text-5xl font-bold text-text">考考</h1>
        <p className="mt-3.5 text-muted leading-relaxed">
          哈囉!今天也一起點亮星星吧 ✨<br />
          寫一份 5 題的小測驗,準備好了嗎?
        </p>

        <div className="mt-6 text-left">
          <label htmlFor={inputId} className="block text-sm text-muted mb-2">
            你的名字
          </label>
          <input
            id={inputId}
            type="text"
            value={name}
            maxLength={12}
            placeholder="寫上名字"
            aria-invalid={showError || undefined}
            aria-describedby={showError ? errorId : undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (showError && e.target.value.trim() !== "") setShowError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") tryStart();
            }}
            className="w-full min-h-11 px-4 py-3 rounded-2xl text-base bg-bg text-text border-2 border-line
              focus:border-primary focus:outline-none motion-safe:transition-[border-color] motion-safe:duration-150"
          />
          <p id={errorId} className={`mt-2 text-sm min-h-5 ${showError ? "text-error" : "text-muted"}`} aria-live="polite">
            {showError ? "先寫上名字才能出發喔!" : name.trim() ? "按下開始,星空就亮起來囉!" : ""}
          </p>
        </div>

        <Button className="w-full mt-4 py-3.5 text-lg" onClick={tryStart}>
          開始測驗
        </Button>

        <div className="mt-7 text-left">
          <div className="flex items-center gap-2.5 mb-3">
            <h2 className="text-sm font-bold text-text">今夜排行榜</h2>
            <span className="flex-1 h-px bg-line" aria-hidden="true" />
          </div>
          <LeaderboardList limit={5} />
        </div>
      </Card>
    </main>
  );
}
