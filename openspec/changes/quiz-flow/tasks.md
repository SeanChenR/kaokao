## 1. 型別契約與抽題

- [x] 1.1 實作 src/quiz/answers.ts:`AnswerValueMap` 型別映射與 `isAnswered(q, v)`(spec: Answer-state contract);行為:五型別未答語意正確(match 部分連線=未答、fill 空白=未答)。驗證:src/quiz/answers.test.ts 全型別矩陣(RED→GREEN)
- [x] 1.2 實作 src/quiz/draw.ts `draw(bank, rng = Math.random)`(spec: Question drawing);行為:每型一題、固定順序、rng 注入、同型等機率。驗證:src/quiz/draw.test.ts(固定 seed 重現、1000 次統計分佈、順序斷言)

## 2. Store 與計時

- [x] 2.1 實作 src/stores/quiz.ts(spec: Quiz session state machine、Session survives a reload):phase 狀態機、start/goTo/setAnswer/submit/reset、sessionStorage persist(key kaokao-quiz)、submit idempotent、setAnswer phase guard、drawnIds 失效偵測 reset;行為:契約全兌現。驗證:src/stores/quiz.test.ts(含雙觸發一次、reload 還原、壞 drawnIds reset)
- [x] 2.2 settings store 加 `lastName` + `partialize` + `version:1`(spec: Quiz session state machine 的 name prefill);行為:start() 寫入 lastName,舊 payload merge 安全。驗證:settings.test.ts 補測試
- [x] 2.3 實作 src/quiz/time.ts(`deadline(startedAt)`、`remainingMs(deadline, now)`)與 src/components/quiz/CountdownTimer.tsx(spec: Deadline-based countdown with auto submit、Countdown display accessibility);行為:deadline 重算不遞減、role=timer、m:ss tabular、≤60s warning+motion-safe 脈動、60s/10s 一次性 polite 播報、歸零 submit({auto:true})。驗證:time.test.ts(假時鐘)+ CountdownTimer.test.tsx(live region 一次性)

## 3. 畫面元件

- [x] 3.1 實作 src/components/quiz/StartScreen.tsx(spec: Quiz session state machine 開始條件):label 關聯、1–12 字、空白提交 aria-invalid + 可見錯誤訊息、Enter 送出、lastName 預填;行為:符合 spec。驗證:StartScreen.test.tsx(錯誤回饋 a11y、成功 start)
- [x] 3.2 實作 src/components/quiz/StarTrack.tsx(spec: Star track progress and jumping):5 星鈕(未答暗/已答亮輪替色/當前 aria-current + motion-safe 脈動)、44px hit area、數字進度行;行為:點星 goTo。驗證:StarTrack.test.tsx(aria-label/aria-current/點擊)
- [x] 3.3 實作 src/components/quiz/QuestionCard.tsx + QuestionSlot.tsx 佔位(design Decision 4)與 src/components/quiz/QuizScreen.tsx(spec: Sequential navigation with focus management):題號/題型 badge/ZhuyinText 題幹(h2 tabIndex=-1)、切題 focus 題幹、prev/next/submit 按鈕;行為:符合 spec。驗證:QuizScreen.test.tsx(切題後 document.activeElement 為題幹)
- [x] 3.4 實作 src/components/quiz/SubmitDialog.tsx(Radix AlertDialog)(spec: Submit confirmation for unanswered questions):未答計數、預設焦點回去作答、全答直接送出;行為:符合 spec。驗證:SubmitDialog.test.tsx(render 契約與計數;focus trap 留給 e2e)
- [x] 3.5 App.tsx 接 phase 路由(start/quiz/result 佔位含 autoSubmitted ack)(spec: Quiz session state machine);行為:三畫面切換、result 佔位顯示「時間到,自動交卷!」當 auto。驗證:App.test.tsx 更新

## 4. 收尾

- [x] 4.1 e2e/quiz-flow.spec.ts:姓名 → 開始 → 五題固定順序 → 星軌跳題 → 未答 dialog → 送出 → result;reload 續命(同題、時間連續)(spec: Session survives a reload);行為:全流程通。驗證:bunx playwright test 綠
- [x] 4.2 全套 gate:typecheck/lint/test/e2e/build 零錯;start/quiz 雙主題×雙視口截圖自檢。驗證:指令零錯誤 + 截圖目視
