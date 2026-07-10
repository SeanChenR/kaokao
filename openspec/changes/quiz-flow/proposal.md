## Why

地基(主題)與資料層(題庫+注音)完成後,需要把「一場測驗」的骨架立起來:從輸入姓名、抽題、逐題導航、計時到送出。這是使用者旅程的主幹,question-types(作答元件)與 results(結果頁)都掛在這個骨架上。

## What Changes

- quiz zustand store(`src/stores/quiz.ts`):狀態機 `start → quiz → result`、抽到的題 id 陣列、目前題號、各題作答值、**deadline 時間戳(唯一計時真相,剩餘秒數為衍生值)**;以 sessionStorage persist `{drawnIds, answers, startedAt, phase}` — 誤觸重整可續命,關分頁自然重來
- 作答值強型別:以 QType 為 discriminant 的 `AnswerValue` 型別映射(single/image=number|null、multi=number[]、fill=string、match=(number|null)[]),並提供全站共用的 `isAnswered(q, value)` — SubmitDialog 的「還有 N 題」與星軌點亮共用同一份未答定義
- 抽題:`draw(bank, rng = Math.random)` 每題型隨機抽 1 題共 5 題(rng 注入以利測試;同型多題等機率有測試把關),順序固定 single→multi→fill→match→image(理由:題型全覆蓋 + demo 可重現;不綁難度敘事)
- 開始畫面:歡迎卡(沿用星空殼)、姓名輸入(`<label>` 關聯、必填 1–12 字、trim 後非空;空白時按鈕不 disable 而是觸發 `aria-invalid` + `aria-describedby` 指向可見的友善錯誤訊息、Enter 可送出)、上次姓名自動帶入(settings store 加 `lastName`,persist 加 `partialize` 只存資料欄 + `version:1` 留 migration 掛勾)、「開始測驗」主按鈕
- 作答框架:題卡容器(題號/題型 badge/注音題幹經 ZhuyinText)、星空進度軌道(5 顆星:未答暗星、已答點亮紫綠粉輪替、當前題脈動、**唯一跳題入口**,每顆星透明 hit area ≥44×44px)+ 數字進度輔助(第 N 題/已答 M 題)、上一題/下一題、最後一題出現「送出答案」;**切題後焦點移至新題卡題幹(tabIndex=-1 + focus)**;不做獨立題號跳轉點(與星軌冗餘)
- 倒數計時:10 分鐘,每 tick 以 `deadline - Date.now()` 重算(不用遞減計數,免 drift/背景 throttle 誤差),`tabular-nums` 顯示 m:ss;`role="timer"`,平時不 aria-live,≤60s 與 ≤10s 各一次性 `aria-live="polite"` 播報;剩 ≤60 秒轉 warning 色+脈動(脈動個別掛 reduced-motion);歸零自動送出:送出前 flush 填空題未落 store 的輸入、phase 做 idempotent guard(手動+自動同時觸發只送一次)、送出後 tick 與輸入 no-op;未答 dialog 開著時歸零 → 強制關 dialog 並自動送出(timer 優先);自動送出時先顯示短暫「時間到,自動交卷!」ack 再進 result
- 姓名資料鏈(跨 change 契約):`settings.lastName` 只是下次預填種子(persist);本場名字存 `quiz.name`;results change 的排行榜 entry 必須取 `quiz.name` 而非 lastName
- 送出流程:有未答題 → **Radix AlertDialog**(自帶 focus trap/Esc/aria-modal;預設焦點在「回去作答」防誤送,backdrop 點擊 = 關閉)提醒「還有 N 題沒寫完」;全答 → 直接進 result 狀態(結果頁內容屬 results change,本 change 先放佔位)
- 作答區佔位:本 change 題卡內先渲染題幹與「作答元件由 question-types 提供」的插槽介面(`QuestionSlot` props 契約),不實作五題型互動

## Non-Goals

- 五題型作答元件(question-types change;本 change 定義插槽契約)
- 計分、結果畫面內容、排行榜(results-and-leaderboard change)
- Motion 動效編排與音效(polish change;本 change 用 CSS 過渡)

## Capabilities

### New Capabilities

- `quiz-session`: 測驗狀態機、抽題規則、計時與自動送出、姓名記憶
- `quiz-navigation`: 星軌進度、題間導航、送出與未答提醒

### Modified Capabilities

(none)

## Impact

- Affected specs: quiz-session(新)、quiz-navigation(新)
- Affected code:
  - New: src/stores/quiz.ts, src/quiz/draw.ts(抽題), src/components/quiz/StartScreen.tsx, src/components/quiz/QuizScreen.tsx, src/components/quiz/StarTrack.tsx, src/components/quiz/CountdownTimer.tsx, src/components/quiz/QuestionCard.tsx, src/components/quiz/SubmitDialog.tsx, src/components/quiz/QuestionSlot.tsx(契約佔位), 對應測試檔
  - Modified: src/App.tsx(狀態機路由), src/stores/settings.ts(加 lastName persist)
  - Removed: (none)
