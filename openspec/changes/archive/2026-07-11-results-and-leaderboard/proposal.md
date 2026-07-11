## Why

作答流程已完整,但送出後只有佔位頁 — 學生看不到成績與回顧,JD 基本需求「呈現結果畫面(分數或作答回顧)」尚未兌現。排行榜(Sean 指定需求)也在此落地。

## What Changes

- 計分模組:五題型 isCorrect(single/image 索引相等;multi 陣列全等;fill trim 後命中 accept 任一;match 完全正確映射)+ 總分;**送出後才揭曉**(quiz 階段無對錯回饋)
- quiz store 補 `finishedAt`:submit 時記錄,用時 = finishedAt - startedAt(cap 10 分鐘);autoSubmitted ack 已有
- 結果頁(取代佔位):星軌全亮時刻(答對星亮+glow、答錯暗)、分級 emoji+鼓勵文案(滿分/≥60%/>0/0 四級,錯了不責備)、大分數 n/5 + 答對率、canvas-confetti(Aura 六色,respect reduced-motion)、作答回顧列表(每題對錯 badge、我的答案 vs 正解、答錯才顯示正解;文字經 ZhuyinText)、排行榜(高亮本次)、再玩一次
- 排行榜 store(localStorage persist,獨立 slice):entry = {name, score, elapsedSec, at};排序分數↓用時↑,只留 Top 10;同名允許重複;送出時以 `quiz.name`(非 settings.lastName)寫入
- 開始畫面加「今夜排行榜」預覽(前 5 名,mockup 樣式);空榜時顯示邀請文案
- 初始 seed 榜(mockup 的小美/阿哲等 5 筆):首次載入寫入,讓排行榜有生命感

## Non-Goals

- 跨裝置排行榜(localStorage 單機,grill 定案)
- Motion spring 動畫編排與音效(polish)
- 回顧列表的逐題重播互動

## Capabilities

### New Capabilities

- `scoring`: 五題型判分與總分,送出後揭曉
- `results-screen`: 結果頁(星軌全亮、文案分級、confetti、回顧列表、再玩一次)
- `leaderboard`: 排行榜 store、排序規則、開始頁預覽、結果頁高亮

### Modified Capabilities

- `quiz-session`: submit 記錄 finishedAt(用時來源)

## Impact

- Affected specs: scoring(新)、results-screen(新)、leaderboard(新)、quiz-session(修改)
- Affected code:
  - New: src/quiz/score.ts(+test), src/stores/leaderboard.ts(+test), src/components/quiz/ResultScreen.tsx(+test), src/components/quiz/ReviewList.tsx, src/components/quiz/LeaderboardList.tsx(+test), 對應測試
  - Modified: src/stores/quiz.ts(finishedAt + 寫榜), src/components/quiz/StartScreen.tsx(榜預覽), src/App.tsx(ResultScreen 接入), e2e
  - Removed: (none)
