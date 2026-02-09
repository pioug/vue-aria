import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classNames,
  keepSpectrumClassNames,
} from "../src";
import { __resetSpectrumClassNamesForTest } from "../src/classNames";

afterEach(() => {
  __resetSpectrumClassNamesForTest();
});

describe("classNames", () => {
  it("joins strings, arrays, and conditional objects", () => {
    expect(classNames("one", ["two", { three: true, four: false }], null)).toBe(
      "one two three"
    );
  });

  it("returns an empty string for falsey-only input", () => {
    expect(classNames(undefined, false, null, "")).toBe("");
  });

  it("maps string keys through a css module map", () => {
    const cssModule = {
      root: "mapped-root",
      active: "mapped-active",
    };

    expect(classNames(cssModule, "root", "active", "external")).toBe(
      "mapped-root mapped-active external"
    );
  });

  it("maps object keys through a css module map", () => {
    const cssModule = {
      root: "mapped-root",
      active: "mapped-active",
    };

    expect(
      classNames(cssModule, {
        root: true,
        active: false,
        external: true,
      })
    ).toBe("mapped-root external");
  });

  it("can keep original class names for compatibility mode", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const cssModule = {
      root: "mapped-root",
    };

    keepSpectrumClassNames();

    expect(classNames(cssModule, "root")).toBe("mapped-root root");
    expect(
      classNames(cssModule, {
        root: true,
      })
    ).toBe("mapped-root root");
    expect(consoleWarn).toHaveBeenCalledTimes(1);

    consoleWarn.mockRestore();
  });
});
