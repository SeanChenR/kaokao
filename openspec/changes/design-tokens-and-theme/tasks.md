## 1. Tracer bullet — 建置管線驗證

- [x] 1.1 建立最小 src/styles/theme.css(僅含一個 `[data-theme]` 變數與 `@theme inline` 映射)與假 woff2 資產,經 src/index.css `@import` 串起;行為:`bun run build` 後 dist 含該 CSS 變數與 hash 後的 woff2、`bun dev` 正常渲染(支撐 spec: Single CSS theme source、Self-hosted subset font 的建置前提)。驗證:`bun run build && grep -r "data-theme" dist/ && ls dist/*.woff2`;失敗則記錄並改用單檔 index.css 降級方案(design.md Risks 定義)

## 2. 主題解析與色彩 tokens

- [x] 2.1 實作 src/theme/resolve.ts 的 `resolveTheme(stored, systemDark)`(spec: Theme resolution with three-state preference);行為:六種組合輸出符合 spec 解析表。驗證:src/theme/resolve.test.ts 全綠(先寫 test:RED → GREEN)
- [x] 2.2 完成 src/styles/theme.css:兩主題全部色彩 tokens(`[data-theme="light|dark"]` 原始變數 + `@theme inline` 映射)、glow/shadow tokens、type scale、`font-num`(tabular-nums)utility、`@custom-variant dark`(spec: Single CSS theme source);行為:`bg-surface` 等 utility 在兩主題自動翻色、CSS 不含以 media query 定義的色值。驗證:bun test 的 utility 存在性檢查 + 手動 `bun dev` 切 data-theme 目視
- [x] 2.3 撰寫 src/styles/theme-contrast.test.ts(WCAG 相對亮度公式,斷言 text/muted on bg+surface ≥ 4.5、六個 accent on surface ≥ 3.0,兩主題)(spec: Token contrast compliance);行為:任何 token 不達標即測試失敗。驗證:調整淡色候選值至 bun test 全綠,定稿值回寫 docs/rules/ui-style.md token 表

## 3. 防 FOUC 與設定 store

- [x] 3.1 src/index.html 加入 blocking pre-paint inline script(try/catch 讀 localStorage `kaokao-settings` + matchMedia,依 resolveTheme 同規則設 `<html data-theme>`)(spec: Flash-free first paint);行為:深色 OS 首繪即深色、localStorage 例外時回退 auto。驗證:src/theme/prepaint.test.ts 讀 index.html 斷言 persist key 與 data-theme 賦值邏輯存在;手動 DevTools 模擬深色重載無白閃
- [x] 3.2 實作 src/stores/settings.ts(zustand persist,`{ theme: 'auto'|'light'|'dark', setTheme }`,key `kaokao-settings`)與 effective theme 套用(訂閱 store + matchMedia change → 更新 `data-theme`)(spec: Theme persistence、Theme resolution with three-state preference);行為:setTheme('dark') 後 root 屬性翻轉、auto 時 OS 變動即時跟隨、localStorage 毀損回退 auto。驗證:src/stores/settings.test.ts(happy-dom 模擬 matchMedia)全綠

## 4. 字型自架

- [x] 4.1 下載 jf open 粉圓 400/700 TTF 與 OFL 授權檔入 assets-src/fonts/;建立 scripts/charset.txt(常用字 4808 + ASCII + 注音符號 + 全形標點)與 scripts/subset-fonts.ts(subset-font 套件)(spec: Self-hosted subset font);行為:`bun run subset-fonts` 產出 src/assets/fonts/huninn-400.woff2 與 huninn-700.woff2,每檔 ≤ 1.5MB。驗證:執行 script 後 `ls -la src/assets/fonts/` 確認大小,spot-check 注音符號「ㄅㄆㄇ」在字集內
- [x] 4.2 src/styles/fonts.css 定義兩個 @font-face(`font-display: swap`)並設全站 font-family(spec: Self-hosted subset font);行為:頁面文字以粉圓渲染、無外部字型請求。驗證:`bun run build && ! grep -r "fonts.googleapis" dist/`;瀏覽器 Network 面板無 CDN 請求

## 5. 基礎元件與 App 殼層

- [x] 5.1 實作 src/components/ui/Button.tsx(primary/secondary/ghost、hover、primary 色 focus ring、disabled、min-h/min-w 44px、原生屬性透傳)(spec: Button component variants and states、Minimum touch target);行為:三 variant 與各狀態符合 spec。驗證:src/components/ui/Button.test.tsx(RTL:三 variant render、disabled 不觸發 onClick、focus ring class)先紅後綠
- [x] 5.2 實作 src/components/ui/Card.tsx(surface + border + 主題感知 cardShadow token)(spec: Card surface container);行為:兩主題下用各自 token。驗證:Card.test.tsx render 斷言 class 組成
- [x] 5.3 實作 src/components/ui/ThemeToggle.tsx(原生 button、44px 命中區、aria-label 隨狀態更新、Enter/Space 可觸發、切換寫入 store 手動偏好)(spec: Theme toggle control、Minimum touch target);行為:符合 theme toggle spec 情境。驗證:ThemeToggle.test.tsx(鍵盤觸發後 data-theme 翻轉 + aria-label 更新)
- [x] 5.4 實作 src/components/StarField.tsx(fixed、aria-hidden、兩主題 radial-gradient 變體)並組進 src/App.tsx 殼層(星空 + 置中 Card 品牌標題「考考」+ 右上 ThemeToggle;正文皆在 Card 上)(spec: Starfield background layer);行為:首頁雙主題呈現符合 mockup 氛圍、報讀器略過星空層。驗證:App.test.tsx smoke render 含 aria-hidden 斷言;`bun dev` 目視雙主題

## 6. 收尾

- [x] 6.1 主題切換 transition 包在 `@media (prefers-reduced-motion: no-preference)` 內(spec: Reduced-motion theme transition);行為:reduced-motion 使用者切換無動畫。驗證:theme.css 內容斷言(測試)+ DevTools 模擬 reduce 目視
- [ ] 6.2 全套本地驗證與文件同步:`bun run typecheck && bun run lint && bun test && bun run build` 全過;README 的指令段補 `bun run subset-fonts`。驗證:指令輸出零錯誤;git diff 檢視 docs/rules/ui-style.md 僅 token 表數值變動
