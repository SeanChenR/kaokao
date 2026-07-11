## 1. 基建

- [x] 1.1 src/motion/presets.ts(springSnappy/springSoft)+ happydom.ts 加 MotionGlobalConfig.instantAnimations(design Decision 2/6);驗證:bun test 既有 183 案全綠不因 Motion 掛掉
- [x] 1.2 src/audio/blip.ts(單例 getContext/unlock/blip/melody,no-op 守門、gain 包絡)(spec: Gentle audio feedback, off by default);驗證:blip.test.ts(無 AudioContext 環境全 API 不拋、sound=false 不播)
- [x] 1.3 settings.sound(interface/initial/partialize)+ SoundToggle(🔕/🔔、aria-pressed、click 內 unlock)掛殼層(spec: Gentle audio feedback, off by default);驗證:SoundToggle.test.tsx + settings.test 補(RED→GREEN)

## 2. 動效

- [x] 2.1 QuizScreen 題卡 AnimatePresence mode="wait" + key + spring;QuestionCard 焦點改 onAnimationComplete + preventScroll,reduced-motion 立即(spec: Spring motion vocabulary 兩 Scenario);驗證:QuizScreen.test 焦點斷言改 await 後綠;e2e 全程單 h2
- [x] 2.2 StarTrack 星星 answered pop(motion.span,一次性)+ ResultScreen 星星 stagger 進場(design Decision 7);驗證:目視/截圖;單元 smoke 不拋
- [x] 2.3 Matching 連線 motion.line pathLength draw-in(reduced 直接 1)+ 選項 scale ≤1.02(多選取消不彈)(spec: Spring motion vocabulary);驗證:e2e match 路徑仍綠;目視

## 3. 音效接線

- [x] 3.1 觸發點接線:單選/圖片/多選勾選(取消靜音)、配對成功、送出、結果旋律(分級,播前 running gate)(spec: Gentle audio feedback, off by default 兩 Scenario);驗證:widgets 測試斷言 blip 呼叫(mock blip 模組)含「取消不響」

## 4. 總檢

- [x] 4.1 e2e a11y 斷言:html lang、每畫面單 h1、切題過場單 h2、SoundToggle tab+aria-pressed、reduced-motion 切題無位移(spec 兩 Requirement);驗證:playwright 綠
- [x] 4.2 RWD 走查(375/768/1280 × 雙主題截圖):排行榜列 flex-wrap、match 375px gap 調整;全套 gate。驗證:指令零錯+截圖目視
