## Why

測驗骨架的 QuestionSlot 目前是佔位 — 學生還不能真正作答。本 change 實作五種題型的互動元件,是「設計手感」評分的主戰場:選項卡光暈、配對連線、圖形選擇都在這裡。

## What Changes

- 以 QuestionSlot 契約(quiz-flow 定義的 question/value/onChange)實作五題型,type narrow 分派:
  - **SingleChoice**:選項卡直列(Radix RadioGroup 語意),marker ○/●,選取 primary 光暈邊框 + selBounce 微彈跳(motion-safe)
  - **MultiChoice**:同選項卡但 Checkbox 語意,marker □/✓,可複選
  - **FillBlank**:題幹行內輸入框(QuestionCard 已渲染 ___ 佔位 → 改為真輸入框),primary 色粗體置中,onChange 即寫 store(免 flush 設計)
  - **Matching**:左右兩欄按鈕,點左(accent 高亮)再點右成對,SVG 連線 accent 色;點已配對的左項取消該連線;右項已被佔用時重配;完整鍵盤可操作
  - **ImageChoice**:2×2 幾何圖形卡(CSS clip-path:circle/triangle/square/star/heart/hexagon),aria-label 用 shape label,選取光暈
- 所有選項卡:hover 微亮、focus ring、44px 觸控底線、選取狀態 `aria-checked/aria-pressed` 語意正確
- QuestionCard 的 fill 佔位 ___ 改由 FillBlank 接手渲染(行內輸入框內嵌題幹)
- 幾何圖形色彩:依 Aura 輪替色(primary/success/accent 循環),兩主題可讀

## Non-Goals

- 對錯揭曉樣式(送出後才揭曉,屬 results change;本 change 只有作答中狀態)
- Motion spring 動畫編排(polish;本 change 用 CSS transition + 既有 keyframes)
- 音效(polish)

## Capabilities

### New Capabilities

- `answer-widgets`: 五題型作答元件的互動、a11y 與視覺狀態

### Modified Capabilities

(none)

## Impact

- Affected specs: answer-widgets(新)
- Affected code:
  - New: src/components/quiz/widgets/SingleChoice.tsx, MultiChoice.tsx, FillBlank.tsx, Matching.tsx, ImageChoice.tsx, ShapeIcon.tsx, 對應測試檔
  - Modified: src/components/quiz/QuestionSlot.tsx(分派實作), src/components/quiz/QuestionCard.tsx(fill 佔位移交), e2e/quiz-flow.spec.ts(補實際作答路徑)
  - Removed: (none)
