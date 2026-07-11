## 1. E2E 專案化

- [x] 1.1 playwright.config.ts 加 desktop/mobile projects(mobile 用 device preset,只含 quiz-flow/results/a11y)、支援 E2E_BASE_URL 指向部署站、CI 參數(spec: Mobile viewport regression coverage);驗證:`bunx playwright test` 兩 project 全綠

## 2. README 與出貨

- [x] 2.1 README 全面改寫(design Decision 2 結構,含 demo 連結、加分項對照、字型 OFL 標註)(spec: Submission-grade README);驗證:照 README 指令從乾淨 clone 心智走一遍;內容齊全
- [ ] 2.2 production 冒煙:E2E_BASE_URL 指向 Vercel 跑 theme-smoke + 手動玩一輪;依賴掃描與殘留 TODO/console 清理;全套 gate。驗證:冒煙綠 + gate 零錯
