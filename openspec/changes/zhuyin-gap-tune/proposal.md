## Summary

Sean 微調:注音字塊左右都要間距,右側再加大。

## Motivation

視覺節奏調校(margin-inline 0.22em 單側 → 左 0.1em / 右 0.3em)。

## Proposed Solution

ruby margin-inline: 0.1em 0.3em;e2e 間隙下限隨之上調(≥3px)。

## Impact

- Affected code: src/styles/theme.css(+test)、e2e 斷言值
