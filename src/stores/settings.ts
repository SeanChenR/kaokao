import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveTheme, type ThemePreference } from "../theme/resolve";

interface SettingsState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  /** 注音顯示(預設開;舊 payload 靠 persist shallow merge 自動補上) */
  zhuyin: boolean;
  setZhuyin: (zhuyin: boolean) => void;
  /** 上次作答姓名 — 下次預填種子;本場名字在 quiz store(跨 change 契約見 quiz-flow design) */
  lastName: string;
  setLastName: (lastName: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "auto",
      setTheme: (theme) => set({ theme }),
      zhuyin: true,
      setZhuyin: (zhuyin) => set({ zhuyin }),
      lastName: "",
      setLastName: (lastName) => set({ lastName }),
    }),
    {
      name: "kaokao-settings",
      version: 1,
      // v0(僅 theme)→ v1:欄位皆為加法,原樣沿用即可;未來非加法變更在此轉換
      migrate: (persisted) => persisted as Record<string, unknown>,
      partialize: (s) => ({ theme: s.theme, zhuyin: s.zhuyin, lastName: s.lastName }),
    },
  ),
);

function systemDarkQuery(): MediaQueryList {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

function apply(theme: ThemePreference, systemDark: boolean): void {
  document.documentElement.dataset.theme = resolveTheme(theme, systemDark);
}

/** 訂閱 store 與 OS 偏好,持續把 effective theme 寫到 <html data-theme>。回傳 cleanup(StrictMode 雙掛載安全)。 */
export function initThemeSync(): () => void {
  const media = systemDarkQuery();
  apply(useSettings.getState().theme, media.matches);
  const unsubscribe = useSettings.subscribe((s) => apply(s.theme, systemDarkQuery().matches));
  const onChange = (e: MediaQueryListEvent) => apply(useSettings.getState().theme, e.matches);
  media.addEventListener("change", onChange);
  return () => {
    unsubscribe();
    media.removeEventListener("change", onChange);
  };
}
