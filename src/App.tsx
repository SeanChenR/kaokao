import "./index.css";
import { useEffect } from "react";
import { StarField } from "./components/StarField";
import { Card } from "./components/ui/Card";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { initThemeSync } from "./stores/settings";

export function App() {
  useEffect(() => initThemeSync(), []);

  return (
    <>
      <StarField />
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <main className="min-h-screen flex items-center justify-center p-5">
        <Card className="w-full max-w-md px-8 py-10 text-center">
          <p className="text-sm tracking-[0.35em] text-info mb-2">星空自習室</p>
          <h1 className="text-5xl font-bold text-text">考考</h1>
          <p className="mt-4 text-muted">學生線上測驗 — 建置中,星星正在點亮 ✨</p>
        </Card>
      </main>
    </>
  );
}

export default App;
