import { effectScope, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useNumberField } from "../src";

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
      validationErrors: [],
      validationDetails: null,
    },
  };
}

describe("useNumberField hook", () => {
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

    input.dispatchEvent(new Event("invalid", { bubbles: true, cancelable: true }));
    expect(state.commitValidation).toHaveBeenCalled();

    scope.stop();
    form.remove();
  });
});
