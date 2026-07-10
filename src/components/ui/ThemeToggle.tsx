import { useSyncExternalStore } from "react";
import { resolveTheme } from "../../theme/resolve";
import { useSettings } from "../../stores/settings";

export function ThemeToggle() {
  const theme = useSettings((s) => s.theme);
  const systemDark = useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const effective = resolveTheme(theme, systemDark);
  const next = effective === "dark" ? "light" : "dark";
  const label = next === "dark" ? "切換為深色模式" : "切換為淺色模式";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => useSettings.getState().setTheme(next)}
      className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-2xl
        bg-surface text-text border border-line cursor-pointer text-xl
        transition-[border-color,box-shadow] duration-150 hover:border-primary
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
    >
      {effective === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

