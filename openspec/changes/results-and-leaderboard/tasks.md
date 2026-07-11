## 1. 計分與資料層

- [x] 1.1 實作 src/quiz/score.ts(isCorrect 五型 + scoreOf)(spec: Per-type correctness judgement);驗證:score.test.ts 判分矩陣全綠(含未答=錯、fill trim、match 部分=錯)RED→GREEN
- [x] 1.2 實作 src/stores/leaderboard.ts(entry 含 uuid、add 排序截 Top10、rankOf、SEED 為 declarative initial、persist kaokao-leaderboard)(spec: Leaderboard ordering and retention、Demo seed entries);驗證:leaderboard.test.ts(排序/同分比時間/截斷/seed merge 不重複/demo 不高亮)
- [x] 1.3 quiz store 增 finishedAt + lastEntryId(interface/initial/partialize 三處)並在 submit guard 內算分寫榜(auto 時 finishedAt=deadline)(spec: Elapsed time recording、MODIFIED Quiz session state machine、Session survives a reload);驗證:quiz.test.ts 補(雙觸發一筆、auto elapsed=600、reload 保留 finishedAt/lastEntryId)

## 2. 結果頁

- [ ] 2.1 實作 ReviewList.tsx(ul/li、文字 badge、三型序列化:單值/multi 三態/match 逐列,未答佔位,ZhuyinText)(spec: Structured answer review);驗證:ReviewList.test.tsx(multi delta、match 部分連線、未答)
- [ ] 2.2 實作 LeaderboardList.tsx(排序列、demo muted+示範標、以 id 高亮、rankOf 補位列)(spec: Current-run highlight、Demo seed entries);驗證:LeaderboardList.test.tsx(同名不誤標、不在榜顯名次)
- [ ] 2.3 實作 ResultScreen.tsx(h1 focus、role=status 播報、四級文案、星軌全亮 aria-hidden、confetti 分級+reduced-motion 略過+動態 import+mock.module 測試隔離、再玩一次)並接入 App(spec: Result reveal accessibility、Tiered feedback without blame);驗證:ResultScreen.test.tsx(status 文字、焦點、confetti mock 依分數呼叫/不呼叫)
- [ ] 2.4 StartScreen 加排行榜預覽前 5(共用 LeaderboardList 簡化模式)(spec: Start screen preview);驗證:StartScreen.test.tsx 補斷言

## 3. 收尾

- [ ] 3.1 e2e:全答對(用已知答案作答)→ 結果頁分數 5/5+高亮+confetti canvas 存在;部分作答 → 對應文案;結果頁 reload 分數/高亮不變且不重複寫榜;再玩一次 → 開始頁預覽含新紀錄(spec 各項);驗證:playwright 綠
- [ ] 3.2 README 註明 demo seed;全套 gate + 結果頁雙主題×雙視口截圖(滿分/部分兩種)。驗證:指令零錯+截圖目視
