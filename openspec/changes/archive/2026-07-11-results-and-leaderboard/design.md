## Context

作答流程完整,result 是佔位。二視角 review 的發現(entry 身分、MODIFIED delta 坑、confetti 測試、seed 時序、回顧序列化)全數納入。

## Goals / Non-Goals

**Goals:** 計分揭曉、結果頁(星軌全亮/文案/confetti/回顧/排行榜)、排行榜 store 與開始頁預覽

**Non-Goals:** 跨裝置排行榜、Motion spring/音效(polish)、逐題重播

## Decisions

1. **寫榜在 store submit guard 內**(算分+elapsed+add 於 `set({phase:"result"})` 前),double-submit 天然一次;ResultScreen 只讀。跨 store 呼叫沿用 start→setLastName 前例
2. **finishedAt 三處同步**(interface/initial/partialize);auto submit 時 finishedAt = deadline(非 Date.now(),用時語意乾淨);`lastEntryId` 一併存 quiz state + partialize — reload 後高亮仍成立
3. **entry 有唯一 id**(`crypto.randomUUID()`);高亮以 id 比對;本次未進 Top 10 → 榜下方釘一列「你的名次 #N」(從完整排序算)
4. **seed 走 declarative initial state**:`entries: SEED`(5 筆,at 給過去時戳、`demo: true` 標記),partialize entries;persist merge 天然「只 seed 一次」;demo 筆以 muted 樣式 + 「示範」小標可辨(誠信);不做空榜邀請文案(unreachable)
5. **計分 src/quiz/score.ts**:`isCorrect(q, v)`(single/image ===;multi 陣列全等;fill trim 命中 accept;match 完全映射)、`scoreOf(questions, answers)`;quiz 階段零對錯洩漏
6. **回顧列表結構化**:`ul/li`;每題 = 對錯文字 badge(「答對了!」/「再想想看」,非純色)+ 依型序列化 — single/image/fill:我的答案(未答=「(沒有作答)」)+ 答錯附正解;multi:逐選項三態標示(✓ 正確選、△ 漏選、✗ 多選);match:逐列「左項:你的連線 → / 正解 →」,部分連線照實顯示;全部文字經 ZhuyinText
7. **confetti 分級**:滿分全開、≥60% 輕灑(count 減半)、<60% 不放;`prefers-reduced-motion` 完全略過;canvas 掛在 aria-hidden wrapper;動態 `import("canvas-confetti")` + 測試 `mock.module` 隔離(happy-dom 無 canvas context)
8. **結果揭曉 a11y**:結果標題 h1 tabIndex=-1 掛載時 focus;`role="status"` 播報「答對 N 題,共 5 題」;星軌全亮為裝飾(aria-hidden),文字分數是真值
9. **分級文案四級**:5/5 滿天星、≥3 星光閃閃、≥1 點亮了 N 顆、0 先別灰心(mockup 文案),皆鼓勵語氣
10. **quiz-session MODIFIED delta**:整條複製修改兩條 requirement(state machine 加 finishedAt/寫榜語意;survives-reload 欄位清單加 finishedAt/lastEntryId),header 逐字對齊

## Implementation Contract

**資料形狀:**

- `LeaderboardEntry = { id: string; name: string; score: number; elapsedSec: number; at: number; demo?: true }`
- `useLeaderboard`:`{ entries, add(entry) }`,persist key `kaokao-leaderboard`,add 後排序(score desc, elapsedSec asc)截 Top 10;`rankOf(id)` selector 用完整插入序計算名次
- quiz store 增:`finishedAt: number|null`、`lastEntryId: string|null`(皆 partialize)

**行為:**

- 送出後結果頁:分數 n/5+答對率、四級文案、星軌答對亮/答錯暗、confetti 按分級、回顧列表結構化、排行榜(demo 筆 muted+示範標)本次列高亮(不在榜內→「你的名次 #N」)、再玩一次(reset→start 畫面,lastName 預填仍在)
- 開始頁排行榜預覽:前 5 筆(demo 可見),同樣 muted 標示
- autoSubmitted → 結果頁頂部「時間到,自動交卷!」(既有)

**失敗模式:**

- crypto.randomUUID 不可用(舊瀏覽器)→ fallback `Date.now()+random` 字串
- confetti import 失敗 → 靜默略過(裝飾非核心)

**驗收條件:**

1. bun test:score 全型別矩陣(含未答)、leaderboard(排序/截斷/rankOf/seed merge/同名多筆以 id 高亮)、ResultScreen(status 播報、焦點、回顧序列化三態、confetti mock 按分級呼叫)、quiz store finishedAt/lastEntryId persist
2. e2e:全答對路徑 → 結果頁分數/回顧/榜高亮;再玩一次 → 開始頁預覽含新紀錄;reload 結果頁 → 分數與高亮不變
3. 截圖:結果頁雙主題×雙視口(滿分與部分答對兩種)

**範圍邊界:** In:計分/結果頁/排行榜/開始頁預覽。Out:音效、spring、跨裝置

## Risks / Trade-offs

- [demo seed 誠信] → demo 標記+muted+README 註明;真實成績永遠優先高亮
- [回顧列表資訊密度(注音+三態)] → 手機截圖自檢把關,必要時摺疊正解區
- [canvas-confetti 測試] → mock.module 隔離;reduced-motion skip 路徑另測

## Migration Plan

quiz store 加欄位靠 shallow merge(sessionStorage 生命週期短,風險低);leaderboard 新 key 無遷移。

## Open Questions

(none)
