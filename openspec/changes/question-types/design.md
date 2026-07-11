## Context

quiz-flow 已立好 QuestionSlot 契約(question/value/onChange)與 AnswerValue 型別映射;本 change 填入五題型互動。二視角 review 的全部發現已納入本設計。

## Goals / Non-Goals

**Goals:** 五題型作答元件,互動/a11y/視覺狀態完整,選項含注音渲染

**Non-Goals:** 對錯揭曉樣式(results)、Motion spring 與音效(polish;selBounce 級 CSS 過渡先行,polish 換 spring)

## Decisions

1. **number 契約不外洩**:Radix RadioGroup 的 string value 轉換收在各 widget 內(`String(i)` ↔ `Number(v)`),QuestionSlot 只做 discriminated union 分派。undefined/null → RadioGroup value=""
2. **single/image 不可取消**:一旦作答只能改選、不可清空;null 僅代表「未曾作答」。理由:radio 標準語意不支援反選,強加 toggle 會破壞 aria-checked 語意;計分本就需要作答
3. **multi 手刻 checkbox 卡**(role="checkbox" + aria-checked + Space/Enter toggle):Radix Checkbox 是單顆 boolean,群組 toggle 邏輯自己寫更直接;卡上已選時顯示常駐「還能再選」微提示
4. **fill 不進 heading**:QuestionCard 的 h2 只渲染純題幹(移除 ___ 與 suffix 特判);FillBlank 在 slot 內渲染 `[行內輸入框][suffix]`,input aria-label 取題幹純文字。理由:input 在 heading 內是 a11y 反模式,且讓 QuestionCard 回歸 type-agnostic。IME:onChange 即寫 store,composition 結束值自然覆蓋(不需 flush)
5. **matching 互動契約**:
   - 滑鼠/觸控:點左(aria-pressed 高亮)→ 點右成對;點已配對左項=取消該線;點已被佔用的右項=把它重配給當前選中左項
   - 鍵盤:全部是原生 button(Tab 序:左欄由上而下→右欄),Enter/Space 觸發同滑鼠語意
   - SR:polite live region 播報「〇〇 和 〇〇 配對了/取消了」;左項 aria-pressed 反映選中
   - SVG 連線量測:`useLayoutEffect` 內 `measure()`(相對容器座標);重算源=容器 ResizeObserver、`document.fonts.ready`、zhuyin 開關訂閱、配對變更;persist 續作在首次 layout 後即畫既有線
6. **ImageChoice 用 lucide-react**(Circle/Triangle/Square/Star/Heart/Hexagon 全內建):零自刻幾何、heart/star 免費、stroke 一致;選取/focus 光暈用外層 wrapper 的 drop-shadow(貼合剪影)。色彩輪替 primary/success/info(**排除 accent** — 那是配對連線的語意色);色彩純裝飾不承載作答資訊,辨識靠形狀+label
7. **aria 對照表(實作依此,測試逐項斷言)**:
   | widget | 容器 role | 選項 role/屬性 | 名稱來源 |
   |---|---|---|---|
   | single | radiogroup(aria-labelledby=題幹 h2 id) | radio + aria-checked | 選項 Rich 文字 |
   | multi | group(aria-labelledby=題幹) | checkbox + aria-checked | 選項 Rich 文字 |
   | fill | — | textbox(input) | aria-label=題幹純文字 |
   | match | group(aria-labelledby=題幹) | button + aria-pressed(左) / button(右) + live 播報 | 項目 Rich 文字 |
   | image | radiogroup(aria-labelledby=題幹) | radio + aria-checked | aria-label=shape label 純文字 |
8. **注音貫穿**:所有 widget 的 Rich 內容(options/left/right/shapes.label)一律經 ZhuyinText 渲染並尊重注音開關;選項卡 line-height ≥ 1.9、選項字級 ≥ 1.125rem
9. **觸控**:選項卡最小高 48px(勝過 44 底線,對象是學童)、卡間 gap ≥ 10px;match 左右欄 gap ≥ 24px 防跨欄誤觸
10. **測試切分**:狀態轉移(aria-checked 切換、onChange payload、match 配對/取消/重配、鍵盤)= RTL;幾何/連線座標/48px/focus ring/字型重算 = e2e(happy-dom 無 layout);e2e 新增「真實作答全五題 → 無 dialog 直接送出」路徑,保留全未答路徑

## Implementation Contract

**行為:**

- 每題型依 aria 對照表渲染;選取狀態改變即呼叫 onChange 且 payload 型別符合 AnswerValueMap;選項注音隨全域開關顯隱
- Matching 連線在 resize/字型載入/注音切換後仍貼合按鈕;取消與重配立即反映在線與 live region

**驗收條件:**

1. `bun test`:五 widget RTL(對照表逐項 aria 斷言、payload 型別、match 全狀態機含鍵盤)全綠
2. `bun run e2e`:真實作答路徑(五題各作答 → 星軌全亮 → 已答 5/5 → 直接送出)+ 注音開關影響選項 + match 連線存在(SVG line 數量)
3. 截圖:五題型 × 雙主題(手機視口)自檢對照 mockup

**範圍邊界:** In:五 widget + QuestionCard fill 特判移除 + e2e。Out:對錯樣式、spring、音效

## Risks / Trade-offs

- [happy-dom 對 role=radio 群組鍵盤(方向鍵)支援有限] → 方向鍵導航交給 Radix RadioGroup 原生行為 + e2e 驗;RTL 只驗 click/Space
- [lucide icon 線條風 vs mockup 實心色塊] → lucide 可用 fill 屬性上色(fill=currentColor + stroke),截圖自檢定奪;不合再退 inline SVG 實心
- [match 連線在 happy-dom 全 0 座標] → 連線渲染邏輯容忍 0 座標(不 NaN),座標正確性由 e2e 把關

## Migration Plan

QuestionCard 移除 fill 佔位特判(行為轉移至 FillBlank);e2e 既有斷言同步。無資料遷移。

## Open Questions

(none)
