# kaokao 考考 ⭐

> 國小/國中學生的線上測驗頁 — 「星空自習室」:淡色是白天的天空,深色是夜空;每答完一題,就點亮一顆星。

**Live Demo:** <https://kaokao-seanchenrs-projects.vercel.app>

## 快速開始

```bash
bun install
bun dev            # http://localhost:3000(HMR)
```

## 指令

```bash
bun test           # 190 個 unit/component 測試(bun test + Testing Library + happy-dom)
bun run e2e        # 42 條 Playwright(desktop + mobile 兩個 project)
bun run typecheck  # TypeScript 7(tsgo)
bun run lint       # oxlint
bun run format     # oxfmt
bun run build      # 靜態產出至 dist/
bun run subset-fonts  # 重建自架字型(改 scripts/charset.txt 後執行)
bun run annotate      # 題目草稿 → 注音初稿(drafts/ → staging/,人工校對後入題庫)
```

對部署站冒煙:`E2E_BASE_URL=https://kaokao-seanchenrs-projects.vercel.app bunx playwright test e2e/theme-smoke.spec.ts --project=desktop`

## 架構總覽

```
src/
├── data/            # 題庫 JSON(五題型、每字注音)+ schema + 結構驗證
├── quiz/            # 純邏輯:抽題(rng 注入)、isAnswered、判分、時間
├── stores/          # zustand:settings(persist)/ quiz(sessionStorage 續命)/ leaderboard
├── components/
│   ├── ZhuyinText   # 全站唯一注音渲染(ruby;可開關;關閉時輸出單一文字節點)
│   ├── quiz/        # 開始/作答/結果三畫面 + 星軌/計時/題卡/dialog
│   │   └── widgets/ # 五題型作答元件(aria 對照表驅動)
│   └── ui/          # Button/Card/主題・注音・音效三顆 Toggle
├── motion/          # spring presets(全站手感單一來源)
├── audio/           # Web Audio 單例(預設靜音)
└── styles/          # Aura 雙主題 tokens(WCAG AA 測試把關)
scripts/             # 字型 subset、注音 authoring、UI 文案注音產生
openspec/            # Spec-Driven Development 的規格與變更紀錄
```

資料流:題庫 JSON →(每題型隨機抽 1)→ quiz store(sessionStorage)→(QuestionSlot 契約)→ 五題型 widgets → 送出判分 → 排行榜(localStorage)。

## 設計思路

**視覺 —「星空自習室」**:一個隱喻管雙主題。配色取自 [Aura Theme](https://github.com/daltonmenezes/aura-theme),深色近原生 neon、淡色同色相加深;全部色彩 token 由 `theme-contrast.test.ts` 以 WCAG AA 公式把關(改色不過測試就紅)。進度不是進度條,是一條星軌 — 答完點亮、答對發光。

**注音工程(題目最重視的「不能出錯」)**:

- 注音**預寫**入資料(題庫 JSON 與產生的 UI 文案),執行期零轉換 — 錯誤可控、可測試
- authoring 管線:pinyin-pro(自建繁→簡字表補其空繁體詞庫)斷詞 + 自建 400 音節拼音→注音轉換 → **人工校對破音字** → golden 測試鎖死(長ㄔㄤˊ/ㄓㄤˇ、行ㄒㄧㄥˊ/ㄏㄤˊ、樂ㄌㄜˋ/ㄩㄝˋ、「一」的變調含「第一」序數不變調、輕聲前置 ˙ㄉㄜ)— 改錯任何讀音,測試立刻紅
- 字集覆蓋測試直接讀 woff2 cmap:題庫任何字不在自架字型內就紅(杜絕 tofu)
- 範圍:**所有學生可見文字**(含按鈕與提示)都有注音,一鍵開關;互動元件另帶純文字 aria-label 保 screen reader 乾淨

**a11y**:每題型固定 aria 對照(radiogroup / checkbox / textbox / aria-pressed + live region)、鍵盤完整作答、切題焦點管理、44px+ 觸控目標、reduced-motion 全面尊重、對錯不只靠顏色。

**動效/音效的克制**:動效集中在五個有意義的時刻(切題、點星、連線、結果、按壓),spring 參數單一來源;音效預設靜音(教室情境),取消選取不出聲、零分不慶祝。

**工程取捨**:

- 一次一題 + AnimatePresence `mode="wait"`:任何瞬間畫面只有一個題幹,焦點與測試都乾淨
- sessionStorage 續命:誤觸重整不丟這一場;deadline 用時間戳對錶,背景分頁不作弊
- 排行榜單機(localStorage)+ 示範資料明確標記 — 不假裝有後端

## 加分項對照

| JD 加分項            | 實作                                           |
| -------------------- | ---------------------------------------------- |
| 注音 Ruby annotation | 全站每字注音 + 破音字 golden 防護 + 可開關     |
| 無障礙               | aria 對照表、鍵盤全程、焦點管理、AA 對比自動化 |
| 適度動效             | Motion spring 五時刻 + reduced-motion          |
| 深淺色主題           | Aura 雙主題、跟隨系統+手動、防 FOUC            |
| RWD                  | 375/768/1280 走查 + mobile e2e project         |

## 測試策略

- **單元/元件(190)**:狀態機、判分矩陣、注音 golden、AA 對比、字集覆蓋、aria 契約
- **E2E(42,desktop + mobile)**:真實作答全流程、reload 續命、鍵盤、注音開關穿透、a11y 結構
- 原則:狀態轉移歸 RTL;幾何、座標、字型載入歸 Playwright 真瀏覽器

## 若有更多時間

- 題庫後台(Rich 編輯器 + 注音校對 diff 檢視)
- 音效資產化(取代合成音)與更豐富的結果慶祝
- 錯題重練模式、多份考卷
- 雲端排行榜(目前刻意單機)
- 視覺回歸測試(Playwright screenshot diff)

## 授權標註

字型:jf open 粉圓(open-huninn)© justfont,SIL Open Font License 1.1(全文見 `assets-src/fonts/OFL.txt`);本專案自行 subset 為 woff2。
