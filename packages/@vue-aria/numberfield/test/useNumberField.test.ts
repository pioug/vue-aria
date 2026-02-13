import { effectScope, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNumberField } from "../src";
import * as liveAnnouncer from "@vue-aria/live-announcer";

function createState() {
  return {
    increment: vi.fn(),
    incrementToMax: vi.fn(),
    decrement: vi.fn(),
    decrementToMin: vi.fn(),
    numberValue: 2,
    inputValue: "2",
    commit: vi.fn(),
    commitValidation: vi.fn(),
    validate: vi.fn(() => true),
    setInputValue: vi.fn(),
    defaultNumberValue: 2,
    setNumberValue: vi.fn(),
    canIncrement: true,
    canDecrement: true,
    minValue: 0,
    displayValidation: {
      isInvalid: false,
      validationErrors: [] as string[],
      validationDetails: null,
    },
    realtimeValidation: {
      isInvalid: false,
      validationErrors: [] as string[],
      validationDetails: null,
    },
    updateValidation: vi.fn(),
    resetValidation: vi.fn(),
  };
}

describe("useNumberField hook", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns default input props", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() => useNumberField({}, state as any, ref))!;

    expect(result.inputProps.type).toBe("text");
    expect(result.inputProps.disabled).toBeFalsy();
    expect(result.inputProps.readOnly).toBeFalsy();
    expect(result.inputProps["aria-invalid"]).toBeUndefined();
    expect(result.inputProps["aria-valuenow"]).toBeNull();
    expect(result.inputProps["aria-valuetext"]).toBeNull();
    expect(result.inputProps["aria-valuemin"]).toBeNull();
    expect(result.inputProps["aria-valuemax"]).toBeNull();
    expect(typeof result.inputProps.onChange).toBe("function");
    expect(result.inputProps.autoFocus).toBeFalsy();
    scope.stop();
  });

  it("forwards placeholder when defined", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ placeholder: "Enter value", "aria-label": "mandatory label" }, state as any, ref)
    )!;

    expect(result.inputProps.placeholder).toBe("Enter value");
    scope.stop();
  });

  it("merges events into input props", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const onCopy = vi.fn();
    const onCut = vi.fn();
    const onPaste = vi.fn();
    const onCompositionStart = vi.fn();
    const onCompositionEnd = vi.fn();
    const onCompositionUpdate = vi.fn();
    const onSelect = vi.fn();
    const onBeforeInput = vi.fn();
    const onInput = vi.fn();

    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField(
        {
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
        },
        state as any,
        ref
      )
    )!;

    (result.inputProps.onCopy as (event: ClipboardEvent) => void)?.({} as ClipboardEvent);
    (result.inputProps.onCut as (event: ClipboardEvent) => void)?.({} as ClipboardEvent);
    (result.inputProps.onPaste as (event: ClipboardEvent) => void)?.({
      target: { value: "", selectionStart: 0, selectionEnd: 0 },
      clipboardData: { getData: () => "4" },
      preventDefault: vi.fn(),
    } as unknown as ClipboardEvent);
    (result.inputProps.onCompositionStart as (event: CompositionEvent) => void)?.(
      {} as CompositionEvent
    );
    (result.inputProps.onCompositionEnd as (event: CompositionEvent) => void)?.(
      {} as CompositionEvent
    );
    (result.inputProps.onCompositionUpdate as (event: CompositionEvent) => void)?.(
      {} as CompositionEvent
    );
    (result.inputProps.onSelect as (event: Event) => void)?.({} as Event);
    (result.inputProps.onBeforeInput as (event: InputEvent) => void)?.({
      preventDefault: vi.fn(),
      target: {
        value: "",
        selectionStart: 0,
        selectionEnd: 0,
      },
      data: "",
    } as unknown as InputEvent);
    (result.inputProps.onInput as (event: InputEvent) => void)?.({} as InputEvent);

    expect(onCopy).toHaveBeenCalled();
    expect(onCut).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalled();
    expect(onCompositionStart).toHaveBeenCalled();
    expect(onCompositionEnd).toHaveBeenCalled();
    expect(onCompositionUpdate).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
    expect(onBeforeInput).toHaveBeenCalled();
    expect(onInput).toHaveBeenCalled();
    scope.stop();
  });

  it("moves focus to input on mouse press start for stepper buttons", () => {
    const state = createState();
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    document.body.appendChild(input);
    const target = document.createElement("button");
    document.body.appendChild(target);

    const scope = effectScope();
    const result = scope.run(() => useNumberField({ "aria-label": "count" }, state as any, ref))!;

    const focusSpy = vi.spyOn(input, "focus");
    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target,
    });

    expect(focusSpy).toHaveBeenCalled();
    scope.stop();
    input.remove();
    target.remove();
  });

  it("focuses touch target instead of input on touch press start", () => {
    const state = createState();
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const target = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(target);

    const scope = effectScope();
    const result = scope.run(() => useNumberField({ "aria-label": "count" }, state as any, ref))!;

    const inputFocusSpy = vi.spyOn(input, "focus");
    const targetFocusSpy = vi.spyOn(target, "focus");
    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "touch",
      target,
    });

    expect(inputFocusSpy).not.toHaveBeenCalled();
    expect(targetFocusSpy).toHaveBeenCalled();
    scope.stop();
    input.remove();
    target.remove();
  });

  it("does not move focus on press start when input is already focused", () => {
    const state = createState();
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const target = document.createElement("button");
    document.body.appendChild(input);
    document.body.appendChild(target);
    input.focus();

    const scope = effectScope();
    const result = scope.run(() => useNumberField({ "aria-label": "count" }, state as any, ref))!;

    const inputFocusSpy = vi.spyOn(input, "focus");
    const targetFocusSpy = vi.spyOn(target, "focus");
    (result.incrementButtonProps.onPressStart as (event: any) => void)({
      pointerType: "mouse",
      target,
    });

    expect(inputFocusSpy).not.toHaveBeenCalled();
    expect(targetFocusSpy).not.toHaveBeenCalled();
    scope.stop();
    input.remove();
    target.remove();
  });

  it("increments and decrements on wheel while focused within group", async () => {
    const state = createState();
    const input = document.createElement("input");
    const group = document.createElement("div");
    group.appendChild(input);
    document.body.appendChild(group);
    const ref = { current: input as HTMLInputElement | null };

    const scope = effectScope();
    const result = scope.run(() => useNumberField({ "aria-label": "count" }, state as any, ref))!;

    (result.groupProps.onFocusin as (event: FocusEvent) => void)?.({
      currentTarget: group,
      target: input,
      relatedTarget: null,
    } as unknown as FocusEvent);
    await nextTick();

    (result.inputProps.onWheel as (event: WheelEvent) => void)?.(
      new WheelEvent("wheel", { deltaY: 10, bubbles: true, cancelable: true })
    );
    (result.inputProps.onWheel as (event: WheelEvent) => void)?.(
      new WheelEvent("wheel", { deltaY: -10, bubbles: true, cancelable: true })
    );

    expect(state.increment).toHaveBeenCalledTimes(1);
    expect(state.decrement).toHaveBeenCalledTimes(1);

    scope.stop();
    group.remove();
  });

  it("uses native required semantics when validationBehavior is native", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", isRequired: true, validationBehavior: "native" },
        state as any,
        ref
      )
    )!;

    expect(result.inputProps.required).toBe(true);
    expect(result.inputProps["aria-required"]).toBeUndefined();
    scope.stop();
  });

  it("commits validation on native invalid events", () => {
    const state = createState();
    const input = document.createElement("input");
    input.required = true;
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    const focusSpy = vi.spyOn(input, "focus");

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("does not focus numberfield on invalid when another earlier form field is first invalid", () => {
    const state = createState();
    const precedingInput = document.createElement("input");
    precedingInput.required = true;
    const input = document.createElement("input");
    input.required = true;
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(precedingInput);
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    const focusSpy = vi.spyOn(input, "focus");

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("focuses numberfield on invalid when earlier siblings are disabled or non-validatable", () => {
    const state = createState();
    const disabledInput = document.createElement("input");
    disabledInput.required = true;
    disabledInput.disabled = true;
    const helperButton = document.createElement("button");
    const input = document.createElement("input");
    input.required = true;
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(disabledInput);
    form.appendChild(helperButton);
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    const focusSpy = vi.spyOn(input, "focus");

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("does not focus custom-invalid numberfield when an earlier required field is first invalid", async () => {
    const state = createState();
    state.realtimeValidation = {
      isInvalid: true,
      validationErrors: ["Invalid"],
      validationDetails: null,
    };

    const precedingInput = document.createElement("input");
    precedingInput.required = true;
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(precedingInput);
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    await nextTick();
    const focusSpy = vi.spyOn(input, "focus");

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("focuses custom-invalid numberfield when no earlier invalid field exists", async () => {
    const state = createState();
    state.realtimeValidation = {
      isInvalid: true,
      validationErrors: ["Invalid"],
      validationDetails: null,
    };

    const precedingInput = document.createElement("input");
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(precedingInput);
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    await nextTick();
    const focusSpy = vi.spyOn(input, "focus");

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("does not focus numberfield on invalid when event is already default prevented", () => {
    const state = createState();
    const input = document.createElement("input");
    input.required = true;
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;
    const focusSpy = vi.spyOn(input, "focus");
    const invalidEvent = new Event("invalid", { bubbles: true, cancelable: true });
    invalidEvent.preventDefault();

    input.dispatchEvent(invalidEvent);
    expect(state.commitValidation).toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("commits validation on native change events", () => {
    const state = createState();
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;

    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.commitValidation).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });

  it("resets state number value on parent form reset", async () => {
    const state = createState();
    state.defaultNumberValue = 7;
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;

    await nextTick();
    form.dispatchEvent(new Event("reset"));
    expect(state.setNumberValue).toHaveBeenCalledWith(7);

    scope.stop();
    form.remove();
  });

  it("resets validation state on parent form reset", async () => {
    const state = createState();
    const input = document.createElement("input");
    const ref = { current: input as HTMLInputElement | null };
    const form = document.createElement("form");
    form.appendChild(input);
    document.body.appendChild(form);

    const scope = effectScope();
    scope.run(() =>
      useNumberField(
        { "aria-label": "Quantity", validationBehavior: "native" },
        state as any,
        ref
      )
    )!;

    await nextTick();
    form.dispatchEvent(new Event("reset"));
    expect(state.resetValidation).toHaveBeenCalledTimes(1);

    scope.stop();
    form.remove();
  });

  it("commits and validates on Enter keydown when not composing", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    (result.inputProps.onKeyDown as (event: KeyboardEvent & { nativeEvent?: any }) => void)({
      key: "Enter",
      preventDefault: vi.fn(),
      nativeEvent: { isComposing: false },
    } as unknown as KeyboardEvent & { nativeEvent?: any });

    expect(state.commit).toHaveBeenCalledTimes(1);
    expect(state.commitValidation).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("does not commit on Enter keydown while composing", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    (result.inputProps.onKeyDown as (event: KeyboardEvent & { nativeEvent?: any }) => void)({
      key: "Enter",
      preventDefault: vi.fn(),
      nativeEvent: { isComposing: true },
    } as unknown as KeyboardEvent & { nativeEvent?: any });

    expect(state.commit).not.toHaveBeenCalled();
    expect(state.commitValidation).not.toHaveBeenCalled();
    scope.stop();
  });

  it("continues propagation for non-Enter keydown events", () => {
    const state = createState();
    const ref = { current: document.createElement("input") as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;
    const continuePropagation = vi.fn();

    (result.inputProps.onKeyDown as (event: KeyboardEvent & { continuePropagation?: () => void; nativeEvent?: any }) => void)({
      key: "ArrowUp",
      preventDefault: vi.fn(),
      continuePropagation,
      nativeEvent: { isComposing: false },
    } as unknown as KeyboardEvent & { continuePropagation?: () => void; nativeEvent?: any });

    expect(continuePropagation).toHaveBeenCalledTimes(1);
    expect(state.commit).not.toHaveBeenCalled();
    expect(state.commitValidation).not.toHaveBeenCalled();
    scope.stop();
  });

  it("announces normalized value on blur when commit changes the input value", () => {
    const state = createState();
    const input = document.createElement("input");
    input.value = "1";
    state.commit.mockImplementation(() => {
      input.value = "2";
    });
    const announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});

    const ref = { current: input as HTMLInputElement | null };
    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    (result.inputProps.onBlur as (event: FocusEvent) => void)?.(new FocusEvent("blur"));

    expect(state.commit).toHaveBeenCalled();
    expect(announceSpy).toHaveBeenCalledWith("2", "assertive");
    scope.stop();
  });

  it("does not announce on blur when commit does not change the input value", () => {
    const state = createState();
    const input = document.createElement("input");
    input.value = "4";
    state.commit.mockImplementation(() => {
      input.value = "4";
    });
    const announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});
    const ref = { current: input as HTMLInputElement | null };

    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity" }, state as any, ref)
    )!;

    (result.inputProps.onBlur as (event: FocusEvent) => void)?.(new FocusEvent("blur"));

    expect(announceSpy).not.toHaveBeenCalled();
    scope.stop();
  });

  it("calls user onBlur while still running commit/announce flow", () => {
    const state = createState();
    const onBlur = vi.fn();
    const input = document.createElement("input");
    input.value = "1";
    state.commit.mockImplementation(() => {
      input.value = "2";
    });
    const announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});
    const ref = { current: input as HTMLInputElement | null };

    const scope = effectScope();
    const result = scope.run(() =>
      useNumberField({ "aria-label": "Quantity", onBlur }, state as any, ref)
    )!;
    const event = new FocusEvent("blur");

    (result.inputProps.onBlur as (event: FocusEvent) => void)?.(event);

    expect(onBlur).toHaveBeenCalledWith(event);
    expect(state.commit).toHaveBeenCalled();
    expect(announceSpy).toHaveBeenCalledWith("2", "assertive");
    scope.stop();
  });
});
