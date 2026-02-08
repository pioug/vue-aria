import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useFocusRing } from "../src/useFocusRing";

type FocusHandler = (event: FocusEvent) => void;

describe("useFocusRing", () => {
  it("sets focus state on focus and clears on blur", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { focusProps, isFocused, isFocusVisible } = useFocusRing({
      onFocus,
      onBlur,
    });

    const focusHandler = focusProps.onFocus as FocusHandler;
    const blurHandler = focusProps.onBlur as FocusHandler;

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    focusHandler(new FocusEvent("focus"));
    expect(isFocused.value).toBe(true);
    expect(isFocusVisible.value).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);

    blurHandler(new FocusEvent("blur"));
    expect(isFocused.value).toBe(false);
    expect(isFocusVisible.value).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("reflects pointer modality during focus", () => {
    const { focusProps, isFocusVisible } = useFocusRing();

    window.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    const focusHandler = focusProps.onFocus as FocusHandler;
    focusHandler(new FocusEvent("focus"));

    expect(isFocusVisible.value).toBe(false);
  });

  it("updates visibility when modality changes while focused", async () => {
    const { focusProps, isFocusVisible } = useFocusRing();
    const focusHandler = focusProps.onFocus as FocusHandler;
    const blurHandler = focusProps.onBlur as FocusHandler;

    window.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    focusHandler(new FocusEvent("focus"));
    expect(isFocusVisible.value).toBe(false);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await nextTick();
    expect(isFocusVisible.value).toBe(true);

    blurHandler(new FocusEvent("blur"));
  });
});
