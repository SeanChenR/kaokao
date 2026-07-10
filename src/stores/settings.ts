import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveTheme, type ThemePreference } from "../theme/resolve";

interface SettingsState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "auto",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "kaokao-settings" },
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
