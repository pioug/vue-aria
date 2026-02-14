import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classNames,
  keepSpectrumClassNames,
  shouldKeepSpectrumClassNames,
  UNSAFE_resetSpectrumClassNames,
} from "../src/classNames";

describe("classNames", () => {
  afterEach(() => {
    UNSAFE_resetSpectrumClassNames();
    vi.restoreAllMocks();
  });

  it("maps css-module keys and preserves unknown keys", () => {
    const result = classNames(
      { foo: "_foo", bar: "_bar" },
      "foo",
      { bar: true, baz: true }
    );

    expect(result).toBe("_foo _bar baz");
  });

  it("keeps spectrum class names when compatibility mode is enabled", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    keepSpectrumClassNames();

    expect(shouldKeepSpectrumClassNames).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(classNames({ foo: "_foo" }, "foo")).toBe("_foo foo");
  });
});
