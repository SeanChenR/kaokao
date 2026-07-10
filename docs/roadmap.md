# Roadmap — kaokao 考考

Loop 的 change 執行順序與進度(由 kaokao-goal 每輪更新)。規格細節以各 change 的 spectra 文件為準,此處只管順序與粒度。

## Changes(串行)

- [ ] 1. `design-tokens-and-theme` — Aura 雙主題 tokens 接進 Tailwind v4 `@theme`、粉圓字型自架與 subset、ThemeToggle(跟隨系統+手動)、基礎 Button/Card 元件
- [ ] 2. `question-bank` — 題庫 JSON schema(五題型)、每型 3+ 題內容(國小中年級國語+常識)、注音 authoring script(pinyin-pro 產初稿+人工校對格式)、Ruby 注音渲染元件(每個中文字都標)+ 注音開關
- [ ] 3. `quiz-flow` — zustand store(persist)、開始畫面(姓名必填 1–12 字+記住上次)、抽題(每題型各 1)、作答框架(星空進度軌道、題號導航、上一題/下一題、送出+未答提醒 dialog)、10 分鐘倒數(時間到自動送出)
- [ ] 4. `question-types` — 五種題型作答元件:單選、多選、填空、配對(點選連線)、圖片題,含各互動狀態與鍵盤操作
- [ ] 5. `results-and-leaderboard` — 計分(送出後揭曉)、結果頁(分數+回顧列表+星軌全亮+confetti)、排行榜(分數↓用時↑ Top 10,高亮本次)、再玩一次
- [ ] 6. `polish` — Motion 動效(切題/點星/spring)、Web Audio 音效(預設靜音)、a11y 全檢(鍵盤/focus/語意/AA 對比)、RWD 收尾、reduced-motion
- [ ] 7. `e2e-and-ship` — Playwright 完整流程測試(含手機視口)、Vercel 部署設定、README(啟動/設計思路/取捨/延伸)

## 備註

- 設計稿:Claude Design「考考 星空自習室」(import 後放 `docs/design/`),實作以它為視覺基準
- 注音規則:題目與選項**每個中文字都要標注音**(Sean 2026-07-10 指示),介面 chrome 不標
