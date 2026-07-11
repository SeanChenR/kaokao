## Problem

Sean 回報(附教育部字典風格參考圖):字與注音要有「等大字框」的盒模型感且整體偏小;放大不能只放大字 — 排行榜、按鈕、卡片等所有元件都要**等比例**跟著放大。

## Root Cause

root font-size 沿用瀏覽器預設 16px;全站尺寸(Tailwind utilities)皆為 rem 基準,但基準本身沒有為國小受眾調大。

## Proposed Solution

- `html { font-size: 112.5% }`(16→18px):所有 rem 基準的字級、間距、卡片、按鈕、排行榜一次等比放大 12.5%
- 字框盒模型:ruby 塊已是「字 1em + 注音欄 0.72em」固定格;隨基準放大後,題目字級 1.375rem ≈ 24.75px,注音 ≈ 10px 起跳,可讀性同步提升
- 375px 視口截圖走查:確認放大後無溢版/斷行崩壞(星軌、header、選項卡、match 兩欄)

## Success Criteria

- 同一畫面上所有元件視覺比例不變、整體放大;手機/桌機 × 雙主題截圖無溢版
- 191 unit + 44 e2e 全綠

## Impact

- Affected code:
  - Modified: src/styles/theme.css(root 基準)+ 必要的溢版微調
