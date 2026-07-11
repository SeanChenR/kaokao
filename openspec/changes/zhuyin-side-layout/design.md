## Context

現行 ZhuyinText 用瀏覽器預設 ruby-over(注音在字上方),rt 0.55em、行高 1.9 為其預留空間。Sean 指示改為台灣課本式右側直排。`ruby-position: inter-character` 跨瀏覽器不穩,採 CSS display 覆蓋方案。

## Goals / Non-Goals

**Goals:** 注音直式右排、聲調右側中、輕聲頂端、行高回收
**Non-Goals:** 注音資料變更、全文直書、inter-character 依賴

## Decisions

1. **保留 ruby/rt 語意,以 display 覆蓋內建版面**:`ruby { display: inline-flex; align-items: center; }`、`rt { display: inline-flex; }` — 設定非 ruby display 即停用瀏覽器 ruby 佈局,DOM 與 a11y 契約(rt aria-hidden)完全不變,既有測試斷言續用
2. **rt 內部結構**:`<rt aria-hidden><span class="zy-col">˙?+符號</span><span class="zy-tone">ˊˇˋ</span></rt>`;解析規則沿用正字法 regex — 前置 ˙ 留在直欄頂端(直排天然在上),尾聲調拆進 tone span
3. **直欄樣式**:`.zy-col { writing-mode: vertical-lr; text-orientation: upright; font-size: 0.32em; line-height: 1.05; letter-spacing: 0; }`;`.zy-tone { font-size: 0.4em; align-self: center; margin-left: 0.06em; line-height: 1; }` — 聲調于注音欄右側置中(課本慣例)
4. **行高回收**:`--text-question--line-height` 1.9 → 1.6;元件層 `leading-[1.9]` → `leading-[1.6]`(全案 sed,集中一 commit);直欄高度上限以 `max-height: 1em` + overflow visible 保險,避免三符號音節撐行
5. **等寬字塊(Sean 補充:字距要均勻)**:注音欄 wrapper 固定寬(`width: 0.5em`,欄內符號置中;聲調以絕對定位貼欄右不佔寬)— 每個帶注音字塊 advance = 1em(字)+ 0.5em(欄),與符號數無關;混排的無注音 token 維持自然流。字元間不再因注音寬度失衡
6. **字高對齊**:ruby inline-flex `align-items: center` 讓字與注音欄垂直置中對齊;注音欄 `margin-left: 0.08em` 與字保持細縫
6. **驗證策略**:theme.test.ts 改斷言新樣式(writing-mode/vertical、0.32em);ZhuyinText.test 補 rt 內兩 span 結構;截圖(首頁+題卡,手機/桌機×雙主題)為最終視覺 gate

## Implementation Contract

**行為:** 注音開啟時,每個中文字右側出現直排注音欄(由上而下),聲調在欄右側中間、輕聲在欄頂;關閉行為不變;斷行仍以詞組為單位

**驗收條件:**

1. bun test 全綠(theme.test 新樣式斷言、ZhuyinText rt 結構)
2. e2e 42 條全綠(zt() 比對 textContent 不受版面影響)
3. 截圖:三符號音節(如 ㄒㄩㄢˇ)不撐爆行高、不與相鄰字重疊;二三聲調在欄右中;˙ㄉㄜ 的 ˙ 在頂端

**範圍邊界:** In:ZhuyinText/theme.css/行高/測試/截圖。Out:資料、開關、其他版面

## Risks / Trade-offs

- [vertical-lr 在 rt 內的瀏覽器怪癖] → 截圖 gate;若 Chromium 有問題退階為 flex-col 逐符號 span(零 writing-mode)
- [0.32em 過小可讀性] → 截圖後可調;集中 theme.css 一處

## Migration Plan

樣式層變更;`leading-[1.9]` → `leading-[1.6]` 全案一次替換。

## Open Questions

(none)
