import "./index.css";
import { useEffect } from "react";
import { StarField } from "./components/StarField";
import { QuizScreen } from "./components/quiz/QuizScreen";
import { StartScreen } from "./components/quiz/StartScreen";
import { Card } from "./components/ui/Card";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { ZhuyinToggle } from "./components/ui/ZhuyinToggle";
import { Button } from "./components/ui/Button";
import { initThemeSync } from "./stores/settings";
import { useQuiz } from "./stores/quiz";

/** result 佔位 — results-and-leaderboard change 會替換 */
function ResultPlaceholder() {
  const autoSubmitted = useQuiz((s) => s.autoSubmitted);
  return (
    <main className="min-h-screen flex items-center justify-center p-5">
      <Card className="w-full max-w-md px-8 py-10 text-center">
        {autoSubmitted && <p className="text-warning font-bold mb-2">時間到,自動交卷!</p>}
        <h1 className="text-2xl font-bold text-text">作答完成 🎉</h1>
        <p className="mt-3 text-muted">結果頁開發中(results-and-leaderboard change)</p>
        <Button variant="secondary" className="mt-6" onClick={() => useQuiz.getState().reset()}>
          再玩一次
        </Button>
      </Card>
    </main>
  );
}

export function App() {
  useEffect(() => initThemeSync(), []);
  const phase = useQuiz((s) => s.phase);

  return (
    <>
      <StarField />
      <div className="fixed top-4 right-4 z-10 flex gap-2.5">
        <ZhuyinToggle />
        <ThemeToggle />
      </div>
      {phase === "start" && <StartScreen />}
      {phase === "quiz" && <QuizScreen />}
      {phase === "result" && <ResultPlaceholder />}
    </>
  );
}

export default App;
