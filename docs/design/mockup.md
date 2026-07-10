# 設計稿 — 考考 星空自習室(Claude Design)

Sean 已認可此稿為視覺基準。實作以它為準,偏差項見下。

## 來源(用 DesignSync 工具讀取,不存副本避免 drift)

- Project ID:`a9b28b94-feb5-4e3a-ab34-c5060eaf2271`
- 檔案:`考考 星空自習室.dc.html`(`DesignSync` → `get_file`)
- 網頁:<https://claude.ai/design/p/a9b28b94-feb5-4e3a-ab34-c5060eaf2271>

## 設計稿內容摘要

- 三畫面 state machine:start / quiz / result,同一元件內切換
- 雙主題 tokens 與 ui-style.md 一致(dark = Aura 原生,light = 加深衍生);星空背景用多層 radial-gradient
- 星軌:淺弧 SVG 虛線 + 5 顆星按鈕(可點擊跳題),已答點亮(紫/綠/粉輪替)+ drop-shadow glow,當前題 softPulse
- 題卡:題型 badge、注音 ruby(rt 用 info 色 0.5em)、slideIn 切題動畫
- 五題型互動皆已實作:單選/多選(選項卡+marker)、填空(行內 input)、配對(點左再點右,SVG 連線 accent 色)、圖片題(CSS clip-path 幾何圖形)
- 未答提醒 dialog(🌙「還有 N 題沒寫完喔」)、送出後結果頁(emoji 分級文案、星星全亮、confetti CSS 動畫、回顧列表 border-left 對錯色、排行榜高亮自己)
- 音效:Web Audio sine blip;`prefers-reduced-motion` 已處理

## 實作時的刻意偏差(以 repo 規範為準)

1. **注音**:設計稿只標了部分字 — 正式版**題目與選項每個中文字都要標**(Sean 指示)
2. **字型**:設計稿用 Google Fonts `Huninn`(= jf open 粉圓)— 正式版自架 woff2 subset,不用 CDN
3. **題庫**:設計稿寫死 5 題 — 正式版題庫 JSON 每型 3+ 題隨機抽
4. **排行榜**:設計稿是假資料 seedBoard — 正式版 localStorage(zustand persist),seed 可留作初始資料
5. **架構**:設計稿是單一 class component + inline style — 正式版照 stack.md(React 19 函式元件、Tailwind v4、Zustand、Radix、Motion),只取其視覺與互動規格
6. **注音開關**:設計稿沒有 — 正式版要加(grill 定案)
