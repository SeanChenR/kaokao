import type { FillQ } from "../../../data/schema";
import { ZhuyinText } from "../../ZhuyinText";
import { plainText } from "./shared";

interface FillBlankProps {
  question: FillQ;
  value: string | undefined;
  onChange: (value: string) => void;
}

/** 填空 — input 不進 heading(design Decision 4);onChange 即寫 store,IME 收尾自然覆蓋 */
export function FillBlank({ question, value = "", onChange }: FillBlankProps) {
  return (
    <p className="mt-6 text-question leading-[1.6] font-bold text-text">
      <input
        type="text"
        aria-label={`${plainText(question.stem)}(填入答案)`}
        value={value}
        placeholder={question.placeholder ?? "?"}
        onChange={(e) => onChange(e.target.value)}
        className="inline-block w-28 min-h-12 px-3 mx-1.5 rounded-xl text-center text-question font-bold
          text-primary bg-bg border-2 border-line focus:border-primary focus:outline-none
          motion-safe:transition-[border-color] motion-safe:duration-150"
      />
      {question.suffix && <ZhuyinText rich={question.suffix} />}
    </p>
  );
}
