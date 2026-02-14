import { effectScope } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useColorScheme, useScale } from "../src/mediaQueries";
import type { Theme } from "../src/types";

const theme: Theme = {
  global: {},
  light: {},
  dark: {},
  medium: {},
  large: {},
};

const mediaQueryLight = "(prefers-color-scheme: light)";
const mediaQueryDark = "(prefers-color-scheme: dark)";
const mediaQueryFinePointer = "(any-pointer: fine)";

function mockMatchMedia(activeQueries: Set<string>) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: activeQueries.has(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("mediaQueries", () => {
  beforeEach(() => {
    mockMatchMedia(new Set());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useColorScheme", () => {
    it("uses OS as default - dark", () => {
      mockMatchMedia(new Set([mediaQueryDark]));
      const scope = effectScope();
      const value = scope.run(() => useColorScheme(theme, "light").value)!;
      scope.stop();
      expect(value).toBe("dark");
    });

    it("uses OS as default - light", () => {
      mockMatchMedia(new Set([mediaQueryLight]));
      const scope = effectScope();
      const value = scope.run(() => useColorScheme(theme, "light").value)!;
      scope.stop();
      expect(value).toBe("light");
    });

    it("uses default light if OS is not useable", () => {
      const scope = effectScope();
      const value = scope.run(() => useColorScheme(theme, "light").value)!;
      scope.stop();
      expect(value).toBe("light");
    });

    it("uses default dark if OS is not useable", () => {
      const scope = effectScope();
      const value = scope.run(() => useColorScheme(theme, "dark").value)!;
      scope.stop();
      expect(value).toBe("dark");
    });
  });

  describe("useScale", () => {
    it("uses medium scale when any-pointer:fine is matched", () => {
      mockMatchMedia(new Set([mediaQueryFinePointer]));
      const scope = effectScope();
      const value = scope.run(() => useScale(theme).value)!;
      scope.stop();
      expect(value).toBe("medium");
    });

    it("falls back to large when medium scale is unavailable", () => {
      mockMatchMedia(new Set([mediaQueryFinePointer]));
      const largeOnlyTheme: Theme = { global: {}, light: {}, dark: {}, large: {} };
      const scope = effectScope();
      const value = scope.run(() => useScale(largeOnlyTheme).value)!;
      scope.stop();
      expect(value).toBe("large");
    });
  });
});
