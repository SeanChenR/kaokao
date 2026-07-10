// Turns plain-text drafts (src/data/drafts/*.txt, one sentence per line) into
// staging JSON (src/data/staging/*.json) carrying pinyin-pro word segmentation
// plus per-character zhuyin. The output is a *draft* for human proofreading —
// pinyin-pro's polyphone guesses are imperfect, so readings are corrected by
// hand before landing in the canonical src/data/questions.json.
//
// This script NEVER writes questions.json, and reruns are byte-identical.
// Run with: bun run annotate
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pinyin, segment, OutputFormat, addTraditionalDict } from "pinyin-pro";
import type { Rich, Segment, Token } from "../src/data/schema";

const HAN = /\p{Script=Han}/u;

// ---------------------------------------------------------------------------
// Traditional word segmentation / polyphone support
// ---------------------------------------------------------------------------
//
// pinyin-pro ships an EMPTY traditional dictionary (getTraditionalDict() -> []),
// so `traditional: true` alone still mis-reads common polyphones on Traditional
// text (音樂→lè, 長大→cháng, 銀行→xíng). Feeding addTraditionalDict a
// traditional→simplified CHARACTER map lets pinyin-pro reuse its rich Simplified
// word dictionary for segmentation AND context-aware polyphone resolution, which
// fixes those readings at the source. This is a curated, high-confidence subset
// aimed at mid-grade elementary vocabulary; drop in @pinyin-pro/data's full map
// (or an OpenCC table) for exhaustive coverage. It only improves the *draft* —
// the canonical bank is still human-proofread and locked by polyphone.test.ts.
const TRAD_TO_SIMP: Record<string, string> = {
  長: "长",
  樂: "乐",
  銀: "银",
  覺: "觉",
  為: "为",
  種: "种",
  過: "过",
  來: "来",
  這: "这",
  個: "个",
  們: "们",
  時: "时",
  會: "会",
  東: "东",
  動: "动",
  對: "对",
  錢: "钱",
  買: "买",
  賣: "卖",
  場: "场",
  醫: "医",
  圓: "圆",
  邊: "边",
  頭: "头",
  條: "条",
  魚: "鱼",
  鳥: "鸟",
  馬: "马",
  點: "点",
  還: "还",
  幾: "几",
  麼: "么",
  給: "给",
  從: "从",
  變: "变",
  隻: "只",
  裡: "里",
  顏: "颜",
  蟲: "虫",
  讀: "读",
  車: "车",
  開: "开",
  關: "关",
  聽: "听",
  說: "说",
  話: "话",
  語: "语",
  詞: "词",
  樣: "样",
  歡: "欢",
  紅: "红",
  綠: "绿",
  黃: "黄",
  藍: "蓝",
  圖: "图",
  課: "课",
  寫: "写",
  讓: "让",
  應: "应",
  該: "该",
  願: "愿",
  學: "学",
  國: "国",
  華: "华",
  見: "见",
  兒: "儿",
  園: "园",
  灣: "湾",
  適: "适",
  傷: "伤",
  難: "难",
  鋼: "钢",
  鉛: "铅",
  筆: "笔",
  書: "书",
  獅: "狮",
  蘋: "苹",
  蘿: "萝",
  蔔: "卜",
  顆: "颗",
  幫: "帮",
  聲: "声",
  響: "响",
  貓: "猫",
};

let traditionalDictLoaded = false;
/** Register the traditional→simplified map once (pinyin-pro keeps it in global
 * state). Idempotent; called at the start of the annotate pipeline. */
function loadTraditionalDict(): void {
  if (traditionalDictLoaded) return;
  addTraditionalDict(TRAD_TO_SIMP);
  traditionalDictLoaded = true;
}

// ---------------------------------------------------------------------------
// pinyin -> zhuyin
// ---------------------------------------------------------------------------

const TONE_VOWELS: Record<string, [string, number]> = {
  ā: ["a", 1],
  á: ["a", 2],
  ǎ: ["a", 3],
  à: ["a", 4],
  ō: ["o", 1],
  ó: ["o", 2],
  ǒ: ["o", 3],
  ò: ["o", 4],
  ē: ["e", 1],
  é: ["e", 2],
  ě: ["e", 3],
  è: ["e", 4],
  ī: ["i", 1],
  í: ["i", 2],
  ǐ: ["i", 3],
  ì: ["i", 4],
  ū: ["u", 1],
  ú: ["u", 2],
  ǔ: ["u", 3],
  ù: ["u", 4],
  ǖ: ["ü", 1],
  ǘ: ["ü", 2],
  ǚ: ["ü", 3],
  ǜ: ["ü", 4],
  ń: ["n", 2],
  ň: ["n", 3],
  ǹ: ["n", 4],
  ḿ: ["m", 2],
};

// Tones 2/3/4 are trailing marks; tone 1 is unmarked. The neutral tone (輕聲)
// is written with a LEADING dot per Taiwan orthography and validate.ts's regex
// ^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$ — see applyTone().
const TONE_SUFFIX: Record<number, string> = { 1: "", 2: "ˊ", 3: "ˇ", 4: "ˋ" };
const NEUTRAL_PREFIX = "˙";

function applyTone(body: string, tone: number): string {
  return tone === 5 ? NEUTRAL_PREFIX + body : body + (TONE_SUFFIX[tone] ?? "");
}

const INITIALS = [
  "zh",
  "ch",
  "sh",
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "k",
  "h",
  "j",
  "q",
  "x",
  "r",
  "z",
  "c",
  "s",
];
const INITIAL_Z: Record<string, string> = {
  b: "ㄅ",
  p: "ㄆ",
  m: "ㄇ",
  f: "ㄈ",
  d: "ㄉ",
  t: "ㄊ",
  n: "ㄋ",
  l: "ㄌ",
  g: "ㄍ",
  k: "ㄎ",
  h: "ㄏ",
  j: "ㄐ",
  q: "ㄑ",
  x: "ㄒ",
  zh: "ㄓ",
  ch: "ㄔ",
  sh: "ㄕ",
  r: "ㄖ",
  z: "ㄗ",
  c: "ㄘ",
  s: "ㄙ",
};
const FINAL_Z: Record<string, string> = {
  a: "ㄚ",
  o: "ㄛ",
  e: "ㄜ",
  ê: "ㄝ",
  ai: "ㄞ",
  ei: "ㄟ",
  ao: "ㄠ",
  ou: "ㄡ",
  an: "ㄢ",
  en: "ㄣ",
  ang: "ㄤ",
  eng: "ㄥ",
  ong: "ㄨㄥ",
  er: "ㄦ",
  i: "ㄧ",
  ia: "ㄧㄚ",
  ie: "ㄧㄝ",
  iao: "ㄧㄠ",
  iou: "ㄧㄡ",
  ian: "ㄧㄢ",
  in: "ㄧㄣ",
  iang: "ㄧㄤ",
  ing: "ㄧㄥ",
  iong: "ㄩㄥ",
  u: "ㄨ",
  ua: "ㄨㄚ",
  uo: "ㄨㄛ",
  uai: "ㄨㄞ",
  uei: "ㄨㄟ",
  uan: "ㄨㄢ",
  uen: "ㄨㄣ",
  uang: "ㄨㄤ",
  ueng: "ㄨㄥ",
  ü: "ㄩ",
  üe: "ㄩㄝ",
  üan: "ㄩㄢ",
  ün: "ㄩㄣ",
};
const EMPTY_RIME_INITIALS = new Set(["zh", "ch", "sh", "r", "z", "c", "s"]);
const WHOLE_SYLLABLE: Record<string, string> = {
  er: "ㄦ",
  ê: "ㄝ",
  hm: "ㄏㄇ",
  hng: "ㄏㄥ",
  ng: "ㄥ",
  n: "ㄋ",
  m: "ㄇ",
};
const Y_FINALS: Record<string, string> = {
  yi: "i",
  ya: "ia",
  ye: "ie",
  yao: "iao",
  you: "iou",
  yan: "ian",
  yin: "in",
  yang: "iang",
  ying: "ing",
  yong: "iong",
  yo: "io",
  yu: "ü",
  yue: "üe",
  yuan: "üan",
  yun: "ün",
};
const W_FINALS: Record<string, string> = {
  wu: "u",
  wa: "ua",
  wo: "uo",
  wai: "uai",
  wei: "uei",
  wan: "uan",
  wen: "uen",
  wang: "uang",
  weng: "ueng",
};

function stripTone(py: string): { base: string; tone: number } {
  let tone = 5;
  let base = "";
  for (const ch of py) {
    const hit = TONE_VOWELS[ch];
    if (hit) {
      base += hit[0];
      tone = hit[1];
    } else {
      base += ch;
    }
  }
  return { base, tone };
}

/** Convert one toned Hanyu-pinyin syllable (e.g. "zhǎng") to zhuyin ("ㄓㄤˇ"). */
export function pinyinToZhuyin(pyRaw: string): string {
  const { base, tone } = stripTone(pyRaw.trim().toLowerCase());

  const whole = WHOLE_SYLLABLE[base];
  if (whole !== undefined) return applyTone(whole, tone);

  const replaced = Y_FINALS[base] ?? W_FINALS[base] ?? base;

  let initial = "";
  let final = replaced;
  for (const cand of INITIALS) {
    if (replaced.startsWith(cand)) {
      initial = cand;
      final = replaced.slice(cand.length);
      break;
    }
  }

  // zhi/chi/shi/ri/zi/ci/si — the "i" is an empty rime, no final glyph.
  if (final === "i" && EMPTY_RIME_INITIALS.has(initial)) {
    return applyTone(INITIAL_Z[initial] ?? "", tone);
  }

  // After j/q/x a bare "u" is really ü.
  if ((initial === "j" || initial === "q" || initial === "x") && final.startsWith("u")) {
    final = "ü" + final.slice(1);
  }

  // Undo pinyin spelling contractions (iou->iu, uei->ui, uen->un).
  if (final === "iu") final = "iou";
  else if (final === "ui") final = "uei";
  else if (final === "un") final = "uen";

  const initZ = initial ? INITIAL_Z[initial] : "";
  const finZ = FINAL_Z[final];
  if (initZ === undefined || finZ === undefined) {
    throw new Error(`無法將拼音轉為注音:「${pyRaw}」(聲母 ${initial || "∅"}、韻母 ${final})`);
  }
  return applyTone(initZ + finZ, tone);
}

// ---------------------------------------------------------------------------
// line -> rich (segment[] / token[])
// ---------------------------------------------------------------------------

/** Map each character index to its pinyin-pro word index. */
function wordIndexOf(line: string, charCount: number): number[] {
  const wordLens = segment(line, { format: OutputFormat.AllSegment, traditional: true }).map(
    (s) => [...s.origin].length,
  );
  const out: number[] = Array.from({ length: charCount }, () => 0);
  let word = 0;
  let acc = 0;
  for (let i = 0; i < charCount; i++) {
    while (acc >= (wordLens[word] ?? Number.POSITIVE_INFINITY)) {
      word++;
      acc = 0;
    }
    out[i] = word;
    acc++;
  }
  return out;
}

/**
 * One line of plain text becomes a Rich value:
 * - each Chinese character is its own token carrying zhuyin,
 * - a maximal run of consecutive non-Chinese characters is a single token,
 * - Chinese characters are grouped into segments by pinyin-pro word boundaries.
 */
export function lineToRich(line: string): Rich {
  const chars = [...line];
  const readings = pinyin(line, { type: "array", toneType: "symbol", traditional: true });
  const wordOf = wordIndexOf(line, chars.length);
  const segments: Segment[] = [];

  let i = 0;
  while (i < chars.length) {
    const ch = chars[i]!;
    if (HAN.test(ch)) {
      const word = wordOf[i];
      const seg: Token[] = [];
      while (i < chars.length && HAN.test(chars[i]!) && wordOf[i] === word) {
        seg.push({ t: chars[i]!, z: pinyinToZhuyin(readings[i] ?? "") });
        i++;
      }
      segments.push(seg);
    } else {
      let buf = "";
      while (i < chars.length && !HAN.test(chars[i]!)) {
        buf += chars[i]!;
        i++;
      }
      segments.push([{ t: buf }]);
    }
  }
  return segments;
}

// ---------------------------------------------------------------------------
// draft -> staging
// ---------------------------------------------------------------------------

export interface AnnotateOptions {
  draftsDir: string;
  stagingDir: string;
}

async function dirExists(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Annotate every *.txt draft into a matching *.json under stagingDir.
 * Returns the written paths (sorted). Reruns over unchanged drafts produce
 * byte-identical output. Throws an actionable Chinese error when draftsDir
 * is missing.
 */
export async function annotate(opts: AnnotateOptions): Promise<string[]> {
  if (!(await dirExists(opts.draftsDir))) {
    throw new Error(
      `找不到草稿目錄:${opts.draftsDir}\n請先建立 src/data/drafts/ 目錄,放入 *.txt 純文字草稿(每行一句),再執行 bun run annotate。`,
    );
  }

  loadTraditionalDict();
  const files = (await readdir(opts.draftsDir)).filter((f) => f.endsWith(".txt")).sort();
  await mkdir(opts.stagingDir, { recursive: true });

  const written: string[] = [];
  for (const file of files) {
    const text = await readFile(path.join(opts.draftsDir, file), "utf8");
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const rich: Rich[] = lines.map(lineToRich);
    const outPath = path.join(opts.stagingDir, file.replace(/\.txt$/, ".json"));
    await writeFile(outPath, `${JSON.stringify(rich, null, 2)}\n`);
    written.push(outPath);
  }
  return written.sort();
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "..");
  annotate({
    draftsDir: path.join(root, "src/data/drafts"),
    stagingDir: path.join(root, "src/data/staging"),
  })
    .then((written) => {
      console.info(`已產生 ${written.length} 個 staging 檔:`);
      for (const p of written) console.info(`  ${path.relative(root, p)}`);
    })
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}
