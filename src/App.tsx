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

export function App() {
  useEffect(() => initThemeSync(), []);
  const phase = useQuiz((s) => s.phase);

  return (
    <>
      <StarField />
      <div className="fixed top-4 right-4 z-10 flex gap-2.5">
        <SoundToggle />
        <ZhuyinToggle />
        <ThemeToggle />
      </div>
      {phase === "start" && <StartScreen />}
      {phase === "quiz" && <QuizScreen />}
      {phase === "result" && <ResultScreen />}
    </>
  );
}

export default App;
