---
name: kaokao-goal
description: kaokao 的自主開發回合(loop body)。由 /loop 驅動:每輪從 docs/roadmap.md 與 spectra 狀態恢復進度,推進當前 change 的下一步,直到 roadmap 全部完成才停。Use when driving autonomous development rounds for this repo, or when the user invokes /kaokao-goal or /loop with this skill.
---

# kaokao-goal — 自主開發回合

每輪執行以下狀態機。**先讀狀態,再行動**;規則細節以 `docs/rules/workflow.md` 的 Loop Engineering 章節為準,stack 以 `docs/rules/stack.md`、UI 以 `docs/rules/ui-style.md` 為準。

## 每輪流程

1. **恢復狀態**:讀 `docs/roadmap.md` + `spectra list`(含 `--parked`)。判斷現在處於哪一步:
   - 有 active change 且 tasks 未完 → 跳到步驟 3
   - 有 active change 且 tasks 全勾 → 跳到步驟 4
   - 無 active change → 步驟 2

2. **開新 change(Spec 階段)**:取 roadmap 下一個未完成且未 parked 的 change:
   - `/spectra-propose` 寫 proposal 草稿
   - 平行開 3 個 subagent 批判草稿:產品視角(對照 `docs/reference/` JD 重點與 roadmap)、工程視角(對照 stack.md/ADR)、UX+a11y 視角(對照 ui-style.md)
   - 彙整修改後定稿,產出 tasks → 進步驟 3

3. **推進實作**:`/spectra-apply` 繼續當前 change 的下一個未勾 task,走 TDD(red-green-refactor);互不相依的 task 可開 subagent 平行。每完成一個 task 就 commit(conventional commits)並勾掉。

4. **收尾 change(DoD gate,順序執行,全過才算)**:
   1. `bun run typecheck` && `bun run lint`
   2. `bun test`
   3. `bun run e2e`
   4. `/spectra-verify`
   5. `code-review` skill(獨立 subagent,Standards+Spec 雙軸);CRITICAL/HIGH 必修
   6. 瀏覽器截圖自檢:淡色+深色 × 375px+1280px,對照 ui-style.md
   - 全過 → push branch → `gh pr create` → subagent PR review → squash merge → `/spectra-archive` → 更新 roadmap.md 勾掉該 change → 回步驟 1

## 護欄

- **重試上限**:同一 task 的 gate 連續失敗 3 次 → 把卡點與已嘗試方案寫進 change 筆記 → `spectra park <change>` → 推播通知 Sean → 回步驟 1 找下一個不相依的 change
- **決策點**:遇到 spec/rules 都沒答案、需要人取捨的事 → 同上(記錄 → park → 通知),不要瞎猜大方向
- **禁區**:不修改 `docs/rules/`、`.spectra.yaml`、`.claude/`;不 force push;不動 parked change 除非 Sean 說解封
- **停止條件**:roadmap 全部 change 已 archive(或剩餘全是 parked)→ 推播通知 Sean 總結成果,停止 loop(ScheduleWakeup stop)

## 每輪結束時

- 一段話總結:完成了什麼、目前在哪個 change 哪個 task、有無 park
- 若 loop 由 ScheduleWakeup 驅動,依工作量選下一輪延遲(有活幹選短,等外部條件選長)
