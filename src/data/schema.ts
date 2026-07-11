/** 題庫資料形狀 — 契約見 openspec/changes/question-bank/design.md Implementation Contract */

export interface Token {
  /** 字面文字:一個中文字,或一段連續非中文字元 */
  t: string;
  /** 注音(僅中文字 token 有;正字法:^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$,輕聲 ˙ 前置) */
  z?: string;
}

/** 詞組 — 渲染時不可在詞組內斷行 */
export type Segment = Token[];

/** 含注音的富文字 */
export type Rich = Segment[];

export type QType = "single" | "multi" | "fill" | "match" | "image";

export type ShapeCode = "circle" | "triangle" | "square" | "star" | "heart" | "hexagon";

interface QuestionBase {
  id: string;
  type: QType;
  stem: Rich;
  hint?: Rich;
}

export interface SingleQ extends QuestionBase {
  type: "single";
  options: Rich[];
  answer: number;
}

export interface MultiQ extends QuestionBase {
  type: "multi";
  options: Rich[];
  /** 遞增且不重複的選項索引 */
  answer: number[];
}

export interface FillQ extends QuestionBase {
  type: "fill";
  suffix?: Rich;
  /** 可接受答案(trim 後精確比對) */
  accept: string[];
  placeholder?: string;
}

export interface MatchQ extends QuestionBase {
  type: "match";
  left: Rich[];
  right: Rich[];
  /** answer[i] = left[i] 對應的 right 索引;1:1 全射 */
  answer: number[];
}

export interface ImageQ extends QuestionBase {
  type: "image";
  shapes: { code: ShapeCode; label: Rich }[];
  answer: number;
}

export type Question = SingleQ | MultiQ | FillQ | MatchQ | ImageQ;

export interface QuestionBank {
  meta: {
    /** 人工校對過破音字的題 id */
    proofread: string[];
  };
  questions: Question[];
}
