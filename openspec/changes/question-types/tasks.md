## 1. 基礎與交接

- [x] 1.1 QuestionCard 移除 fill 的 ___ 與 suffix 特判,h2 回歸純題幹;QuestionSlot 改為五題型 discriminated union 分派骨架(暫渲染各 widget 空殼)(design Decision 4);行為:h2 內無 input、無特判。驗證:QuestionCard 相關測試更新後綠
- [x] 1.2 建立 src/components/quiz/widgets/ShapeIcon.tsx(lucide Circle/Triangle/Square/Star/Heart/Hexagon 映射,fill 上色,wrapper drop-shadow glow)(spec: Image options render recognizable shapes);行為:六形狀渲染。驗證:ShapeIcon.test.tsx 六形狀 render

## 2. 選擇類 widgets

- [x] 2.1 實作 SingleChoice.tsx(Radix RadioGroup,string↔number 轉換內收,aria-labelledby 題幹,radio+aria-checked,48px 卡,ZhuyinText 選項,不可取消)(spec: Widget accessibility contract、Selection behavior per type、Child-friendly touch targets);驗證:SingleChoice.test.tsx(aria 對照、payload number、改選不清空)RED→GREEN
- [x] 2.2 實作 MultiChoice.tsx(手刻 role=checkbox 卡,aria-checked,Space/Enter toggle,遞增去重陣列,「還能再選」微提示)(spec 同上);驗證:MultiChoice.test.tsx(toggle 狀態機、payload 遞增)
- [x] 2.3 實作 ImageChoice.tsx(radiogroup,radio aria-label=shape label 純文字,色彩輪替 primary/success/info,drop-shadow 選取)(spec: Image options render recognizable shapes);驗證:ImageChoice.test.tsx(aria-label、payload、選取狀態)

## 3. 填空與配對

- [x] 3.1 實作 FillBlank.tsx(slot 內行內 input + suffix,aria-label=題幹純文字,onChange 即寫 store,IME 相容)(spec: Selection behavior per type);驗證:FillBlank.test.tsx(輸入 payload、aria-label)
- [x] 3.2 實作 Matching.tsx 狀態機(選左/配對/取消/重配,原生 button,aria-pressed,live region 播報)(spec: Matching interaction state machine);驗證:Matching.test.tsx(全狀態機含重配、live region 文字、鍵盤 Enter/Space)
- [x] 3.3 Matching SVG 連線量測(useLayoutEffect measure + 容器 ResizeObserver + document.fonts.ready + zhuyin 訂閱重算;happy-dom 0 座標容忍)(spec: Connection lines stay anchored);驗證:單元測試斷言 line 元素數量隨配對變化;座標正確性由 e2e

## 4. 整合與收尾

- [ ] 4.1 e2e 補「真實作答全五題」路徑:五題各完成作答(single 點選/multi 兩選/fill 輸入/match 三連線/image 點選)→ 星軌 5/5 → 直接送出無 dialog → result;补注音開關影響選項斷言、match line 數量斷言(spec: Widget accessibility contract、Connection lines stay anchored);驗證:bunx playwright test 綠
- [ ] 4.2 五題型 × 雙主題截圖自檢對照 mockup;全套 gate(typecheck/lint/test/e2e/build)。驗證:指令零錯 + 截圖目視
