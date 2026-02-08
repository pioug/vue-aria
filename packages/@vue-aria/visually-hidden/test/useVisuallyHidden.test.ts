import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { useVisuallyHidden, visuallyHiddenStyles } from "../src/useVisuallyHidden";

interface FocusWithinHandlers {
  onFocusin?: (event: FocusEvent) => void;
  onFocusout?: (event: FocusEvent) => void;
}

function createFocusEvent(
  type: "focus" | "blur",
  target: EventTarget,
  currentTarget: EventTarget,
  relatedTarget: EventTarget | null = null
): FocusEvent {
  const event = new FocusEvent(type, { bubbles: true, relatedTarget });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  return event;
}

describe("useVisuallyHidden", () => {
  it("hides element by default", () => {
    const { visuallyHiddenProps } = useVisuallyHidden();
    expect(visuallyHiddenProps.value.style).toEqual(visuallyHiddenStyles);
  });

  it("merges provided style with hidden styles when not focused", () => {
    const { visuallyHiddenProps } = useVisuallyHidden({
      style: { color: "red" },
    });
    expect(visuallyHiddenProps.value.style).toMatchObject({
      ...visuallyHiddenStyles,
      color: "red",
    });
  });

  it("remains hidden on focus when not focusable", async () => {
    const { visuallyHiddenProps } = useVisuallyHidden({ isFocusable: false });
    const handlers = visuallyHiddenProps.value as FocusWithinHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onFocusin?.(createFocusEvent("focus", element, element));
    await nextTick();

    expect(visuallyHiddenProps.value.style).toEqual(visuallyHiddenStyles);
  });

  it("unhides while focused when focusable", async () => {
    const { visuallyHiddenProps } = useVisuallyHidden({
      isFocusable: true,
      style: { color: "blue" },
    });
    const handlers = visuallyHiddenProps.value as FocusWithinHandlers;
    const element = document.createElement("div");
    document.body.appendChild(element);

    handlers.onFocusin?.(createFocusEvent("focus", element, element));
    await nextTick();

    expect(visuallyHiddenProps.value.style).toEqual({ color: "blue" });

    handlers.onFocusout?.(createFocusEvent("blur", element, element));
    await nextTick();

    expect(visuallyHiddenProps.value.style).toMatchObject({
      ...visuallyHiddenStyles,
      color: "blue",
    });
  });
});
