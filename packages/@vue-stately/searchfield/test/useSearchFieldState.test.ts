import { describe, expect, it, vi } from "vitest";
import { useSearchFieldState } from "../src";

describe("useSearchFieldState", () => {
  it("handles defaults and updates", () => {
    const onChange = vi.fn();
    const state = useSearchFieldState({ onChange });

    expect(state.value).toBe("");
    state.setValue("hello");
    expect(state.value).toBe("hello");
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("coerces numeric values to strings", () => {
    const state = useSearchFieldState({ value: 10 });
    expect(state.value).toBe("10");
  });
});
