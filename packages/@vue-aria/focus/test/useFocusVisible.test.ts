import { describe, expect, it } from "vitest";
import { useFocusVisible } from "../src/useFocusVisible";

describe("useFocusVisible", () => {
  it("is true by default", () => {
    const isFocusVisible = useFocusVisible();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(isFocusVisible.value).toBe(true);
  });

  it("turns false on pointer modality", () => {
    const isFocusVisible = useFocusVisible();

    window.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" })
    );
    expect(isFocusVisible.value).toBe(false);
  });

  it("turns true on keyboard modality", () => {
    const isFocusVisible = useFocusVisible();

    window.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(isFocusVisible.value).toBe(false);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(isFocusVisible.value).toBe(true);
  });

  it("ignores modifier-only keyboard events", () => {
    const isFocusVisible = useFocusVisible();

    window.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(isFocusVisible.value).toBe(false);

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", altKey: true, bubbles: true })
    );
    expect(isFocusVisible.value).toBe(false);
  });
});
