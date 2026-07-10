# Tech Stack

定案日:2026-07-10,與 Sean 逐項討論確認。變更 stack 需先討論並更新此文件。

## 核心

| 類別                   | 選擇                                                 | 理由                                                              |
| ---------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Runtime / PM / bundler | **Bun**(原生 HTML bundler + dev server + HMR)        | 零額外 build 工具;`bun dev` 開發、`bun build` 打包                |
| 語言                   | **TypeScript 7**(`@typescript/native-preview`, tsgo) | Bun 直接執行 TS;typecheck 用 `tsgo --noEmit`                      |
| 前端框架               | **React 19**                                         |                                                                   |
| 樣式                   | **Tailwind CSS v4**                                  | design tokens 走 CSS variables;深淺色主題用 custom properties     |
| 狀態管理               | **Zustand**(+ `persist` middleware)                  | 測驗狀態、主題、排行榜(localStorage)集中管理                      |
| 元件基底               | **Radix Primitives** + Tailwind 自刻樣式             | 鍵盤導航/焦點管理/ARIA 免費拿(a11y 加分項),視覺完全自訂避免範本感 |
| 動效                   | **Motion**(前 framer-motion)+ 純 CSS                 | 狀態回饋用 CSS;題目切換、進度、結果頁用 Motion spring             |
| Icons                  | **lucide-react**                                     | tree-shakable                                                     |
| 慶祝動畫               | **canvas-confetti**                                  | 結果頁灑紙花,2KB                                                  |
| 音效                   | 原生 **Web Audio**                                   | 答對/答錯提示音,預設靜音可切換,不加套件                           |
| 字型                   | 教育風中文字型自架(候選:jf open 粉圓 / 芫荽 Iansui)  | 圓體系對小學生親和,避免 CDN 依賴;UI 討論時定案                    |
| Lint / Format          | **oxlint** / **oxfmt**                               | Rust 系速度;型別錯誤另由 tsgo 把關                                |

## 注音(Ruby annotation)

- 注音**預寫入題庫 JSON**,執行期只渲染原生 `<ruby>` 標籤,零執行期轉換依賴
- 產製流程:`pinyin-pro`(devDependency,authoring script)產生初稿 → 人工校對破音字 → 存入 JSON
- 理由:JD 明寫「破音字與邊界情境不能出錯」,執行期詞庫判斷不可控

## 測試

| 層級             | 工具                                            |
| ---------------- | ----------------------------------------------- |
| Unit / Component | `bun test` + @testing-library/react + happy-dom |
| E2E              | Playwright(完整作答流程 + 手機視口)             |

## 不用的東西(刻意決定)

- **後端 / API**:題庫寫死在單一 JSON(單選、多選、填空、配對、圖片題全備),前端隨機抽 5 題;排行榜等持久化走 localStorage(zustand persist)
- **Router**:single page,無路由需求
- **shadcn/ui**:預設風格是 SaaS 後台系,做小學生活潑風要大幅覆寫,直接用底層 Radix 自刻

## 指令

```bash
bun dev            # 開發(HMR)
bun test           # unit/component 測試
bun run e2e        # Playwright
bun run typecheck  # tsgo --noEmit
bun run lint       # oxlint
bun run format     # oxfmt
bun run build      # 產出靜態檔
```
