# kaokao 考考

國小/國中學生線上測驗頁(single page)— 前端 take-home 作品。

## 快速開始

```bash
bun install
bun dev            # 開發(HMR)
```

## 指令

```bash
bun test           # unit/component 測試
bun run e2e        # Playwright E2E
bun run typecheck  # tsgo --noEmit
bun run lint       # oxlint
bun run format     # oxfmt
bun run build      # 產出靜態檔
bun run subset-fonts  # 重建自架字型(改 scripts/charset.txt 後執行)
```

## 技術棧與設計思路

- 技術選型與理由:`docs/rules/stack.md`
- 開發流程(Spec-Driven Development):`docs/rules/workflow.md`
- UI 風格指南:`docs/rules/ui-style.md`

_README 的設計思路與延伸規劃段落將於實作完成後補齊。_
