## Context

27 條 e2e 皆單一桌機 project;README 還是 scaffold 級;Vercel 已接 main 自動部署。本 change 純收斂,無新行為。

## Goals / Non-Goals

**Goals:** mobile e2e project、交卷級 README、線上冒煙
**Non-Goals:** 新功能、CI、跨瀏覽器

## Decisions

1. **Playwright projects**:`desktop`(現況全 spec)+ `mobile`(iPhone 14 device preset,只跑 quiz-flow/results 核心流程與 a11y — 截圖 spec 已自帶視口設定,排除)。`fullyParallel` + CI 時 `workers: 2, retries: 1`(本地 flake 經驗)
2. **README 結構**:Demo 連結置頂 → 快速開始 → 玩法截圖(雙主題)→ 架構(檔案地圖 + 資料流)→ 設計思路(概念/注音工程含破音字防護/a11y/動效)→ 加分項對照 JD 表 → 測試策略 → 若有更多時間 → 授權(字型 OFL 標註)
3. **線上冒煙**:`E2E_BASE_URL` 環境變數讓 playwright 可指向 production;README 記載 `E2E_BASE_URL=https://… bunx playwright test e2e/theme-smoke.spec.ts` 用法;本 change 執行一次並記錄結果
4. **依賴掃描**:knip 不引入;用 `bun pm ls` + grep 手查未使用套件

## Implementation Contract

**驗收條件:**

1. `bunx playwright test` 桌機+手機兩 project 全綠
2. README 含上述全部段落,啟動指令實測可跑
3. production URL 冒煙通過(主題切換、注音開關、開始作答)
4. 全套 gate 零錯

**範圍邊界:** In:config/README/線上驗證。Out:程式行為變更

## Risks / Trade-offs

- [mobile project 讓 e2e 時間翻倍] → mobile 只跑核心三 spec
- [production 冒煙依賴外網] → 標記為手動步驟,不進預設測試

## Migration Plan

無。

## Open Questions

(none)
