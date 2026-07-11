## 1. 版面實作

- [x] 1.1 ZhuyinText rt 內部拆 zy-col/zy-tone 兩 span(正字法解析:前置 ˙ 入欄頂、尾調入 tone)(spec: Ruby rendering of rich zhuyin text / Tone placement);驗證:ZhuyinText.test 補結構斷言(RED→GREEN)
- [x] 1.2 theme.css 改寫 ruby/rt 樣式為右側直欄(design Decision 1/3/5),同步 theme.test.ts 斷言;行高 1.9→1.6(--text-question--line-height 與全案 leading-[1.9]);驗證:bun test 全綠
- [x] 1.3 截圖驗證(首頁+題卡,雙主題×雙視口):三符號音節、聲調位、輕聲位、不重疊;e2e 42 全綠。驗證:目視 + playwright 綠
