# Development Workflow

本 repo 嚴格走 **Spectra SDD** + **Matt Pocock engineering skills**。一次做一個功能,不直接照題目一次寫完。

## 主流程

```
(discuss?) → propose → apply ⇄ ingest → archive
```

- 每個功能 = 一個 spectra change(`openspec/changes/`),完成後 archive 進 specs
- `.spectra.yaml` 已開 `tdd: true`、`worktree: true`:實作走 red-green-refactor vertical slices,change 在獨立 worktree 進行
- 需求不清先 `/spectra-discuss` 或 `grill-with-docs`;中途需求變更走 plan mode → `/spectra-ingest` → 繼續 apply
- Stack / 套件 / 架構取捨:**必先與 Sean 討論**,定案後寫進 `docs/rules/` 或 ADR,不可單方面決定

## Matt skills 使用時機

| 情境                             | Skill                           |
| -------------------------------- | ------------------------------- |
| 壓力測試計畫、建立 domain model  | `grill-with-docs`(user-invoked) |
| 超過單一 session 的大塊工作規劃  | `wayfinder`(user-invoked)       |
| 對話 → spec 發佈                 | `to-spec`(user-invoked)         |
| 計畫 → tracer-bullet tickets     | `to-tickets`(user-invoked)      |
| Issue 狀態機管理                 | `triage`(user-invoked)          |
| 設計問題不確定 → 丟棄式原型      | `prototype`                     |
| 難搞的 bug                       | `diagnosing-bugs`               |
| 寫功能 / 修 bug                  | `tdd`                           |
| 維護 CONTEXT.md / ADR            | `domain-modeling`               |
| 模組介面設計                     | `codebase-design`               |
| Diff 審查(Standards + Spec 雙軸) | `code-review`                   |

## Loop Engineering(AFK 自主模式,2026-07-10 grill 定案)

Sean 給 bypass 權限後,開發由 `/loop` 驅動 `kaokao-goal` skill 自主進行。規則:

### Loop 結構

- **驅動**:Sean 用 `/loop` 發動;每輪執行 `kaokao-goal` skill 定義的回合;**全部 roadmap change 完成且驗證通過才停**,中途不等人
- **狀態檔**:`docs/roadmap.md`(change 清單與進度)+ 各 change 的 `tasks.md`(spectra 管理);loop 每輪從狀態檔恢復記憶,不依賴對話上下文
- **平行度**:一次一個 change(串行);change 內互不相依的 task 可開 subagent 平行

### Spec 階段(每個 change 開始前)

1. 我寫 proposal 草稿(`/spectra-propose`)
2. 同時開 3 個視角的 subagent 批判:**產品**(對照 JD 與 roadmap)、**工程架構**(對照 stack.md 與 ADR)、**UX/a11y**(對照 ui-style.md)
3. 彙整修改;真正無法自決的分歧 → park + 通知 Sean

### DoD gate(每個 change 結束前,全過才能 merge)

1. `bun run typecheck` + `bun run lint` 零錯誤
2. `bun test` 全綠(TDD 產出的 unit/component)
3. `bun run e2e` 全綠(Playwright)
4. `/spectra-verify` — 實作對照 spec
5. `code-review` skill(Standards + Spec 雙軸,獨立 subagent 當 checker,不自己改自己的考卷)
6. 瀏覽器截圖自檢:雙主題 × 手機/桌機,對照 ui-style.md

### Git / PR 流程

- Change 在 worktree branch 開發,commit 自動(conventional commits)
- Change 完成 → push branch → `gh pr create` → subagent 做 PR review(雙軸)→ 無 CRITICAL/HIGH 就 **squash merge** → `/spectra-archive` → 刪 branch
- main 每次 merge 觸發 Vercel 自動部署(Sean 需先在 Vercel 連結 repo 一次)

### 卡關護欄

- 同一 task 的 gate **連續失敗 3 次** → 停止重試:把卡點寫進 change 筆記 → `spectra park` → 發推播通知 Sean → 繼續下一個不相依的 change;沒有可繼續的才停 loop
- 規格層決策點(spec 沒寫、rules 沒答案、非我能自決)比照辦理
- 禁止事項:不改 `docs/rules/` 與 `.spectra.yaml`(那是人的領域)、不 force push、不刪除 change 歷史

### 人的驗收

- Loop 全部跑完後,Sean 驗收 demo 與 PR 紀錄;發現問題開新 change 修正
- 推播通知使用時機:park、loop 完成、致命錯誤

## Issue tracker

GitHub Issues(`SeanChenR/kaokao`),用 `gh` CLI。詳見 `docs/agents/issue-tracker.md`;triage 標籤見 `docs/agents/triage-labels.md`。

## Git

- Conventional commits:`feat|fix|refactor|docs|test|chore|perf|ci: <description>`
- 只 commit 與當前 change 相關的檔案(`/spectra-commit`)

## 文件位置

- Domain model:root `CONTEXT.md`(由 domain-modeling lazily 建立,勿手動預建)
- 架構決策:`docs/adr/`
- 開發規範:`docs/rules/`(本資料夾)
- 原始需求:`docs/reference/JD_SeniorProgrammer_frontend.pdf`
