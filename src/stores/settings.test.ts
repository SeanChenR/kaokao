import { beforeEach, describe, expect, test } from "bun:test";

// spec: theme-system / Theme persistence、Theme resolution with three-state preference

type MediaListener = (e: { matches: boolean }) => void;

function stubMatchMedia(initialDark: boolean) {
  const listeners: MediaListener[] = [];
  let matches = initialDark;
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, fn: MediaListener) => listeners.push(fn),
    removeEventListener: () => {},
  })) as never;
  return {
    setSystemDark(v: boolean) {
      matches = v;
      for (const fn of listeners) fn({ matches: v });
    },
  };
}

async function freshStore() {
  // 每次測試取全新 module 實例,避免 zustand 單例殘留
  const mod = await import(`./settings.ts?t=${Math.random()}`);
  return mod as typeof import("./settings");
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = "";
});

describe("settings store", () => {
  test("setTheme('dark') flips root data-theme and persists under kaokao-settings", async () => {
    stubMatchMedia(false);
    const { useSettings, initThemeSync } = await freshStore();
    initThemeSync();
    useSettings.getState().setTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("kaokao-settings")).toContain('"theme":"dark"');
  });

  test("auto mode follows live OS preference changes", async () => {
    const media = stubMatchMedia(false);
    const { useSettings, initThemeSync } = await freshStore();
    initThemeSync();
    expect(useSettings.getState().theme).toBe("auto");
    expect(document.documentElement.dataset.theme).toBe("light");
    media.setSystemDark(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("manual choice ignores later OS changes", async () => {
    const media = stubMatchMedia(false);
    const { useSettings, initThemeSync } = await freshStore();
    initThemeSync();
    useSettings.getState().setTheme("light");
    media.setSystemDark(true);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  test("corrupted persisted state falls back to auto without throwing", async () => {
    stubMatchMedia(true);
    localStorage.setItem("kaokao-settings", "{not json");
    const { useSettings, initThemeSync } = await freshStore();
    initThemeSync();
    expect(useSettings.getState().theme).toBe("auto");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("zhuyin preference", () => {
  test("defaults to true", async () => {
    stubMatchMedia(false);
    const { useSettings } = await freshStore();
    expect(useSettings.getState().zhuyin).toBe(true);
  });

  test("legacy theme-only payload rehydrates with zhuyin=true and theme preserved", async () => {
    stubMatchMedia(false);
    localStorage.setItem("kaokao-settings", JSON.stringify({ state: { theme: "dark" }, version: 0 }));
    const { useSettings } = await freshStore();
    expect(useSettings.getState().zhuyin).toBe(true);
    expect(useSettings.getState().theme).toBe("dark");
  });

  test("setZhuyin persists", async () => {
    stubMatchMedia(false);
    const { useSettings } = await freshStore();
    useSettings.getState().setZhuyin(false);
    expect(localStorage.getItem("kaokao-settings")).toContain('"zhuyin":false');
  });
});
