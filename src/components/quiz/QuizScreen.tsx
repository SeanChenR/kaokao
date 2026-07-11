import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { springSnappy } from "../../motion/presets";
import { isAnswered } from "../../quiz/answers";
import { deadlineOf } from "../../quiz/time";
import { drawnQuestions, unansweredCount, useQuiz } from "../../stores/quiz";
import { Button } from "../ui/Button";
import { CountdownTimer } from "./CountdownTimer";
import { QuestionCard } from "./QuestionCard";
import { StarTrack } from "./StarTrack";
import { SubmitDialog } from "./SubmitDialog";
import { ZhuyinText } from "../ZhuyinText";
import { UI, UI_PLAIN } from "../../ui-text.gen";

/** 作答畫面骨架 — spec: quiz-navigation */
export function QuizScreen() {
  const current = useQuiz((s) => s.current);
  const answers = useQuiz((s) => s.answers);
  const startedAt = useQuiz((s) => s.startedAt);
  const [dialogOpen, setDialogOpen] = useState(false);
  const reduced = useReducedMotion();

  const questions = drawnQuestions();
  const question = questions[current];
  if (!question || startedAt === null) return null;

  const isLast = current === questions.length - 1;
  const trySubmit = () => {
    if (unansweredCount() > 0) setDialogOpen(true);
    else useQuiz.getState().submit({});
  };

  return (
    <main className="min-h-screen flex flex-col max-w-2xl w-full mx-auto px-4 pb-5 pt-18 lg:pt-6 gap-4">
      <header className="flex items-center justify-between gap-3">
        <span className="text-base font-bold text-text flex-none hidden sm:block leading-[1.6]"><ZhuyinText rich={UI.brand!} /></span>
        <StarTrack questions={questions} answers={answers} current={current} />
        <CountdownTimer deadline={deadlineOf(startedAt)} />
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question.id}
            initial={reduced ? false : { x: 36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduced ? undefined : { x: -24, opacity: 0 }}
            transition={reduced ? { duration: 0 } : springSnappy}
          >
            <QuestionCard
              question={question}
              index={current}
              total={questions.length}
              value={answers[question.id]}
              onChange={(v) => useQuiz.getState().setAnswer(question.id, v)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="flex items-center justify-between gap-3" aria-label="題目導航">
        <Button aria-label={UI_PLAIN.prev} variant="ghost" disabled={current === 0} onClick={() => useQuiz.getState().prev()} className="leading-[1.6]">
          <ZhuyinText rich={UI.prev!} />
        </Button>
        {isLast ? (
          <Button
            aria-label={UI_PLAIN.submit}
            onClick={trySubmit}
            className={`leading-[1.6] ${isAnswered(question, answers[question.id]) ? "shadow-glow-success bg-success" : ""}`}
          >
            <ZhuyinText rich={UI.submit!} />
          </Button>
        ) : (
          <Button aria-label={UI_PLAIN.next} onClick={() => useQuiz.getState().next()} className="leading-[1.6]">
            <ZhuyinText rich={UI.next!} />
          </Button>
        )}
      </nav>

      <SubmitDialog open={dialogOpen} unanswered={unansweredCount()} onOpenChange={setDialogOpen} />
    </main>
  );
}
