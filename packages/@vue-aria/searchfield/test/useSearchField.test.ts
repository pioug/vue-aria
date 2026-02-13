import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSearchField } from "../src";

describe("useSearchField hook", () => {
  const renderSearchHook = (props: Record<string, unknown> = {}, stateOverrides: Record<string, unknown> = {}) => {
    const state = {
      value: "",
      setValue: vi.fn(),
      ...stateOverrides,
    } as any;
    const ref = { current: document.createElement("input") };
    const focus = vi.spyOn(ref.current, "focus");
    const scope = effectScope();
    const result = scope.run(() =>
      useSearchField({ ...props, "aria-label": "testLabel" }, state, ref)
    )!;

    return { result, state, ref, focus, stop: () => scope.stop() };
  };

  it("returns base input props with state value", () => {
    const { result, state, stop } = renderSearchHook();
    expect(result.inputProps.type).toBe("search");
    expect(result.inputProps.value).toBe(state.value);
    expect(typeof result.inputProps.onKeydown).toBe("function");
    stop();
  });

  it("handles Enter submit behavior", () => {
    const onSubmit = vi.fn();
    const { result, stop } = renderSearchHook({ onSubmit });
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    (result.inputProps.onKeydown as (event: KeyboardEvent) => void)({
      key: "Enter",
      preventDefault,
      stopPropagation,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    stop();
  });

  it("handles Escape clear behavior", () => {
    const onClear = vi.fn();
    const { result, state, stop } = renderSearchHook({ onClear }, { value: "search" });
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    (result.inputProps.onKeydown as (event: KeyboardEvent) => void)({
      key: "Escape",
      preventDefault,
      stopPropagation,
    } as unknown as KeyboardEvent);

    expect(state.setValue).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    stop();
  });

  it("does not define defaultValue in inputProps", () => {
    const { result, stop } = renderSearchHook({ defaultValue: "ABC" });
    expect(result.inputProps.defaultValue).toBeUndefined();
    stop();
  });

  it("returns clearButtonProps with a11y defaults and clear behavior", () => {
    const onClear = vi.fn();
    const { result, state, focus, stop } = renderSearchHook({ onClear });

    expect(result.clearButtonProps["aria-label"]).toBe("Clear search");
    expect(result.clearButtonProps.excludeFromTabOrder).toBe(true);
    expect(result.clearButtonProps.preventFocusOnPress).toBe(true);

    (result.clearButtonProps.onPressStart as () => void)();
    (result.clearButtonProps.onPress as () => void)();

    expect(state.setValue).toHaveBeenCalledWith("");
    expect(focus).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    stop();
  });
});
