import type { Question, QuestionBank, Rich } from "./schema";

export interface BankError {
  /** 出錯的題 id;bank 層級錯誤為 "(bank)" */
  questionId: string;
  field: string;
  message: string;
}

const CJK = /\p{Script=Han}/u;
const ZHUYIN = /^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$/u; // 輕聲 ˙ 前置(台灣正字法),二三四聲後置
const MIN_PER_TYPE = 3;

function checkRich(rich: Rich, questionId: string, field: string, errors: BankError[]): void {
  rich.forEach((segment, si) => {
    segment.forEach((token, ti) => {
      const where = `${field}[${si}][${ti}]`;
      if (CJK.test(token.t)) {
        if (token.t.length !== 1) {
          errors.push({ questionId, field: where, message: `中文 token 必須單字:「${token.t}」` });
        }
        if (!token.z) {
          errors.push({ questionId, field: where, message: `「${token.t}」缺注音` });
        } else if (!ZHUYIN.test(token.z)) {
          errors.push({
            questionId,
            field: where,
            message: `「${token.t}」注音不合法:「${token.z}」`,
          });
        }
      } else if (token.z) {
        errors.push({ questionId, field: where, message: `非中文 token「${token.t}」不應有注音` });
      }
    });
  });
}

function checkQuestion(q: Question, errors: BankError[]): void {
  checkRich(q.stem, q.id, "stem", errors);

  switch (q.type) {
    case "single":
    case "image": {
      const list = q.type === "single" ? q.options : q.shapes;
      if (q.type === "single") {
        q.options.forEach((o, i) => checkRich(o, q.id, `options[${i}]`, errors));
      } else {
        q.shapes.forEach((s, i) => checkRich(s.label, q.id, `shapes[${i}].label`, errors));
      }
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= list.length) {
        errors.push({ questionId: q.id, field: "answer", message: `答案索引 ${q.answer} 越界` });
      }
      break;
    }
    case "multi": {
      q.options.forEach((o, i) => checkRich(o, q.id, `options[${i}]`, errors));
      const inRange = q.answer.every((a) => Number.isInteger(a) && a >= 0 && a < q.options.length);
      const ascendingUnique = q.answer.every((a, i) => i === 0 || a > (q.answer[i - 1] ?? -1));
      if (!inRange || !ascendingUnique || q.answer.length === 0) {
        errors.push({
          questionId: q.id,
          field: "answer",
          message: "多選答案必須為遞增不重複且在範圍內的非空索引陣列",
        });
      }
      break;
    }
    case "fill": {
      if (q.suffix) checkRich(q.suffix, q.id, "suffix", errors);
      if (q.accept.length === 0 || q.accept.some((a) => a.trim() === "")) {
        errors.push({
          questionId: q.id,
          field: "accept",
          message: "填空題需至少一個非空可接受答案",
        });
      }
      break;
    }
    case "match": {
      q.left.forEach((o, i) => checkRich(o, q.id, `left[${i}]`, errors));
      q.right.forEach((o, i) => checkRich(o, q.id, `right[${i}]`, errors));
      const bijective =
        q.answer.length === q.left.length &&
        q.left.length === q.right.length &&
        new Set(q.answer).size === q.answer.length &&
        q.answer.every((a) => Number.isInteger(a) && a >= 0 && a < q.right.length);
      if (!bijective) {
        errors.push({ questionId: q.id, field: "answer", message: "配對題必須為 1:1 全射映射" });
      }
      break;
    }
  }
}

/** 題庫結構驗證 — 由測試層呼叫,不進 runtime load path(design.md Decision 4) */
export function validateBank(bank: QuestionBank): BankError[] {
  const errors: BankError[] = [];

  const ids = new Set<string>();
  for (const q of bank.questions) {
    if (ids.has(q.id)) {
      errors.push({ questionId: q.id, field: "id", message: "題 id 重複" });
    }
    ids.add(q.id);
    checkQuestion(q, errors);
  }

  const counts = new Map<string, number>();
  for (const q of bank.questions) counts.set(q.type, (counts.get(q.type) ?? 0) + 1);
  for (const type of ["single", "multi", "fill", "match", "image"]) {
    if ((counts.get(type) ?? 0) < MIN_PER_TYPE) {
      errors.push({
        questionId: "(bank)",
        field: "type-count",
        message: `題型 ${type} 只有 ${counts.get(type) ?? 0} 題,至少需 ${MIN_PER_TYPE}`,
      });
    }
  }

  return errors;
}
