## Context

主題地基(change 1)與題庫+注音(change 2,實作收尾中)之上,建立測驗骨架。三視角 review 發現已全數折入 proposal;本設計把其中的技術契約釘死。QuestionSlot/AnswerValue 契約是 question-types(change 4)的接點,錯了會返工。

## Goals / Non-Goals

**Goals:**

- 測驗狀態機與 sessionStorage 續命、deadline 計時、抽題、姓名、導航、送出

**Non-Goals:**

- 五題型互動(change 4 經 QuestionSlot 接上)、計分/結果內容/排行榜(change 5)、Motion/音效(change 6)

## Decisions

1. **計時唯一真相 = deadline 時間戳**(`startedAt + 600_000`);每 tick `deadline - Date.now()` 重算,不做遞減計數。理由:setInterval drift 與背景分頁 throttle 會讓遞減錯位。tick 用 1s interval 僅觸發重算。
2. **quiz store 以 sessionStorage persist**(zustand persist + `createJSONStorage(() => sessionStorage)`),partialize `{phase, drawnIds, answers, name, startedAt, current, autoSubmitted}`(current/autoSubmitted 讓 reload 停在同題並保留 ack)。理由:誤觸重整續命(deadline 由 startedAt 推回),關分頁自然重來;localStorage 留給 settings/排行榜。
3. **AnswerValue 型別映射 + isAnswered 由本 change 擁有**:`AnswerValueMap = { single: number|null; multi: number[]; fill: string; match: (number|null)[]; image: number|null }`;`isAnswered(q, v)`:single/image=非 null、multi=length>0、fill=trim 非空、match=全部配對完成(部分連線 = 未答)。SubmitDialog 計數與星軌點亮共用。理由:未答語意是跨元件契約,不能散落。
4. **QuestionSlot 契約**(本 change 定義 + 佔位實作,change 4 替換內容):`QuestionSlot(props: { question: Question; value: AnswerValueMap[Q["type"]] | undefined; onChange(v): void })`,以 type narrow 的 switch 分派;佔位版渲染題幹(ZhuyinText)+「作答元件開發中」。
5. **抽題 `draw(bank, rng = Math.random)`**:每型過濾後 `Math.floor(rng() * n)` 選一,固定順序輸出 5 題;不用 Fisher-Yates(每型只取一,無需洗牌)。等機率以 seeded rng 統計測試把關。
6. **SubmitDialog 用 Radix AlertDialog**(radix-ui 統一套件已裝):自帶 focus trap/Esc/aria-modal;預設焦點「回去作答」;timer 歸零強制關閉並送出。
7. **切題焦點管理**:QuestionCard 題幹 h2 `tabIndex={-1}`,切題 effect 對它 `focus()`;星軌為唯一跳題入口(星鈕透明 hit area ≥44px),另有「第 N 題/已答 M 題」數字輔助(a11y + JD checklist)。
8. **自動送出三道保險**:fill 輸入 onChange 即寫 store(不 debounce,5 題規模無效能問題,天然免 flush);`submit()` 內 `if (phase !== "quiz") return` idempotent guard;歸零路徑:關 dialog → 設 `autoSubmitted` flag → phase="result"(ack 畫面由 result 佔位顯示「時間到,自動交卷!」)。
9. **settings 變更**:加 `lastName: string`(預設 "")、`partialize` 只存 `{theme, zhuyin, lastName}`、`version: 1`(shallow merge 不變,version 只是未來 migration 掛勾)。

## Implementation Contract

**store(src/stores/quiz.ts):**

- state:`{ phase: 'start'|'quiz'|'result'; name: string; drawnIds: string[]; current: number; answers: Record<string, AnswerValue>; startedAt: number|null; autoSubmitted: boolean }`
- actions:`start(name)`(抽題、記 startedAt、phase→quiz、寫 settings.lastName)、`goTo(i)/next()/prev()`、`setAnswer(id, v)`(phase!=='quiz' 時 no-op)、`submit({auto}: {auto?: boolean})`(idempotent)、`reset()`
- selectors:`deadline()`、`remainingMs(now)`、`answeredCount()`、`unansweredCount()`
- sessionStorage key `kaokao-quiz`

**元件行為:**

- StartScreen:label 關聯 input、maxLength 12、空白提交 → `aria-invalid="true"` + `aria-describedby` 錯誤訊息「先寫上名字才能出發喔!」、Enter 送出;lastName 預填
- StarTrack:5 星鈕,`aria-label="第 N 題(已作答/還沒寫)"`,當前題 `aria-current="step"`,hit area ≥44px,點擊 goTo
- CountdownTimer:`role="timer"` m:ss;≤60s warning 色+脈動(motion-safe);≤60s、≤10s 各一次 polite live 播報;歸零呼叫 `submit({auto:true})`
- QuizScreen:切題後 focus 題幹;導航按鈕沿用 Button 元件
- SubmitDialog(Radix AlertDialog):「還有 N 題沒寫完喔」,N 來自 `unansweredCount()`;「回去作答」預設焦點/「直接送出」
- result 佔位:顯示「作答完成(結果頁開發中)」+ autoSubmitted 時「時間到,自動交卷!」

**失敗模式:**

- sessionStorage 不可用:persist 靜默失敗,測驗照常(單次記憶體 state)
- drawnIds 含已不存在的題 id(題庫改版後 reload):偵測到即 reset 回 start

**驗收條件:**

1. `bun test` 全綠:draw(固定順序/每型一題/seeded 等機率統計/rng 注入)、isAnswered 全型別矩陣(含 match 部分連線=未答)、quiz store(start/goTo/setAnswer no-op after submit/submit idempotent/雙觸發一次)、remainingMs 由 deadline 重算、StartScreen 錯誤回饋 a11y、StarTrack aria、SubmitDialog 計數、settings lastName merge
2. e2e:輸入姓名 → 開始 → 五題順序正確 → 星軌跳題 → 送出(含未答 dialog 路徑)→ result 佔位;reload 續命(同題、剩時繼續)
3. 截圖:start 與 quiz 畫面雙主題 × 雙視口

**範圍邊界:**

- In scope:狀態機、抽題、計時、導航、開始畫面、送出、佔位 slot/result
- Out of scope:五題型互動、計分、排行榜、Motion 動效、音效

## Risks / Trade-offs

- [Radix AlertDialog 在 happy-dom 測試相容性] → 元件測試聚焦 store 邏輯與 render 斷言,focus trap 行為交給 e2e(真瀏覽器)驗
- [sessionStorage 續命與 deadline:重整後 startedAt 推回 deadline,若使用者停在 start 前 reload 無影響] → startedAt 只在 start() 設定
- [每型只抽 1 題,titles 順序固定造成 demo 單調] → 型內隨機已足夠變化;若 Sean 想全隨機順序,一行參數可改

## Migration Plan

新增功能,無遷移;settings 加欄位靠 shallow merge(有測試)。

## Open Questions

(none)
