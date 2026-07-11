## Summary

Sean:dialog 按鈕文字(含注音)換行難看 — 加寬並保證按鈕文字單行。

## Proposed Solution

SubmitDialog max-w-90 → max-w-lg;按鈕列 flex-col(窄幕直疊、全寬)→ sm 以上並排;按鈕文字 whitespace-nowrap。e2e 斷言 dialog 按鈕內文字單行(高度 < 2 行)。

## Impact

- Affected code: src/components/quiz/SubmitDialog.tsx、e2e
