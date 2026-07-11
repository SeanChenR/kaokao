import { beforeEach, describe, expect, test } from "bun:test";
import { blip, melody, unlock } from "./blip";

// spec: Gentle audio feedback, off by default — no-op 守門

function stubMatchMedia() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  })) as never;
}

beforeEach(async () => {
  localStorage.clear();
  stubMatchMedia();
  const { useSettings } = await import("../stores/settings");
  useSettings.setState({ sound: true });
});

describe("blip (happy-dom: no AudioContext)", () => {
  test("all APIs no-op without throwing when Web Audio is unavailable", () => {
    expect(typeof AudioContext).toBe("undefined");
    expect(() => unlock()).not.toThrow();
    expect(() => blip(660)).not.toThrow();
    expect(() => melody([523, 659, 784])).not.toThrow();
  });

  test("sound=false short-circuits before touching audio", async () => {
    const { useSettings } = await import("../stores/settings");
    useSettings.setState({ sound: false });
    expect(() => blip(660)).not.toThrow();
  });
});
