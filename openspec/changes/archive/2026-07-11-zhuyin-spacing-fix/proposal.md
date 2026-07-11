## Problem

實機截圖(Sean 回報):注音直欄與下一個國字黏在一起,聲調(絕對定位 right:-0.16em)甚至疊到後字上,可讀性差。

## Root Cause

1. 聲調被刻意定位在欄外(-0.16em)以「不佔寬」,但代價是入侵後字視覺空間
2. ruby 字塊之間沒有任何間距,注音欄右緣即後字左緣

## Proposed Solution

- 聲調收進固定欄內:欄寬 0.55em → 0.72em,欄內左側放符號直欄、右側放聲調(仍絕對定位但 right ≥ 0,不出欄)— 等寬字塊性質不變
- ruby 塊間距:`ruby + ruby`(以及 ruby 後接文字)加 0.09em 左距,字與字之間有呼吸
- 截圖驗證:哈囉/點亮/測驗等三符號+聲調組合不再觸碰後字

## Success Criteria

- 任一注音欄(含聲調)完全落在自身字塊 advance 內;相鄰字塊間有可見間隙
- 等寬 e2e 照樣通過;191 unit + 44 e2e 綠

## Impact

- Affected code:
  - Modified: src/styles/theme.css, src/styles/theme.test.ts(斷言同步)
