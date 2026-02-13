import { describe, expect, it, vi } from "vitest";
import { mergeProps } from "../src/mergeProps";

describe("mergeProps", () => {
  it("chains event handlers in order", () => {
    const first = vi.fn();
    const second = vi.fn();
    const merged = mergeProps(
      { onClick: first, "aria-label": "a" },
      { onClick: second }
    );

    expect(typeof merged.onClick).toBe("function");
    (merged.onClick as (event?: unknown) => void)();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first.mock.invocationCallOrder[0]).toBeLessThan(
      second.mock.invocationCallOrder[0]
    );
  });

  it("merges class values", () => {
    const merged = mergeProps(
      { class: "base" },
      { class: "active" }
    ) as unknown as { class: unknown[] };

    expect(merged.class).toEqual(["base", "active"]);
  });

  it("merges UNSAFE_className values", () => {
    const merged = mergeProps(
      { UNSAFE_className: "base" },
      { UNSAFE_className: "active" }
    ) as { UNSAFE_className: string };

    expect(merged.UNSAFE_className).toBe("base active");
  });

  it("merges style objects", () => {
    const merged = mergeProps(
      { style: { color: "red", opacity: 0.8 } },
      { style: { opacity: 1 } }
    ) as { style: Record<string, unknown> };

    expect(merged.style).toEqual({ color: "red", opacity: 1 });
  });

  it("merges UNSAFE_style objects", () => {
    const merged = mergeProps(
      { UNSAFE_style: { color: "red", opacity: 0.8 } },
      { UNSAFE_style: { opacity: 1 } }
    ) as { UNSAFE_style: Record<string, unknown> };

    expect(merged.UNSAFE_style).toEqual({ color: "red", opacity: 1 });
  });

  it("ignores undefined values from later props", () => {
    const merged = mergeProps(
      { id: "first" },
      { id: undefined }
    ) as { id: string };

    expect(merged.id).toBe("first");
  });
});
