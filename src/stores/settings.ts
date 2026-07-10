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

/** 訂閱 store 與 OS 偏好,持續把 effective theme 寫到 <html data-theme>。App 啟動時呼叫一次。 */
export function initThemeSync(): void {
  const media = systemDarkQuery();
  apply(useSettings.getState().theme, media.matches);
  useSettings.subscribe((s) => apply(s.theme, systemDarkQuery().matches));
  media.addEventListener("change", (e) => apply(useSettings.getState().theme, e.matches));
}
