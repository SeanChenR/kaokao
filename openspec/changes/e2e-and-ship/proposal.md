## Why

功能全數完成,出貨前最後一哩:JD 繳交要求 README(啟動方式、設計思路、取捨、延伸規劃),e2e 需要手機視口專案化(現在只有桌機 project),並確認 Vercel 線上版可完整遊玩。

## What Changes

- Playwright 設定加 mobile project(iPhone 視口)跑核心流程 spec,桌機跑全部;CI 友善(workers/retries 設定)
- README 全面改寫:專案介紹、demo 連結、啟動指令、架構總覽(資料層/狀態/元件)、設計思路(星空自習室概念、注音工程、a11y、動效取捨)、加分項對照表、「若有更多時間」延伸清單
- 線上驗收:對 Vercel production URL 跑一次 smoke(手動 + script 註記)
- 掃尾:移除殘留 TODO/console、依賴檢查(未使用套件)、bun.lock 整理

## Non-Goals

- 新功能、CI pipeline(Vercel 自動部署已足夠 take-home 場景)
- 跨瀏覽器矩陣(Chromium 已足)

## Capabilities

### New Capabilities

- `ship-readiness`: 手機視口 e2e project、README 交付內容、線上冒煙確認

### Modified Capabilities

(none)

## Impact

- Affected specs: ship-readiness(新)
- Affected code:
  - New: (none)
  - Modified: playwright.config.ts, README.md, package.json(必要時)
  - Removed: 未使用依賴(若掃出)
