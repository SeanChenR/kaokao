## Problem

Sean 三度回報注音貼下一個字。根因確認:間距用相鄰選擇器(ruby+ruby / ruby+span / span+ruby),只覆蓋同詞組內相鄰 ruby;**詞組邊界(span+span)與夾雜文字節點處零間距**。

## Root Cause

間距掛在「相鄰關係」上,而 DOM 有三種相鄰形態(詞內 ruby、詞界 span、裸文字節點),選擇器覆蓋不全且文字節點根本選不到。

## Proposed Solution

- 改為每個 ruby 自帶 `margin-inline-end: 0.22em`(不依賴鄰居),刪除全部相鄰選擇器 — 任何後繼內容(字/詞界/標點/數字)一律有間隙
- e2e 像素級驗證:掃描頁面所有同列相鄰 ruby 對(含跨詞組),斷言水平間隙 ≥ 2px(desktop+mobile)

## Success Criteria

- 任意兩個帶注音字塊之間可見間隙,無論詞界;e2e gap 斷言把關
- 全套 gate 綠

## Impact

- Affected code: src/styles/theme.css(+test)、e2e/a11y.spec.ts
