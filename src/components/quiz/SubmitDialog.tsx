import { AlertDialog } from "radix-ui";
import { useQuiz } from "../../stores/quiz";
import { Button } from "../ui/Button";
import { ZhuyinText } from "../ZhuyinText";
import { UI, UI_PLAIN } from "../../ui-text.gen";

interface SubmitDialogProps {
  open: boolean;
  unanswered: number;
  onOpenChange: (open: boolean) => void;
}

/** 未答提醒 — Radix AlertDialog(spec: quiz-navigation / Submit confirmation) */
export function SubmitDialog({ open, unanswered, onOpenChange }: SubmitDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]"
          onClick={() => onOpenChange(false)}
        />
        <AlertDialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-40px)] max-w-90
          bg-surface border border-line rounded-3xl shadow-card p-6 text-center">
          <p aria-hidden="true" className="text-3xl mb-1.5">🌙</p>
          <AlertDialog.Title className="text-lg font-bold text-text leading-[1.6]">
            <ZhuyinText rich={UI.dialogTitleA!} /> {unanswered} <ZhuyinText rich={UI.dialogTitleB!} />
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted leading-[1.6]">
            <ZhuyinText rich={UI.dialogBody1!} />
            <br />
            <ZhuyinText rich={UI.dialogBody2!} />
          </AlertDialog.Description>
          <div className="flex gap-2.5 mt-5">
            <AlertDialog.Cancel asChild>
              <Button aria-label={UI_PLAIN.goBack} variant="ghost" className="flex-1 leading-[1.6]"><ZhuyinText rich={UI.goBack!} /></Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button aria-label={UI_PLAIN.submitAnyway} className="flex-1 leading-[1.6]" onClick={() => useQuiz.getState().submit({})}>
                <ZhuyinText rich={UI.submitAnyway!} />
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
