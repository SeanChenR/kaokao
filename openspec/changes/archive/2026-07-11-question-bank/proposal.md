## Why

測驗的一切內容源自題庫。本 change 建立題庫 JSON 的 schema 與內容(五題型、每型 3+ 題、每個中文字預寫注音)、注音產製工具鏈,以及全站唯一的注音渲染元件 — 這是 JD 最重視的「注音不能出錯」加分項的地基,quiz-flow 與 question-types 都依賴它。

## What Changes

- 定義題庫 TypeScript 型別與單一 JSON 題庫檔:五種題型(single/multi/fill/match/image)各自的資料形狀,題幹與選項文字為「字+注音」token 陣列(每個中文字都有注音;非中文字元 token 無注音欄位)
- 題庫內容:國小中年級國語+常識混合,每題型至少 3 題(共 ≥15 題),含配對題左右項、圖片題的幾何圖形代碼、填空題的多個可接受答案
- 注音 authoring 工具:scripts/annotate-zhuyin.ts 用 pinyin-pro(devDependency)把純文字題目草稿轉成含注音 token 的 JSON 初稿,破音字由人工校對後定稿存入題庫;執行期零轉換依賴
- 注音正確性防護:題庫載入時以手寫驗證函式檢查(所有中文字元必有注音、注音必為合法注音符號組合、答案索引在範圍內);不引入 zod — stack.md 未列且此為單一資料邊界,手寫斷言即可(若 Sean 想改用 zod 再議);破音字校對紀錄留在題庫檔的 meta 欄
- Ruby 渲染元件 src/components/ZhuyinText.tsx:以原生 <ruby><rt> 渲染 token 陣列,注音字級 0.5em、注音可全域開關(settings store 加 zhuyin: boolean,預設開)
- 注音開關 ZhuyinToggle 元件(比照 ThemeToggle 的 a11y 契約:原生 button、44px、aria-label 反映狀態、persist)
- 字集覆蓋檢查:subset 字集需涵蓋題庫所有用字,以測試把關(題庫任何字不在 scripts/charset.txt 內即失敗)

## Non-Goals

- 不做抽題邏輯與作答流程(quiz-flow change)
- 不做題型作答元件(question-types change;本 change 只渲染文字)
- 不做題庫後台/編輯器 — JSON 手工維護即可

## Capabilities

### New Capabilities

- `question-bank`: 題庫 schema、五題型資料形狀、每字注音、zod 驗證、authoring 工具鏈、字集覆蓋
- `zhuyin-rendering`: ZhuyinText ruby 渲染、注音全域開關與持久化

### Modified Capabilities

(none)

## Impact

- Affected specs: question-bank(新)、zhuyin-rendering(新)
- Affected code:
  - New: src/data/questions.json, src/data/schema.ts(TS 型別 + 手寫驗證), src/data/bank.ts(載入+驗證), scripts/annotate-zhuyin.ts, src/components/ZhuyinText.tsx, src/components/ui/ZhuyinToggle.tsx, 對應測試檔
  - Modified: src/stores/settings.ts(加 zhuyin 開關), package.json(無新套件;pinyin-pro 已在 devDependencies)
  - Removed: (none)
