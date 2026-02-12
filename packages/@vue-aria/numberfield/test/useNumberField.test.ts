import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useNumberField } from "../src/useNumberField";

interface NumberFieldHandlers {
  onChange?: (event: Event) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onWheel?: (event: WheelEvent) => void;
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
  onPressStart?: (event: {
    type: "press";
    pointerType: "mouse" | "touch" | "pen" | "keyboard" | "virtual";
    target: EventTarget | null;
    originalEvent: Event;
  }) => void;
  onPressEnd?: (event: {
    type: "press";
    pointerType: "mouse" | "touch" | "pen" | "keyboard" | "virtual";
    target: EventTarget | null;
    originalEvent: Event;
  }) => void;
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

    incrementHandlers.onPressStart?.({
      type: "press",
      pointerType: "mouse",
      target: null,
      originalEvent: new Event("mousedown"),
    });
    expect(onIncrement).toHaveBeenCalledWith(4);
    expect(inputProps.value.value).toBe("4");

    decrementHandlers.onPressStart?.({
      type: "press",
      pointerType: "mouse",
      target: null,
      originalEvent: new Event("mousedown"),
    });
    expect(onDecrement).toHaveBeenCalledWith(2);
    expect(inputProps.value.value).toBe("2");
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

    handlers.onPressStart?.({
      type: "press",
      pointerType: "mouse",
      target: null,
      originalEvent: new Event("mousedown"),
    });
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("applies upstream-style platform inputMode behavior", () => {
    const platformSpy = vi
      .spyOn(window.navigator, "platform", "get")
      .mockReturnValue("iPhone");
    const uaSpy = vi
      .spyOn(window.navigator, "userAgent", "get")
      .mockReturnValue("AppleWebKit");

    expect(
      useNumberField({ "aria-label": "mandatory label" }).inputProps.value.inputMode
    ).toBe("text");
    expect(
      useNumberField({ "aria-label": "mandatory label", minValue: 0 }).inputProps.value
        .inputMode
    ).toBe("decimal");
    expect(
      useNumberField({
        "aria-label": "mandatory label",
        minValue: 0,
        formatOptions: { maximumFractionDigits: 0 },
      }).inputProps.value.inputMode
    ).toBe("numeric");

    platformSpy.mockRestore();
    uaSpy.mockRestore();

    const androidPlatformSpy = vi
      .spyOn(window.navigator, "platform", "get")
      .mockReturnValue("Linux");
    const androidUaSpy = vi
      .spyOn(window.navigator, "userAgent", "get")
      .mockReturnValue("Android");

    expect(
      useNumberField({ "aria-label": "mandatory label", minValue: 0 }).inputProps.value
        .inputMode
    ).toBe("decimal");

    androidPlatformSpy.mockRestore();
    androidUaSpy.mockRestore();
  });

  it("supports focused wheel stepping and ignores zoom/horizontal wheel gestures", () => {
    const onChange = vi.fn();
    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      defaultValue: 0,
      onChange,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onWheel?.({ deltaX: 0, deltaY: 10, ctrlKey: false } as WheelEvent);
    expect(onChange).not.toHaveBeenCalled();

    handlers.onFocus?.({} as FocusEvent);
    handlers.onWheel?.({ deltaX: 20, deltaY: 10, ctrlKey: false } as WheelEvent);
    expect(onChange).not.toHaveBeenCalled();

    handlers.onWheel?.({ deltaX: 0, deltaY: 10, ctrlKey: true } as WheelEvent);
    expect(onChange).not.toHaveBeenCalled();

    handlers.onWheel?.({ deltaX: 0, deltaY: 10, ctrlKey: false } as WheelEvent);
    expect(onChange).toHaveBeenLastCalledWith(1);

    handlers.onBlur?.({} as FocusEvent);
    const callCountAfterBlur = onChange.mock.calls.length;
    handlers.onWheel?.({ deltaX: 0, deltaY: 10, ctrlKey: false } as WheelEvent);
    expect(onChange).toHaveBeenCalledTimes(callCountAfterBlur);
  });

  it("disables wheel stepping when isWheelDisabled is true", () => {
    const onChange = vi.fn();
    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      defaultValue: 0,
      isWheelDisabled: true,
      onChange,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onFocus?.({} as FocusEvent);
    handlers.onWheel?.({ deltaX: 0, deltaY: 10, ctrlKey: false } as WheelEvent);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("resets controlled value to the initial value on form reset", () => {
    const form = document.createElement("form");
    const inputElement = document.createElement("input");
    form.appendChild(inputElement);
    document.body.appendChild(form);

    const value = ref(10);
    const onChange = vi.fn((next: number | undefined) => {
      value.value = next ?? 0;
    });

    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      value,
      onChange,
      inputRef: inputElement,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onChange?.({ target: { value: "100" } } as unknown as Event);
    handlers.onBlur?.({} as FocusEvent);

    expect(value.value).toBe(100);

    form.dispatchEvent(new Event("reset"));

    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(value.value).toBe(10);
    document.body.removeChild(form);
  });

  it("resets uncontrolled value to defaultValue on form reset", () => {
    const form = document.createElement("form");
    const inputElement = document.createElement("input");
    form.appendChild(inputElement);
    document.body.appendChild(form);

    const { inputProps } = useNumberField({
      "aria-label": "mandatory label",
      defaultValue: 10,
      inputRef: inputElement,
    });
    const handlers = inputProps.value as NumberFieldHandlers;

    handlers.onChange?.({ target: { value: "100" } } as unknown as Event);
    handlers.onBlur?.({} as FocusEvent);
    expect(inputProps.value.value).toBe("100");

    form.dispatchEvent(new Event("reset"));
    expect(inputProps.value.value).toBe("10");
    document.body.removeChild(form);
  });
});
