## Context

功能完整,收斂手感。兩視角 review 的全部發現已折入(proposal 已修訂):mode="wait" 護單 h2、iOS 音效解鎖、happydom Motion 瞬時、keyframes 假前提更正。

## Goals / Non-Goals

**Goals:** 四+一處 spring 動效、音效工具與開關、a11y/RWD 總檢

**Non-Goals:** 新功能、背景音樂、Motion layout 全面鋪開、theme.css 主題過渡改動

## Decisions

1. **AnimatePresence `mode="wait"`**:exit 完才 enter,任意時刻恰一張題卡/一個 h2;motion.div `key=question.id`,x: 36→0 spring;焦點移轉從 QuestionCard 的 useEffect 改為 motion 的 onAnimationComplete 呼叫 `focus({preventScroll:true})`;`useReducedMotion()` 時 transition duration 0 並立即對焦
2. **spring presets 集中 src/motion/presets.ts**:`springSnappy`(題卡/星星,stiffness 400 damping 30)、`springSoft`(選項 scale,stiffness 300 damping 25);全站只從 presets 取
3. **音效 src/audio/blip.ts**:模組級惰性單例 `getContext()`(`typeof AudioContext === "undefined"` 回 null → 全 API no-op);`unlock()` 在 gesture 內 resume;`blip(freq, dur)` sine + gain 包絡(attack 10ms/release 尾音,peak 0.12);`melody(notes)` 序列播放,播前 `state === "running"` gate;所有播放先查 `useSettings.getState().sound`
4. **觸發點**:單選/圖片選取(新值≠舊值)、多選勾選(取消不響)、配對成功、送出 940Hz、結果頁旋律(滿分 523/659/784 上行;≥60% 兩音;其餘不播)
5. **SoundToggle**:🔕(關)/🔔(開)圖示、aria-pressed、開啟的那次 click 內呼叫 unlock()(iOS 解鎖點);settings.sound 預設 false + partialize + 測試(比照 zhuyin 範式)
6. **happydom.ts 加 `MotionGlobalConfig.instantAnimations = true`**(from "motion/react" 的 MotionGlobalConfig… 實際匯出自 "motion"),bun test 下動畫瞬時、exit 即卸載
7. **星軌 pop**:剛變 answered 的星以 motion.span scale [1→1.35→1] spring;current 的 animate-pulse 保留
8. **配對線 draw-in**:motion.line `pathLength 0→1` spring(reduced-motion 直接 1)
9. **RWD**:768px 走查;ResultScreen 排行榜列窄幕 `flex-wrap`;match 欄 375px `gap-x-6`

## Implementation Contract

**行為:**

- 切題動畫期間 DOM 恰一個 h2;動畫結束焦點在新題幹;reduced-motion 無位移且立即對焦
- 音效預設全靜音;開啟後選取/配對/送出/結果各觸發;測試環境與無 AudioContext 環境零例外
- 星星在該題轉為已答的那次渲染 pop 一次

**驗收條件:**

1. bun test 全綠(Motion 瞬時前提下既有測試不變;新增 blip no-op、SoundToggle、settings.sound 測試)
2. e2e:切題過場中 `page.getByRole("heading", {level: 2})` 不拋 strict violation(全程單 h2);reduced-motion context 下切題 h2 位移為 0;SoundToggle aria-pressed 流程
3. 截圖走查:375/768/1280 三寬 × 雙主題主要畫面

**範圍邊界:** In:動效五處、音效、開關、a11y/RWD 收斂。Out:規則/計分/題庫

## Risks / Trade-offs

- [Motion 瞬時設定影響其他測試] → 動畫本就不該被單元測試依賴;e2e 用真瀏覽器不受影響
- [音效觸發點過多惹人煩] → 全部走 blip 輕量短音 + 預設關;polish 後 Sean 實聽再調
- [mode="wait" 切題稍慢] → spring 參數短促(<250ms 級),體感可接受

## Migration Plan

QuestionCard 焦點時序改由動畫回呼觸發 — QuizScreen.test 的焦點斷言改為等待(findBy/await);其餘無遷移。

## Open Questions

(none)
