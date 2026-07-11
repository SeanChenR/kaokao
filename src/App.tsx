import "./index.css";
import { useEffect } from "react";
import { StarField } from "./components/StarField";
import { QuizScreen } from "./components/quiz/QuizScreen";
import { ResultScreen } from "./components/quiz/ResultScreen";
import { StartScreen } from "./components/quiz/StartScreen";
import { SoundToggle } from "./components/ui/SoundToggle";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { ZhuyinToggle } from "./components/ui/ZhuyinToggle";
import { initThemeSync } from "./stores/settings";
import { useQuiz } from "./stores/quiz";
import { ZhuyinText } from "./components/ZhuyinText";
import { UI } from "./ui-text.gen";

export function App() {
  useEffect(() => initThemeSync(), []);
  const phase = useQuiz((s) => s.phase);

  return (
    <>
      <StarField />
      {/* 獨立 NavBar(文流,不與 main 重疊 — Sean 指示) */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-base font-bold text-text leading-[1.6]">
          <ZhuyinText rich={UI.brand!} />
        </span>
        <div className="flex gap-2.5">
          <SoundToggle />
          <ZhuyinToggle />
          <ThemeToggle />
        </div>
      </header>
      {phase === "start" && <StartScreen />}
      {phase === "quiz" && <QuizScreen />}
      {phase === "result" && <ResultScreen />}
    </>
  );
}

export default App;
