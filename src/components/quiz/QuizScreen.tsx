import { useState } from "react";
import { isAnswered } from "../../quiz/answers";
import { deadlineOf } from "../../quiz/time";
import { drawnQuestions, unansweredCount, useQuiz } from "../../stores/quiz";
import { Button } from "../ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { QuestionCard } from "./QuestionCard";
import { StarTrack } from "./StarTrack";
import { SubmitDialog } from "./SubmitDialog";

/** 作答畫面骨架 — spec: quiz-navigation */
export function QuizScreen() {
  const current = useQuiz((s) => s.current);
  const answers = useQuiz((s) => s.answers);
  const startedAt = useQuiz((s) => s.startedAt);
  const [dialogOpen, setDialogOpen] = useState(false);

  const questions = drawnQuestions();
  const question = questions[current];
  if (!question || startedAt === null) return null;

  const isLast = current === questions.length - 1;
  const trySubmit = () => {
    if (unansweredCount() > 0) setDialogOpen(true);
    else useQuiz.getState().submit({});
  };

  return (
    <main className="min-h-screen flex flex-col max-w-2xl w-full mx-auto px-4 py-5 gap-4">
      <header className="flex items-center justify-between gap-3">
        <span className="text-base font-bold text-text tracking-wider flex-none hidden sm:block">考考</span>
        <StarTrack questions={questions} answers={answers} current={current} />
        <CountdownTimer deadline={deadlineOf(startedAt)} />
      </header>

      <div className="flex-1">
        <QuestionCard
          question={question}
          index={current}
          total={questions.length}
          value={answers[question.id]}
          onChange={(v) => useQuiz.getState().setAnswer(question.id, v)}
        />
      </div>

      <nav className="flex items-center justify-between gap-3" aria-label="題目導航">
        <Button variant="ghost" disabled={current === 0} onClick={() => useQuiz.getState().prev()}>
          上一題
        </Button>
        {isLast ? (
          <Button
            onClick={trySubmit}
            className={isAnswered(question, answers[question.id]) ? "shadow-glow-success bg-success" : ""}
          >
            送出答案
          </Button>
        ) : (
          <Button onClick={() => useQuiz.getState().next()}>下一題</Button>
        )}
      </nav>

      <SubmitDialog open={dialogOpen} unanswered={unansweredCount()} onOpenChange={setDialogOpen} />
    </main>
  );
}
