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
