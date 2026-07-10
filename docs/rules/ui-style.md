# UI Style Guide

定案日:2026-07-10(與 Sean 討論)。視覺概念:**星空自習室** — 配色取自 [Aura Theme](https://github.com/daltonmenezes/aura-theme)。

## 概念

一個隱喻貫穿雙主題:**淡色 = 白天的天空,深色 = 夜空**。星星白天也在(淡淡的),入夜點亮。所有裝飾元素(進度星軌、題卡光暈)都從這個隱喻長出來,不另加無關花樣。

## 色彩系統

色相 DNA 來自 Aura,明度雙軌:深色模式近原生 Aura;淡色模式同色相加深以過 WCAG AA(已定稿:src/styles/theme-contrast.test.ts 以 WCAG AA 斷言把關,改值需過該測試)。

| Token       | 深色(Aura 原生) | 淡色(衍生候選) | 測驗語意             |
| ----------- | --------------- | -------------- | -------------------- |
| `bg`        | `#15141b`       | `#f7f5fb`      | 背景                 |
| `surface`   | `#1f1d2b`       | `#ffffff`      | 卡片                 |
| `text`      | `#edecee`       | `#2b2640`      | 主文字               |
| `muted`     | `#9d9aa7`       | `#625e78`      | 次要文字、未答       |
| `primary`   | `#a277ff`       | `#6d3fe0`      | 選取中、已答、主按鈕 |
| `success`   | `#61ffca`       | `#0b7d57`      | 答對                 |
| `error`     | `#ff6767`       | `#d33840`      | 答錯                 |
| `warning`   | `#ffca85`       | `#8f5410`      | 計時器倒數警示       |
| `info`      | `#82e2ff`       | `#076e86`      | 進度、提示           |
| `accent`    | `#f694ff`       | `#a21caf`      | 配對題連線高亮       |
| `selection` | `#3d375e7f`     | `#a277ff26`    | 選取底色             |

- 全部以 CSS custom properties 定義,Tailwind v4 `@theme` 接進 utility
- 主題:跟隨系統 `prefers-color-scheme`,提供手動切換(儲存於 zustand persist)

## 字體

- **jf open 粉圓**(OFL 開源,自架 woff2,subset 減載入量)— 全站單一家族,weight 400/700
- 注音 ruby:`0.5em`,題目內文字級 ≥ `1.25rem`、`line-height ≥ 1.9` 給注音留空間
- 注音範圍:題目與選項的**每個中文字都要標**(不是只有特定詞);介面 chrome(按鈕/標籤)不標;提供注音顯示開關
- 數字/計時可用等寬變體或 `font-variant-numeric: tabular-nums`

## 簽名元素(統一在星空隱喻下)

1. **星空進度軌道**:進度條是一條星軌,每答一題點亮一顆星(Aura 紫/綠/粉輪替);答對發光、答錯暫灰。深色模式 = 夜空點燈,淡色模式 = 白天淡星
2. **題卡光暈**:選項卡選取/答對時的 glow 邊框 + Motion spring 彈跳;深色模式 neon 全開,淡色模式光暈收斂為柔和陰影(同一元件、兩種曝光)

## 動效原則

- 狀態回饋(hover/focus/選取)= 純 CSS transition(≤150ms)
- 題目切換、星星點亮、結果頁 = Motion spring(活潑但不拖沓,stiffness 偏高)
- 結果頁:canvas-confetti 用 Aura 六色
- 一律尊重 `prefers-reduced-motion`

## 品質底線

- RWD:手機直式優先設計,桌機加寬不變形
- 鍵盤可完整作答,focus ring 明顯(primary 色)
- 語意標籤:題目用 `fieldset/legend`,選項用 Radix RadioGroup/Checkbox
- 深淺兩模式所有文字/互動元件過 WCAG AA
