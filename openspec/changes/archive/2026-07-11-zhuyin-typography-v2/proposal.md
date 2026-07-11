## Problem

Sean 實機回報:(1) 手機上聲調 ˊˇˋ 完全不顯示;(2) 桌機字距仍擠;(3) 輕聲 ˙ 離注音符號太遠;(4) 右上角固定 toggles 與 main 內容重疊,要獨立 NavBar。

## Root Cause

- 聲調用絕對定位 + zy-col 用 writing-mode: vertical-lr,行動瀏覽器對「inline-flex 內的 vertical writing-mode + absolute」處理不一致 → 聲調消失
- 輕聲 ˙ 走 upright 直排時佔滿整格字身,視覺上遠離符號
- toggles 是 fixed 定位,天生會壓內容

## Proposed Solution

依 W3C ruby styling 與 CMEX《注音符號調號之數位排版》慣例重排(瀏覽器不支援 inter-character,採自排):

- **零 writing-mode、零絕對定位**:注音欄 = flex 直向逐符號 span 堆疊(每瀏覽器行為確定);輕聲 ˙ 為欄頂緊貼元素(負 margin 收攏)
- **聲調 lane**:rt = 兩欄 flex(符號欄 + 聲調欄),聲調靠欄底對齊(≈ 最後一個符號右上,合課本慣例)並上移半符號;聲調 lane **恆佔位**(有無聲調同寬)→ 等寬字塊維持
- 字距:塊間 0.16em → 0.22em(桌機仍擠的回饋)
- **NavBar 獨立**:App 殼改為文流 header(左品牌、右三 toggles),移除 fixed;各畫面移除為 fixed 讓位的 padding;quiz 的星軌列移入 main 流
- 真機面向驗證:e2e 斷言每個聲調 span 有非零 boundingBox 且在視口內(mobile project 也跑)

## Success Criteria

- mobile/desktop 皆可見聲調;輕聲緊貼;字塊等寬;NavBar 與內容零重疊
- 全套 gate 綠 + 雙視口截圖

## Impact

- Affected code:
  - Modified: src/components/ZhuyinText.tsx, src/styles/theme.css(+tests), src/App.tsx(header), StartScreen/QuizScreen/ResultScreen(padding/佈局), e2e
