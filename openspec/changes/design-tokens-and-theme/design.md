## Context

專案是全新 Bun scaffold(Bun 原生 HTML bundler + dev server,React 19,Tailwind v4 via bun-plugin-tailwind ^0.1.2,build.ts 產靜態 dist)。目前只有佔位 App 與空的 index.css(`@import "tailwindcss"`)。docs/rules/ui-style.md 定義了 Aura 雙主題 token 候選值(淡色待 AA 定稿),docs/design/mockup.md 是 Claude Design 可運作原型的摘要與刻意偏差清單。後續六個 change 全部依賴本 change 產出的 tokens、字型與基礎元件。

## Goals / Non-Goals

**Goals:**

- 雙主題色彩/排版/效果 tokens 定義並 AA 定稿,接進 Tailwind v4 utility
- 三態主題(auto/light/dark)解析、持久化、防 FOUC
- 粉圓字型自架(subset 後 woff2)
- Button/Card/ThemeToggle/StarField 基礎元件與 44px 觸控底線

**Non-Goals:**

- 測驗功能、音效、Motion 動畫、Radix(皆屬後續 change)
- content-driven 字型 subset(題庫尚不存在,採靜態常用字集)

## Decisions

1. **主題以 `<html data-theme="light|dark">` 為唯一 CSS 真相**,不用 `@media (prefers-color-scheme)` 定色。理由:media query 定色與手動覆蓋會有特異性衝突(深色 OS 強制淡色時 media 內的 `:root` 蓋不掉);單一屬性讓 Tailwind `@custom-variant dark ([data-theme="dark"] &)` 乾淨運作。替代方案(class `.dark` + media fallback)被否決:雙軌真相易漂移。
2. **token 走間接層**:`[data-theme="light"]` / `[data-theme="dark"]` 各給 `--surface`、`--primary` 等原始變數值;`@theme inline` 映射 `--color-surface: var(--surface)` 等,讓 utility(`bg-surface`)自動隨主題翻轉。理由:Tailwind v4 `@theme` 值需編譯期已知,間接層是 runtime 主題切換的標準解法。
3. **三態解析單一真相放 `src/theme/resolve.ts`**:`resolveTheme(stored, systemDark) → 'light'|'dark'`(stored: `'auto'|'light'|'dark'`,auto 時看 systemDark)。index.html 的 pre-paint inline script 與 zustand store 都呼叫同一規則(inline script 因無法 import,由註解標記「與 resolve.ts 同步」的 5 行複本,並以 unit test 鎖住兩者行為一致——test 直接讀 index.html 字串驗證關鍵邏輯存在)。理由:防 FOUC 需要 blocking script,而規則本體要可測。
4. **字型 subset 用 `subset-font`(harfbuzz-wasm,純 JS)**,`scripts/subset-fonts.ts` 以 `bun run` 執行:輸入 assets-src/fonts/ 的粉圓 TTF(400/700),字集 = 教育部常用字 4808 字 + ASCII + 注音符號 + 全形標點(字集清單存 scripts/charset.txt),輸出 woff2 至 src/assets/fonts/。理由:純 Bun 工具鏈(stack.md 禁引 Python);靜態字集在題庫未定時可用,注音符號必須涵蓋(ㄅ-ㄩ、聲調)。預期產物:每檔 ≤ 1.5MB。
5. **zustand store 採 per-domain slice**:本 change 只建 `src/stores/settings.ts`(theme 三態 + 未來的 sound),persist key `kaokao-settings`。理由:stack.md 要求 store 分域,避免 quiz/排行榜混入。
6. **星空層是固定 background-image(多層 radial-gradient)**,不是 DOM 星點;twinkle 動畫延後到 polish。理由:零 DOM 成本、無 reduced-motion 疑慮(靜態),分層規則(正文在 surface 卡上)由元件慣例保證。
7. **AA 檢核在測試內自動化**:以 WCAG 相對亮度公式寫 `src/styles/theme-contrast.test.ts`,對兩主題斷言 text/muted on bg+surface ≥ 4.5、primary/success/error/warning/info/accent on surface ≥ 3(UI 元件),token 值調整至全過。理由:把「定稿」變成可重跑的 gate,而非一次性人工檢查。

## Implementation Contract

**行為(端使用者可觀察):**

- 首次載入:OS 深色 → 頁面直接以深色繪製(無閃爍);OS 淡色 → 淡色。
- 點 ThemeToggle:主題立即切換並記住;重載後維持手動選擇;OS 偏好再變動不影響手動選擇。auto 狀態下 OS 偏好變動即時反映。
- 全站文字以粉圓渲染(fallback 系統字體),無 CDN 請求。
- 首頁顯示品牌標題「考考」與右上 ThemeToggle,背景有星點,正文區在卡片上。

**介面/資料形狀:**

- `resolveTheme(stored: 'auto'|'light'|'dark', systemDark: boolean): 'light'|'dark'`
- `useSettings` store:`{ theme: 'auto'|'light'|'dark', setTheme(t): void }`,persist key `kaokao-settings`,storage shape `{"state":{"theme":"auto"},"version":0}`
- CSS 契約:`html[data-theme="dark"]` 與 `html[data-theme="light"]` 必有;utility 名:`bg-bg`、`bg-surface`、`text-text`、`text-muted`、`text-primary`、`bg-primary`、`text-success/error/warning/info/accent`、`shadow-glow-primary/success/error/accent`(主題感知)、`font-num`(tabular-nums)
- 元件 props:`Button { variant?: 'primary'|'secondary'|'ghost', ... }` 原生 button 屬性透傳;`Card` 為 surface 容器;`ThemeToggle` 無 props
- `bun run subset-fonts` 重建字型;輸出檔名 `huninn-400.woff2`、`huninn-700.woff2`

**失敗模式:**

- localStorage 不可用(隱私模式):pre-paint script try/catch 後回退 auto(跟隨系統),不拋錯
- persist 內容毀損:zustand persist 回退 initial state(auto)
- 字型載入失敗:`font-display: swap` + 系統字 fallback,版面不裂

**驗收條件:**

1. `bun test` 全綠,含:resolveTheme 六種組合(3 stored × 2 system)、theme-contrast AA 斷言全過、Button 三 variant 渲染與 disabled、ThemeToggle 切換後 `data-theme` 翻轉且 aria-label 更新、pre-paint script 存在性測試
2. `bun run build` 後 dist 內含 hash 過的 woff2,index.html 有 pre-paint script,無任何 fonts.googleapis.com 引用
3. 手動/截圖:深色 OS 重載無白閃;375px 與 1280px 下首頁排版正常;ThemeToggle 命中區 ≥ 44×44px,Tab 可聚焦、Enter/Space 可觸發
4. 主題切換 transition 在 `prefers-reduced-motion: reduce` 下停用(CSS media 包住 transition 屬性)

**範圍邊界:**

- In scope:tokens/主題/字型/星空/三個基礎元件/App 殼層佔位頁
- Out of scope:任何測驗畫面、音效、Motion、Radix、題庫

## Risks / Trade-offs

- [bun-plugin-tailwind ^0.1.2 對 @theme 拆檔或 woff2 資產處理有坑] → tracer-bullet task 先驗證整條管線,失敗則改為單檔 index.css 內聯 tokens(降級方案,不影響對外契約)
- [粉圓來源 TTF 需下載且授權為 OFL] → 從 justfont 官方 GitHub release 取得,授權檔一併存入 assets-src/fonts/;檔案大(~10MB+)不進 git?→ 進 git(repo 是 take-home,自包含優先,10MB 可接受)
- [靜態字集漏字(題庫用了字集外的字)] → question-bank change 的 DoD 加「字集覆蓋檢查」;subset script 支援從參數補字
- [inline pre-paint script 與 resolve.ts 邏輯漂移] → unit test 讀 index.html 斷言關鍵 token(persist key、data-theme 賦值)存在;code review 檢查點

## Migration Plan

全新程式碼,無遷移。部署即生效;若 tracer-bullet 失敗採降級方案(單檔 tokens),對外契約不變。

## Open Questions

(none — 三視角 review 的發現已全數納入)
