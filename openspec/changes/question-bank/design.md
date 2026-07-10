## Context

change 1 已建立主題/字型/基礎元件地基(openspec/specs/ 有 theme-system、base-components)。本 change 建立題庫資料層與注音渲染 — JD 最重加分項「注音(含破音字)不能出錯」的核心。三視角 review 的全部發現已納入本設計。

## Goals / Non-Goals

**Goals:**

- 題庫 JSON schema(五題型)與 ≥15 題內容,每個中文字預寫注音,破音字刻意入庫且有讀音回歸防護
- 冪等的注音 authoring 工具鏈(pinyin-pro 初稿 → 人工校對 → canonical)
- ZhuyinText ruby 渲染元件與 ZhuyinToggle 全域開關

**Non-Goals:**

- 抽題、作答流程(quiz-flow)、題型作答元件(question-types)、題庫編輯器
- zod(手寫驗證即可,單一資料邊界;要改用 zod 需與 Sean 討論)

## Decisions

1. **token 採「詞組分段」兩層結構**:文字 = `Segment[]`,`Segment = Token[]`,`Token = { t: string, z?: string }`(一個中文字一 token 且必有 z;連續非中文字元一 run 一 token 且無 z)。理由:逐字 token 才能讓 ruby 注音對齊;詞組層供渲染時 `nowrap` 防止詞中斷行、也是報讀分組單位。替代方案(扁平 token 陣列)被否決:行末會把「昆蟲」拆成兩行。
2. **authoring script 冪等且永不覆寫 canonical**:`scripts/annotate-zhuyin.ts` 讀 `src/data/drafts/*.txt`(純文字草稿)輸出 `src/data/staging/*.json`(pinyin-pro 斷詞+注音初稿);人工校對後手動搬入 canonical `src/data/questions.json`。script 不寫 questions.json。`pinyin-pro` 釘精確版本(去 `^`),防詞庫改版漂移。
3. **破音字策略**:題庫內容必含至少 3 組「同字兩讀」對照(如 長:ㄔㄤˊ 長度/ㄓㄤˇ 長大;行:ㄒㄧㄥˊ 行走/ㄏㄤˊ 銀行;樂:ㄌㄜˋ 快樂/ㄩㄝˋ 音樂),分佈於不同題。`src/data/polyphone.test.ts` 為 golden 測試:硬編這些字在特定題的正確讀音,題庫改動若標錯即紅燈。
4. **驗證放測試層,不進 runtime**:`src/data/validate.ts` 匯出 `validateBank(bank)`(每中文字必有 z、z 為合法注音組合 `^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$`(輕聲 ˙ 前置)、答案索引在範圍、配對 1:1、每型 ≥3 題),由 `bank.test.ts` 呼叫;app 執行期直接信任 canonical JSON(靜態資料,CI 已把關)。
5. **字集覆蓋測橫跨到字型產物**:`src/data/charset-coverage.test.ts` 以 `fontkit`(devDependency,測試工具層)讀 `src/assets/fonts/huninn-400.woff2` 的 cmap,斷言題庫所有用字(含注音符號與聲調)都有 glyph。理由:只對 charset.txt 斷言關不住「改字集沒重跑 subset」的洞。
6. **ruby a11y 契約**:`<ruby lang="zh-TW">字<rt aria-hidden="true">ㄗˋ</rt></ruby>`;注音關閉時不渲染 rt(輸出純文字),而非 display:none。理由:rt 對讀屏是雜訊(base 已正確發音);off 時純文字對複製/報讀語意最乾淨。
7. **ZhuyinToggle 用 `aria-pressed` switch 語意**(非 ThemeToggle 的雙向動作語意),44px、原生 button、persist 於 settings store `zhuyin: boolean` 預設 true;本 change 先掛 App 殼與 ThemeToggle 並列(quiz-flow 再統一佈局)。settings persist 不加 version/migrate — zustand 預設 shallow merge 讓舊 `{theme}` payload 自動補 `zhuyin:true`,以測試鎖住此行為。
8. **配對題 schema 為 1:1 無干擾項**(`left[i]` 對 `answer[i]` 指向的 right 索引);圖片題每個 shape 帶 `label`(中文名,含注音 segments)供 a11y 與回顧頁。干擾項是 YAGNI,mockup 也是 1:1。
9. **注音字級調整為 0.55em**:0.5em 在 1.375rem 基準下約 11px,對中年級偏小;調至 0.55em 並同步 ui-style.md(PR 標注此規則微調與理由)。

## Implementation Contract

**資料形狀(src/data/schema.ts,全部手寫 TS 型別):**

- `Token = { t: string; z?: string }`;`Segment = Token[]`;`Rich = Segment[]`
- `QuestionBase = { id: string; type: QType; stem: Rich; hint?: string }`
- `SingleQ = base & { type: "single"; options: Rich[]; answer: number }`
- `MultiQ = base & { type: "multi"; options: Rich[]; answer: number[] }`(answer 遞增排序)
- `FillQ = base & { type: "fill"; suffix?: Rich; accept: string[]; placeholder?: string }`
- `MatchQ = base & { type: "match"; left: Rich[]; right: Rich[]; answer: number[] }`(answer[i] = left i 對應的 right 索引,1:1)
- `ImageQ = base & { type: "image"; shapes: { code: "circle"|"triangle"|"square"|"star"|"heart"|"hexagon"; label: Rich }[]; answer: number }`
- `QuestionBank = { meta: { proofread: string[] }; questions: Question[] }`(proofread = 人工校對過破音字的題 id 清單)

**行為:**

- `ZhuyinText({ rich, className? })`:注音開(settings.zhuyin)→ 每中文字 token 渲染 `<ruby lang="zh-TW">t<rt aria-hidden="true">z</rt></ruby>`,非中文 token 純文字;詞組包 `<span class="whitespace-nowrap">`;注音關 → 全部純文字、DOM 無 rt/ruby
- `ZhuyinToggle`:button + `aria-pressed={zhuyin}`、aria-label「注音顯示」、44px、切換寫入 store 並 persist
- `bun run annotate`(annotate-zhuyin.ts):drafts → staging,重跑不動 questions.json 與既有 staging 以外的檔案
- 題庫內容:每型 ≥3 題(共 ≥15),國小中年級國語+常識,含 ≥3 組同字兩讀破音字對照

**失敗模式:**

- validateBank 對缺注音/非法注音/索引越界/配對非 1:1/型別題數不足,回傳含題 id 與欄位的錯誤陣列(測試斷言為空)
- annotate script 對缺 drafts 目錄給中文可行動錯誤訊息

**驗收條件:**

1. `bun test` 全綠,含:schema 驗證(validateBank 對 canonical 題庫零錯誤 + 對壞資料样本報對錯誤)、polyphone golden(≥3 組同字兩讀)、charset-coverage(題庫全字 ⊆ woff2 cmap)、ZhuyinText(開/關兩態 DOM 契約、rt aria-hidden、詞組 nowrap)、ZhuyinToggle(aria-pressed 翻轉+persist)、settings 舊 payload merge(zhuyin 補 true)
2. `bun run annotate` 冪等:重跑兩次輸出相同,questions.json untouched
3. App 殼可見 ZhuyinToggle,切換後頁面上示例注音立即顯示/隱藏(殼層放一句含注音的歡迎詞作為驗證面)

**範圍邊界:**

- In scope:資料層、注音渲染、兩個開關元件掛殼、authoring 工具
- Out of scope:抽題、作答、計分、題型互動

## Risks / Trade-offs

- [pinyin-pro 斷詞/破音字判斷不完美] → 初稿本來就要人工校對;golden 測試鎖住已校對讀音;pinyin-pro 釘精確版
- [fontkit 讀 woff2 相容性] → font-worker 已在隔離環境驗證過 fontkit 讀本專案 woff2 可行;若有意外改讀 charset.txt(降級,並在測試註記關不住的洞)
- [題庫內容品質(常識題答案正確性)] → 內容由我撰寫後,DoD gate 的 code review 軸加一項「逐題事實查核」
- [0.55em 仍嫌小] → polish change 的真機檢視再最終定,tokens 已集中好改

## Migration Plan

全新資料層,無遷移;settings 靠 shallow merge 自動升級(有測試)。

## Open Questions

(none — 三視角發現已全數納入)
