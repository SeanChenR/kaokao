import "./index.css";
import { useEffect } from "react";
import { StarField } from "./components/StarField";
import { ZhuyinText } from "./components/ZhuyinText";
import { Card } from "./components/ui/Card";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { ZhuyinToggle } from "./components/ui/ZhuyinToggle";
import type { Rich } from "./data/schema";
import { initThemeSync } from "./stores/settings";

// 佔位歡迎詞 — quiz-flow change 會替換為開始畫面
const welcome: Rich = [
  [
    { t: "一", z: "ㄧˋ" },
    { t: "起", z: "ㄑㄧˇ" },
  ],
  [
    { t: "點", z: "ㄉㄧㄢˇ" },
    { t: "亮", z: "ㄌㄧㄤˋ" },
  ],
  [
    { t: "星", z: "ㄒㄧㄥ" },
    { t: "星", z: "ㄒㄧㄥ" },
  ],
  [{ t: "吧", z: "˙ㄅㄚ" }, { t: "!" }],
];

export function App() {
  useEffect(() => initThemeSync(), []);

  return (
    <>
      <StarField />
      <div className="fixed top-4 right-4 z-10 flex gap-2.5">
        <ZhuyinToggle />
        <ThemeToggle />
      </div>
      <main className="min-h-screen flex items-center justify-center p-5">
        <Card className="w-full max-w-md px-8 py-10 text-center">
          <p className="text-sm tracking-[0.35em] text-info mb-2">星空自習室</p>
          <h1 className="text-5xl font-bold text-text">考考</h1>
          <p className="mt-5 text-question leading-[1.9] text-muted">
            <ZhuyinText rich={welcome} />
            <span aria-hidden="true"> ✨</span>
          </p>
        </Card>
      </main>
    </>
  );
}

export default App;
