## Summary

Sean:左間距再大;國字放大,三符號注音不得超出國字高度。

## Proposed Solution

- 比例修正:zy-col 0.4em → 0.33em(3 × 0.33 = 0.99 ≤ 1em 字高);聲調 0.36em
- 同時全站基準 112.5% → 118.75%(18→19px):國字變大,注音「絕對大小」與現在相當但收進字高內
- ruby 左距 0.1em → 0.16em
- e2e 補「注音欄高 ≤ ruby 內國字高」量測斷言

## Impact

- Affected code: src/styles/theme.css(+test)、e2e
