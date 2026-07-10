import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// RTL 在 bun:test 不會自動 cleanup,手動掛 afterEach
const { afterEach } = await import("bun:test");
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
