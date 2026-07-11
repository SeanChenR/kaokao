import { useId, useState } from "react";
import { useQuiz } from "../../stores/quiz";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ZhuyinText } from "../ZhuyinText";
import { UI, UI_PLAIN } from "../../ui-text.gen";
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
    <main className="flex items-start justify-center p-5 pt-6">
      <Card className="w-full max-w-xl px-8 py-9 text-center">
        <p className="text-sm text-info mb-1.5 leading-[1.6]"><ZhuyinText rich={UI.studio!} /></p>
        <h1 className="text-5xl font-bold text-text leading-[1.6]"><ZhuyinText rich={UI.brand!} /></h1>
        <p className="mt-3.5 text-muted leading-[1.6]">
          <ZhuyinText rich={UI.welcome1!} />
          <span aria-hidden="true"> ✨</span>
          <br />
          <ZhuyinText rich={UI.welcome2!} />
        </p>

        <div className="mt-6 text-left">
          <label htmlFor={inputId} className="block text-sm text-muted mb-2 leading-[1.6]">
            <ZhuyinText rich={UI.nameLabel!} />
          </label>
          <input
            id={inputId}
            aria-label={UI_PLAIN.nameLabel}
            type="text"
            value={name}
            maxLength={12}
            placeholder={UI_PLAIN.namePlaceholder}
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
            {showError ? <ZhuyinText rich={UI.nameError!} /> : name.trim() ? <ZhuyinText rich={UI.nameReady!} /> : ""}
          </p>
        </div>

        <Button aria-label={UI_PLAIN.startQuiz} className="w-full mt-4 py-3.5 text-lg leading-[1.6]" onClick={tryStart}>
          <ZhuyinText rich={UI.startQuiz!} />
        </Button>

        <div className="mt-7 text-left">
          <div className="flex items-center gap-2.5 mb-3">
            <h2 className="text-sm font-bold text-text leading-[1.6]"><ZhuyinText rich={UI.leaderboardTitle!} /></h2>
            <span className="flex-1 h-px bg-line" aria-hidden="true" />
          </div>
          <LeaderboardList limit={5} />
        </div>
      </Card>
    </main>
  );
}
