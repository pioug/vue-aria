import { describe, expect, it, vi } from "vitest";
import { useNumberField } from "../src/useNumberField";

interface NumberFieldHandlers {
  onChange?: (event: Event) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onCopy?: (event: ClipboardEvent) => void;
  onCut?: (event: ClipboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onCompositionStart?: (event: CompositionEvent) => void;
  onCompositionEnd?: (event: CompositionEvent) => void;
  onCompositionUpdate?: (event: CompositionEvent) => void;
  onSelect?: (event: Event) => void;
  onBeforeInput?: (event: InputEvent) => void;
  onInput?: (event: Event) => void;
}

interface StepperHandlers {
  onPress?: () => void;
  onPressStart?: () => void;
}

describe("useNumberField", () => {
  it("returns default number field input props", () => {
    const { inputProps } = useNumberField({ "aria-label": "mandatory label" });

    expect(inputProps.value.type).toBe("text");
    expect(inputProps.value.disabled).toBe(false);
    expect(inputProps.value.readOnly).toBe(false);
    expect(inputProps.value["aria-invalid"]).toBeUndefined();
    expect(inputProps.value["aria-required"]).toBeUndefined();
    expect(inputProps.value["aria-valuenow"]).toBeNull();
    expect(inputProps.value["aria-valuetext"]).toBeNull();
    expect(inputProps.value["aria-valuemin"]).toBeNull();
    expect(inputProps.value["aria-valuemax"]).toBeNull();
    expect(typeof inputProps.value.onChange).toBe("function");
    expect(inputProps.value.autoFocus).toBe(false);
  });

  it("forwards placeholder prop", () => {
    const { inputProps } = useNumberField({
      placeholder: "Enter value",
      "aria-label": "mandatory label",
    });
    expect(inputProps.value.placeholder).toBe("Enter value");
  });

  it("forwards clipboard and composition events", () => {
    const onCopy = vi.fn();
    const onCut = vi.fn();
    const onPaste = vi.fn();
    const onCompositionStart = vi.fn();
    const onCompositionEnd = vi.fn();
    const onCompositionUpdate = vi.fn();
    const onSelect = vi.fn();
    const onBeforeInput = vi.fn();
    const onInput = vi.fn();
    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      onCopy,
      onCut,
      onPaste,
      onCompositionStart,
      onCompositionEnd,
      onCompositionUpdate,
      onSelect,
      onBeforeInput,
      onInput,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onCopy?.({} as ClipboardEvent);
    handlers.onCut?.({} as ClipboardEvent);
    handlers.onPaste?.({} as ClipboardEvent);
    handlers.onCompositionStart?.({} as CompositionEvent);
    handlers.onCompositionEnd?.({} as CompositionEvent);
    handlers.onCompositionUpdate?.({} as CompositionEvent);
    handlers.onSelect?.({} as Event);
    handlers.onBeforeInput?.({} as InputEvent);
    handlers.onInput?.({ target: { value: "12" } } as unknown as Event);

    expect(onCopy).toHaveBeenCalled();
    expect(onCut).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalled();
    expect(onCompositionStart).toHaveBeenCalled();
    expect(onCompositionEnd).toHaveBeenCalled();
    expect(onCompositionUpdate).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
    expect(onBeforeInput).toHaveBeenCalled();
    expect(onInput).toHaveBeenCalled();
  });

  it("increments and decrements through button props", () => {
    const onChange = vi.fn();
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    const { inputProps, incrementButtonProps, decrementButtonProps } = useNumberField({
      "aria-label": "mandatory label",
      defaultValue: 1,
      step: 2,
      onChange,
      onIncrement,
      onDecrement,
    });
    const incrementHandlers = incrementButtonProps.value as StepperHandlers;
    const decrementHandlers = decrementButtonProps.value as StepperHandlers;

    incrementHandlers.onPress?.();
    expect(onIncrement).toHaveBeenCalledWith(3);
    expect(inputProps.value.value).toBe("3");

    decrementHandlers.onPress?.();
    expect(onDecrement).toHaveBeenCalledWith(1);
    expect(inputProps.value.value).toBe("1");
    expect(onChange).toHaveBeenCalled();
  });

  it("commits and clamps value on Enter", () => {
    const onChange = vi.fn();
    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      maxValue: 10,
      onChange,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onChange?.({ target: { value: "20" } } as unknown as Event);
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    handlers.onKeydown?.(enterEvent);

    expect(enterEvent.defaultPrevented).toBe(true);
    expect(inputProps.value.value).toBe("10");
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("focuses input on stepper press start when ref is provided", () => {
    const focus = vi.fn();
    const inputRef = { focus } as unknown as HTMLInputElement;
    const { incrementButtonProps } = useNumberField({
      "aria-label": "mandatory label",
      inputRef,
    });
    const handlers = incrementButtonProps.value as StepperHandlers;

    handlers.onPressStart?.();
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
