// 產生 src/ui-text.gen.ts — 全站 UI 文案的注音 Rich(Sean 指示:所有學生可見文字都要注音)
// 破音字/變調由 OVERRIDES 人工定稿;重跑冪等。執行:bun scripts/gen-ui-text.ts
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { lineToRich } from "./annotate-zhuyin";
import type { Rich } from "../src/data/schema";

const STRINGS: Record<string, string> = {
  brand: "考考",
  studio: "星空自習室",
  welcome1: "哈囉!今天也一起點亮星星吧",
  welcome2: "寫一份 5 題的小測驗,準備好了嗎?",
  nameLabel: "你的名字",
  namePlaceholder: "寫上名字",
  nameError: "先寫上名字才能出發喔!",
  nameReady: "按下開始,星空就亮起來囉!",
  startQuiz: "開始測驗",
  leaderboardTitle: "今夜排行榜",
  demoTag: "示範",
  you: "(你)",
  rankLine1: "你這次的名次:",
  rankLine2: "再挑戰一次往上爬!",
  typeSingle: "單選題",
  typeMulti: "多選題",
  typeFill: "填空題",
  typeMatch: "配對題",
  typeImage: "看圖選選看",
  hintSingle: "選一個最正確的答案",
  hintMulti: "可以複選喔",
  hintFill: "把答案打在空格裡",
  hintMatch: "先點左邊,再點右邊配成一對",
  hintImage: "選出正確的圖形",
  morePick: "還能再選喔!",
  prev: "上一題",
  next: "下一題",
  submit: "送出答案",
  dialogTitleA: "還有",
  dialogTitleB: "題沒寫完喔!",
  dialogBody1: "沒關係,要不要回去把它們點亮?",
  dialogBody2: "也可以直接送出目前的答案。",
  goBack: "回去作答",
  submitAnyway: "直接送出",
  review: "作答回顧",
  myAnswer: "你的答案:",
  correctAnswer: "正確答案:",
  noAnswer: "(沒有作答)",
  correctPick: "(選對了)",
  missedPick: "(漏選了)",
  wrongPick: "(多選了)",
  correctBadge: "答對了!",
  wrongBadge: "再想想看",
  rightAnswerIs: "正解:",
  playAgain: "再玩一次",
  autoSubmitted: "時間到,自動交卷!",
  tierPerfectTitle: "滿天星!全部答對!",
  tierPerfectMsg: "太厲害了,你把整片星空都點亮了!",
  tierGoodMsg: "很棒喔,再接再厲就能點亮全部!",
  tierSomeMsg: "有進步空間,看看下面的回顧再試一次吧!",
  tierZeroTitle: "先別灰心",
  tierZeroMsg: "每個高手都是從第一次開始的,看完回顧再玩一次看看!",
  elapsedLabel: "用時",
  answeredLabel: "已答",
  questionNo: "第",
  questionUnit: "題",
  totalPrefix: "/共",
  starLightUp: "星光閃閃,答對",
  starLit: "點亮了",
  starUnit: "顆星",
};

/** 人工定稿:[字, 第幾次出現(1-based), 注音] — 以字定位,不用索引(校對紀錄 2026-07-11) */
const OVERRIDES: Record<string, Array<[string, number, string]>> = {
  welcome1: [["囉", 1, "ㄌㄡ"]],
  dialogTitleA: [["還", 1, "ㄏㄞˊ"]],
  dialogTitleB: [["喔", 1, "ㄛ"]], // 哈囉(外來語一聲);也/一 pipeline 已正確
  welcome2: [["一", 1, "ㄧˊ"], ["嗎", 1, "˙ㄇㄚ"]], // 一份(四聲前);疑問助詞輕聲
  nameError: [["喔", 1, "ㄛ"]],
  nameReady: [["囉", 1, "˙ㄌㄡ"]], // 語氣助詞輕聲
  hintMulti: [["喔", 1, "ㄛ"]],
  morePick: [["還", 1, "ㄏㄞˊ"], ["喔", 1, "ㄛ"]],
  tierGoodMsg: [["喔", 1, "ㄛ"]],
  hintSingle: [["一", 1, "ㄧˊ"]], // 一個
  hintMatch: [["一", 1, "ㄧˊ"]], // 一對
  prev: [["一", 1, "ㄧˋ"]], // 上一題(二聲前)
  next: [["一", 1, "ㄧˋ"]],
  playAgain: [["一", 1, "ㄧˊ"]], // 一次
  rankLine2: [["一", 1, "ㄧˊ"], ["挑", 1, "ㄊㄧㄠˇ"]], // 挑戰三聲
  tierZeroMsg: [["一", 2, "ㄧˊ"]], // 再玩「一」次;「第一」序數不變調保持 ㄧ
  typeFill: [["空", 1, "ㄎㄨㄥˋ"]],
  hintFill: [["空", 1, "ㄎㄨㄥˋ"]],
  dialogBody1: [["不", 1, "ㄅㄨˊ"], ["們", 1, "˙ㄇㄣ"]], // 要不要(四聲前變調);它們輕聲
  autoSubmitted: [["間", 1, "ㄐㄧㄢ"]], // 時間一聲
  tierSomeMsg: [["間", 1, "ㄐㄧㄢ"]], // 空間一聲
  leaderboardTitle: [["行", 1, "ㄏㄤˊ"]], // 排行
};

function applyOverrides(key: string, rich: Rich): Rich {
  const ov = OVERRIDES[key];
  if (!ov) return rich;
  const counts = new Map<string, number>();
  return rich.map((seg) =>
    seg.map((tok) => {
      if (!tok.z) return tok;
      const n = (counts.get(tok.t) ?? 0) + 1;
      counts.set(tok.t, n);
      const hit = ov.find(([ch, occ]) => ch === tok.t && occ === n);
      return hit ? { ...tok, z: hit[2] } : tok;
    }),
  );
}

const entries = Object.entries(STRINGS).map(([key, text]) => {
  const rich = applyOverrides(key, lineToRich(text));
  return `  ${key}: ${JSON.stringify(rich)},`;
});

const plainEntries = Object.entries(STRINGS).map(([key, text]) => `  ${key}: ${JSON.stringify(text)},`);

const out = `// 自動產生 — bun scripts/gen-ui-text.ts;破音字定稿見 OVERRIDES,勿手改本檔
import type { Rich } from "./data/schema";

export const UI: Record<string, Rich> = {
${entries.join("\n")}
};

/** 純文字版 — 供互動元件 aria-label(accname 不吃 ruby 的空格串接) */
export const UI_PLAIN: Record<string, string> = {
${plainEntries.join("\n")}
};
`;

await writeFile(path.resolve(import.meta.dir, "../src/ui-text.gen.ts"), out);
console.log(`generated ${entries.length} ui strings`);
