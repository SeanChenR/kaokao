## Why

所有後續 change(題庫、作答流程、題型元件、結果頁)都依賴同一套視覺地基:Aura 雙主題色彩 tokens、粉圓字型與基礎元件。先把地基立好並部署,之後每個功能 merge 都能直接長在正確的視覺系統上,避免後期全面重刷樣式。地基階段也是淡色候選 token 過 WCAG AA 定稿的唯一時機。

## What Changes

- 將 `docs/rules/ui-style.md` 的 Aura 雙主題色彩 tokens 以 CSS custom properties 定義,並接進 Tailwind v4 `@theme`,產生可用的 utility(如 `bg-surface`、`text-primary`)
- **AA 對比定稿**:以對比檢核工具逐一驗證兩主題的 token 前景/背景組合(正文 4.5:1、大字與 UI 元件 3:1),未達標者調整明度後定稿;定稿值回寫 ui-style.md 的 token 表(該文件明示此為預定的定稿動作)
- **主題三態契約**:`auto | light | dark`,預設 auto(跟隨系統),手動切換後覆蓋系統並存入 zustand persist;所有 CSS 只認 `<html data-theme="light|dark">` 單一屬性(不用 media query 定色),`@custom-variant` 對應之;系統偏好變動時 auto 模式即時跟隨
- **防 FOUC**:index.html `<head>` 內置 blocking inline script,先讀 persist key + `matchMedia` 解析出有效主題並掛上 `data-theme` 再繪製;與 store 的解析邏輯同一份規則
- 自架 jf open 粉圓(Huninn)woff2 字型:以 `subset-font`(devDependency,Bun 可直接執行)對來源字型做常用字集 subset,weight 400/700 兩檔輸出至 src/assets/fonts/,`font-display: swap`,不使用 Google Fonts CDN
- **排版與效果 tokens**:type scale(題目字級 ≥ 1.25rem、line-height ≥ 1.9)、`tabular-nums` utility、主題感知的 glow/shadow tokens(深色 neon / 淡色柔和陰影,同名變數兩種曝光)— 供後續所有 change 使用
- 星空背景層:多層 radial-gradient 星點(依 mockup),深淺主題各自變體,`aria-hidden` 純裝飾;分層規則:正文一律落在 surface 卡片上,星點只出現在 bg 空白區
- 基礎共用元件:Button(primary / secondary / ghost,含 hover、focus ring、disabled)、Card(surface 容器)、ThemeToggle(右上角日/夜切換,`<button>` 語意 + aria-label 反映當前狀態 + focus ring)
- **互動底線**:所有互動元件最小命中區 44×44px;主題切換的顏色 transition 在 `prefers-reduced-motion: reduce` 時停用
- App 殼層套用主題與星空背景,首頁暫顯示品牌標題與 ThemeToggle(佔位,後續 change 替換)
- 首個 task 為 tracer-bullet:驗證 `@theme` 拆檔(styles/theme.css、styles/fonts.css 經 index.css `@import`)與 woff2 資產經 build.ts 正確進 dist,通過後才展開其餘實作

## Non-Goals

- 不做任何測驗功能(題庫、作答、計分皆屬後續 change)
- 不做音效開關(SoundToggle 屬 polish change)
- 不做 Motion 動畫編排(polish change);本 change 只有 CSS transition 層級的狀態回饋
- 不引入 Radix(基礎 Button/Card 無需 primitives;Radix 從題型元件 change 開始用)
- 不做 content-driven 字型 subset(題庫尚不存在,採靜態常用字集;若日後題庫用字超出字集,於 question-bank change 補洞)

## Capabilities

### New Capabilities

- `theme-system`: 雙主題色彩/排版/效果 tokens 與 AA 定稿、三態主題解析(auto/light/dark → data-theme)、防 FOUC、字型自架、星空背景
- `base-components`: Button、Card、ThemeToggle 基礎元件、互動狀態與 44px 觸控底線

### Modified Capabilities

(none)

## Impact

- Affected specs: theme-system(新)、base-components(新)
- Affected code:
  - New: src/styles/theme.css, src/styles/fonts.css, src/assets/fonts/(粉圓 woff2 subset 輸出), assets-src/fonts/(來源字型檔,不進 bundle), scripts/subset-fonts.ts, src/stores/settings.ts, src/theme/resolve.ts(主題解析單一真相), src/components/ui/Button.tsx, src/components/ui/Card.tsx, src/components/ui/ThemeToggle.tsx, src/components/StarField.tsx, 以及對應測試檔
  - Modified: src/index.css, src/App.tsx, src/index.html(pre-paint script), package.json(subset script 與 devDependency), docs/rules/ui-style.md(僅 token 表定稿值回寫)
  - Removed: (none)
