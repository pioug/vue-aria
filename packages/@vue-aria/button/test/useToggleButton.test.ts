import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useToggleButton } from "../src/useToggleButton";

interface ButtonHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

function createPointerEvent(type: string): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
  });
}

describe("useToggleButton", () => {
  it("adds aria-pressed and toggles selection on press", () => {
    const isSelected = ref(false);
    const toggle = vi.fn(() => {
      isSelected.value = !isSelected.value;
    });
    const onPress = vi.fn();
    const { buttonProps } = useToggleButton(
      {
        elementType: "div",
        onPress,
      },
      {
        isSelected,
        toggle,
      }
    );
    const handlers = buttonProps.value as ButtonHandlers;

    expect(buttonProps.value["aria-pressed"]).toBe(false);

    handlers.onPointerdown?.(createPointerEvent("pointerdown"));
    handlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(buttonProps.value["aria-pressed"]).toBe(true);
  });

  it("does not toggle when disabled", () => {
    const isSelected = ref(false);
    const toggle = vi.fn(() => {
      isSelected.value = !isSelected.value;
    });
    const { buttonProps, isDisabled } = useToggleButton(
      {
        elementType: "div",
        isDisabled: true,
      },
      {
        isSelected,
        toggle,
      }
    );
    const handlers = buttonProps.value as ButtonHandlers;

    handlers.onPointerdown?.(createPointerEvent("pointerdown"));
    handlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(toggle).not.toHaveBeenCalled();
    expect(isDisabled.value).toBe(true);
    expect(buttonProps.value["aria-disabled"]).toBe(true);
    expect(buttonProps.value["aria-pressed"]).toBe(false);
  });

  it("preserves native button defaults", () => {
    const isSelected = ref(true);
    const { buttonProps } = useToggleButton(
      {},
      {
        isSelected,
        toggle: () => {
          isSelected.value = !isSelected.value;
        },
      }
    );

    expect(buttonProps.value.type).toBe("button");
    expect(buttonProps.value["aria-pressed"]).toBe(true);
    expect(buttonProps.value.disabled).toBe(false);
  });
});
