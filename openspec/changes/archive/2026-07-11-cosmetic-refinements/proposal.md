## Summary

Sean 四項視覺指示:卡片加寬、字距再加大、深色主題暗字提亮(白/亮 cyan)、標點符號一律全形。

## Motivation

國小受眾可讀性與中文排版正確性(中文配全形標點)。

## Proposed Solution

- 卡片寬度:開始/結果卡 max-w-md→max-w-xl、作答區 max-w-2xl→max-w-3xl、結果頁 max-w-xl→max-w-2xl
- 字距:ruby 塊間 0.09em→0.16em
- 深色提亮:--muted #9d9aa7→#c3c0cf、--info #82e2ff→#a8ecff(注音/提示更亮的 cyan);AA 對比測試照跑(提亮只會更高分)
- 全形標點:題庫 questions.json 與 UI 文案(gen-ui-text STRINGS)的 ,!?():; 全部轉全形,,!?():;測試斷言同步;加防退化測試(資料層不得出現半形標點)

## Non-Goals (optional)

- 版面結構變更、注音字級調整

## Impact

- Affected code:
  - Modified: src/styles/theme.css(gap/顏色)、src/data/questions.json、scripts/gen-ui-text.ts + src/ui-text.gen.ts、各畫面 max-w、相關測試與 e2e 斷言
