## 1. Schema 與驗證

- [x] 1.1 實作 src/data/schema.ts(Token/Segment/Rich 與五題型 TS 型別,照 design.md Implementation Contract)與 src/data/validate.ts 的 `validateBank`(spec: Question bank data shape);行為:對缺注音、非法注音、索引越界、配對非 1:1、型別題數不足回報含題 id 的錯誤。驗證:src/data/validate.test.ts 以壞資料樣本斷言各錯誤類型(RED→GREEN)

## 2. Authoring 工具鏈

- [x] 2.1 實作 scripts/annotate-zhuyin.ts(spec: Idempotent zhuyin authoring pipeline):讀 src/data/drafts/*.txt → pinyin-pro 斷詞+注音 → 輸出 src/data/staging/*.json;永不寫 questions.json;缺 drafts 目錄給中文錯誤;pinyin-pro 釘精確版;package.json 加 "annotate" script。行為:重跑兩次輸出 byte-identical。驗證:scripts/annotate-zhuyin.test.ts(固定 draft 樣本,跑兩次比對輸出、斷言 questions.json mtime 不變)

## 3. 題庫內容

- [x] 3.1 撰寫題目草稿(每型 3+ 題共 ≥15,國小中年級國語+常識,刻意安排 ≥3 組同字兩讀破音字:長/行/樂 等),跑 annotate 產初稿,人工校對破音字後定稿 src/data/questions.json(meta.proofread 記校對題 id)(spec: Question bank data shape、Polyphone coverage and regression guard);行為:validateBank 對 canonical 零錯誤。驗證:src/data/bank.test.ts(載入+validateBank 零錯誤+每型 ≥3)
- [x] 3.2 撰寫 src/data/polyphone.test.ts golden 測試(spec: Polyphone coverage and regression guard):硬編 ≥3 組同字兩讀的題 id+字+讀音,斷言題庫吻合。驗證:測試綠且故意改壞一個讀音會紅(手動驗一次後還原)
- [x] 3.3 撰寫 src/data/charset-coverage.test.ts(spec: Font glyph coverage for bank content):fontkit(bun add -d,釘版)讀 src/assets/fonts/huninn-400.woff2 cmap,斷言題庫全部用字+注音符號+聲調都有 glyph。驗證:測試綠;抽查一個不在字集的罕字確認會紅(手動驗後移除)

## 4. 注音渲染

- [x] 4.1 settings store 加 `zhuyin: boolean` 預設 true(spec: Zhuyin display toggle);行為:舊 `{theme}`-only payload rehydrate 後 zhuyin=true 且 theme 保留(不加 version/migrate)。驗證:settings.test.ts 補 legacy payload 測試(RED→GREEN)
- [x] 4.2 實作 src/components/ZhuyinText.tsx(spec: Ruby rendering of rich zhuyin text):開=ruby+rt(aria-hidden、0.55em、lang="zh-TW")、詞組 nowrap;關=純文字無 ruby/rt;非中文 token 永遠純文字。驗證:ZhuyinText.test.tsx 斷言兩態 DOM 契約(RED→GREEN)
- [x] 4.3 實作 src/components/ui/ZhuyinToggle.tsx(spec: Zhuyin display toggle):原生 button、aria-pressed、44px、focus ring、切換 persist。驗證:ZhuyinToggle.test.tsx(點擊後 aria-pressed 翻轉、store 值變、reload 模擬保留)
- [x] 4.4 App 殼掛 ZhuyinToggle(與 ThemeToggle 並列)並將歡迎詞改為含注音的 Rich 範例文字經 ZhuyinText 渲染(spec: Zhuyin display toggle 的 reachable from the app shell);行為:切換立即顯示/隱藏注音。驗證:App.test.tsx 更新斷言;`bun dev` 目視

## 5. 收尾

- [x] 5.1 注音字級 0.55em 進 theme.css(rt 樣式集中定義)並同步 docs/rules/ui-style.md 的 0.5em → 0.55em(附理由);行為:rt 實際渲染 0.55em。驗證:theme.test.ts 補 rt 樣式斷言;git diff 檢視 ui-style.md 僅此處變動
- [x] 5.2 全套本地驗證:`bun run typecheck && bun run lint && bun test && bun run e2e && bun run build` 全過;README 指令段補 `bun run annotate`。驗證:指令零錯誤
