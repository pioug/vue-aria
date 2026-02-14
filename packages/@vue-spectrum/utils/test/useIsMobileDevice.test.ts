import { afterEach, describe, expect, it } from "vitest";
import { useIsMobileDevice } from "../src/useIsMobileDevice";

describe("useIsMobileDevice", () => {
  const originalScreen = window.screen;

  afterEach(() => {
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: originalScreen,
    });
  });

  it("returns true when screen width is <= 700", () => {
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: { width: 700 },
    });

    expect(useIsMobileDevice()).toBe(true);
  });

  it("returns false when screen width is > 700", () => {
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: { width: 701 },
    });

    expect(useIsMobileDevice()).toBe(false);
  });
});
