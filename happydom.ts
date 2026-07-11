import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// RTL 在 bun:test 不會自動 cleanup,手動掛 afterEach
const { afterEach } = await import("bun:test");
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);

// Motion 動畫在 happy-dom 無 WAAPI 支撐:全部瞬時,AnimatePresence 卸載可預測
const { MotionGlobalConfig } = await import("motion/react");
MotionGlobalConfig.instantAnimations = true;

// 單元測試預設關注音:ruby 會讓 textContent 混入注音字元,文字斷言全毀;
// 要驗 ruby 的測試自行 setState({ zhuyin: true })
const { beforeEach } = await import("bun:test");
beforeEach(async () => {
  const { useSettings } = await import("./src/stores/settings");
  useSettings.setState({ zhuyin: false });
});
