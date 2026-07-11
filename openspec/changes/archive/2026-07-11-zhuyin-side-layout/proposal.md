## Why

Sean 指示(2026-07-11):注音不要標在國字上方,要像台灣課本一樣**直式排在國字右側**。現行用瀏覽器預設 ruby-over,與台灣學童的閱讀習慣不符。

## What Changes

- ZhuyinText 的 ruby 版面改為「右側直式」:注音符號由上而下直排於字右;聲調 ˊˇˋ 置於注音欄**右側中間**;輕聲 ˙ 置於注音欄**頂端**(台灣正字法)
- 保留 `<ruby><rt aria-hidden>` 語意 DOM(a11y 契約不變),以 CSS display 覆蓋 ruby 內建版面;rt 內部拆「符號直欄」與「聲調」兩個 span
- 尺寸契約:注音符號約主字 0.32em、`text-orientation: upright`;因不再佔上方空間,行高由 1.9 調降(theme.css `--text-question--line-height` 與各處 `leading-[1.9]` 同步調整)
- 樣式集中 theme.css(rt 區塊改寫);注音開關行為不變(關閉 = 單一文字節點)
- 雙主題 × 手機/桌機截圖驗證直式注音的可讀性與不溢版

## Non-Goals

- 不改注音資料(題庫/UI 文案的 z 值全部沿用)
- 不做直書全文(整體仍橫書,只有注音欄直式)
- 不依賴 `ruby-position: inter-character`(瀏覽器支援不穩)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `zhuyin-rendering`: ruby 版面從 over 改為右側直式,含聲調/輕聲擺位契約

## Impact

- Affected specs: zhuyin-rendering(修改)
- Affected code:
  - Modified: src/components/ZhuyinText.tsx, src/styles/theme.css(rt 樣式)+ theme.test.ts, 各元件 leading-[1.9] 調整, e2e 截圖基準
  - New: (none)
  - Removed: (none)
