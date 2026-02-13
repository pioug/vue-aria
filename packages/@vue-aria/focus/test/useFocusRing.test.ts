import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useFocusRing } from "../src/useFocusRing";

describe("useFocusRing", () => {
  it("tracks focused and focus-visible state", () => {
    const scope = effectScope();
    const result = scope.run(() => useFocusRing())!;

    const el = document.createElement("button");
    const onFocus = result.focusProps.onFocus as (event: FocusEvent) => void;
    const onBlur = result.focusProps.onBlur as (event: FocusEvent) => void;

    const focusEvent = new FocusEvent("focus", { bubbles: true });
    Object.defineProperty(focusEvent, "target", { value: el });
    Object.defineProperty(focusEvent, "currentTarget", { value: el });
    onFocus(focusEvent);

    expect(result.isFocused).toBe(true);
    expect(result.isFocusVisible).toBe(true);

    const blurEvent = new FocusEvent("blur", { bubbles: true, relatedTarget: null });
    Object.defineProperty(blurEvent, "target", { value: el });
    Object.defineProperty(blurEvent, "currentTarget", { value: el });
    onBlur(blurEvent);

    expect(result.isFocused).toBe(false);
    expect(result.isFocusVisible).toBe(false);

    scope.stop();
  });

  it("uses focus-within handlers when within is true", () => {
    const scope = effectScope();
    const result = scope.run(() => useFocusRing({ within: true }))!;

    const onFocus = result.focusProps.onFocus as ((event: FocusEvent) => void) | undefined;
    const onBlur = result.focusProps.onBlur as ((event: FocusEvent) => void) | undefined;

    expect(typeof onFocus).toBe("function");
    expect(typeof onBlur).toBe("function");

    scope.stop();
  });
});
