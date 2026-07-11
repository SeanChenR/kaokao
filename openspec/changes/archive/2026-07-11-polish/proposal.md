## Why

功能已完整(5/7),但動效仍是 CSS 過渡級、無音效、部分 a11y/RWD 細節未總檢 — 「適度動效」加分項與「設計手感」評分靠這個 change 收斂到消費級手感。

## What Changes

- **Motion spring 動效**(motion/react,尊重 useReducedMotion):
  - 題卡切換:AnimatePresence `mode="wait"` + `key=question.id`(保證單卡單 h2,護住 e2e 嚴格選擇器);焦點改在進場完成(onAnimationComplete)以 `focus({preventScroll:true})` 移至題幹,reduced-motion 立即對焦
  - 星軌點亮:答完該星 spring pop(既有 animate-pulse 當前題指示保留不動)
  - 結果頁進場:卡片 pop + 星星 stagger 點亮
  - 選項選取:微 scale spring(過衝 ≤1.02;多選「取消」不彈)
  - 配對連線 draw-in(SVG line pathLength spring)— mockup 簽名互動補齊
- **Web Audio 音效**(零依賴,預設靜音):
  - src/audio/blip.ts:惰性單例 AudioContext、`typeof AudioContext` 守門(測試 no-op)、gain ≤0.15、頻率 400–900Hz、attack/release 包絡防爆音
  - 解鎖:第一個 user gesture(SoundToggle 開啟或「開始測驗」點擊)resume;結果頁旋律播前 gate `state==="running"`(iOS Safari)
  - 觸發點:選項「新增選取」(取消不響)、配對成功、送出、結果頁分級短旋律(滿分三音上行)
  - SoundToggle:明確靜音語意圖示(🔕/🔔 切換,非低透明度)、aria-pressed、44px、persist settings.sound 預設 false + partialize,掛殼層
- **a11y 總檢**:e2e 補結構斷言(html lang、每畫面恰一個 h1、切題過場期間也恰一個 h2、landmark);SoundToggle tab order + aria-pressed 斷言;不新增任何 live region(避免與 timer/配對播報競播);reduced-motion 下切題無位移的 e2e 斷言
- **測試前提**:happydom preload 設 Motion 瞬時動畫(MotionGlobalConfig.instantAnimations),AnimatePresence 卸載在 bun test 可預測
- **RWD 收尾**:768px 中間斷點走查(平板)、結果頁排行榜窄幕折行、match 欄在 375px 的間距微調
- 全站動效時長/spring 參數集中 src/motion/presets.ts(統一手感,polish 一處調)

## Non-Goals

- 新功能、題型變更、計分邏輯
- 背景音樂(短音效即可)
- Motion layout 動畫全面鋪開(只用在名單上的四處,避免過度動效)

## Capabilities

### New Capabilities

- `motion-and-sound`: spring 動效編排、音效觸發與開關、reduced-motion/靜音預設

### Modified Capabilities

(none — a11y/RWD 屬既有 spec 的品質收斂,不改行為契約)

## Impact

- Affected specs: motion-and-sound(新)
- Affected code:
  - New: src/motion/presets.ts, src/audio/blip.ts(+test), src/components/ui/SoundToggle.tsx(+test)
  - Modified: src/stores/settings.ts(sound), QuizScreen/QuestionCard/StarTrack/ResultScreen/widgets(動效+音效觸發), src/App.tsx(SoundToggle), 元件層被 Motion 取代的 transition utility(theme.css 無 keyframes 可移除;其主題色過渡與 reduced-motion gate 保持不動,theme.test.ts 為回歸護欄), e2e(a11y 斷言)
  - Removed: (none)
