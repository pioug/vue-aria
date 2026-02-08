import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useRadioGroup, type UseRadioGroupState } from "../src/useRadioGroup";
import { useRadio } from "../src/useRadio";

interface RadioInputHandlers {
  onChange?: (event: Event) => void;
}

interface RadioLabelHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

interface RadioGroupStateOptions {
  selectedValue?: string | null;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  onChange?: (value: string | null) => void;
}

function createPointerEvent(type: string): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
  });
}

function createRadioGroupState(
  options: RadioGroupStateOptions = {}
): UseRadioGroupState & { selectedValueRef: ReturnType<typeof ref<string | null>> } {
  const selectedValue = ref<string | null>(options.selectedValue ?? null);
  const lastFocusedValue = ref<string | null>(null);
  const isDisabled = ref(Boolean(options.isDisabled));
  const isReadOnly = ref(Boolean(options.isReadOnly));
  const isRequired = ref(Boolean(options.isRequired));
  const explicitInvalid = ref(Boolean(options.isInvalid));
  const validationState = ref<"valid" | "invalid" | undefined>(
    options.validationState
  );

  return {
    selectedValue,
    selectedValueRef: selectedValue,
    setSelectedValue: (value) => {
      if (isDisabled.value || isReadOnly.value) {
        return;
      }
      selectedValue.value = value;
      options.onChange?.(value);
    },
    lastFocusedValue,
    setLastFocusedValue: (value) => {
      lastFocusedValue.value = value;
    },
    isDisabled,
    isReadOnly,
    isRequired,
    validationState,
    isInvalid: computed(
      () =>
        explicitInvalid.value ||
        validationState.value === "invalid" ||
        (isRequired.value && selectedValue.value == null)
    ),
  };
}

describe("useRadio", () => {
  it("returns selection and tabIndex semantics for group radios", () => {
    const state = createRadioGroupState({ selectedValue: "dogs" });
    useRadioGroup({ label: "Favorite Pet" }, state);
    const dogs = useRadio({ value: "dogs" }, state);
    const cats = useRadio({ value: "cats" }, state);

    expect(dogs.inputProps.value.checked).toBe(true);
    expect(cats.inputProps.value.checked).toBe(false);
    expect(dogs.inputProps.value.name).toBeDefined();
    expect(cats.inputProps.value.name).toBe(dogs.inputProps.value.name);
    expect(dogs.inputProps.value.tabIndex).toBe(0);
    expect(cats.inputProps.value.tabIndex).toBe(-1);
  });

  it("updates selection via input change", () => {
    const groupOnChange = vi.fn();
    const itemOnChange = vi.fn();
    const state = createRadioGroupState({ onChange: groupOnChange });
    useRadioGroup({ label: "Favorite Pet" }, state);
    const cats = useRadio(
      {
        value: "cats",
        onChange: itemOnChange,
      },
      state
    );

    const handlers = cats.inputProps.value as RadioInputHandlers;
    const stopPropagation = vi.fn();
    handlers.onChange?.({
      stopPropagation,
      target: { checked: true },
    } as unknown as Event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(state.selectedValueRef.value).toBe("cats");
    expect(cats.inputProps.value.checked).toBe(true);
    expect(groupOnChange).toHaveBeenCalledWith("cats");
    expect(itemOnChange).toHaveBeenCalledWith(true);
  });

  it("does not update when disabled or readonly", () => {
    const disabledState = createRadioGroupState({ isDisabled: true });
    useRadioGroup(
      {
        label: "Favorite Pet",
        isDisabled: true,
      },
      disabledState
    );
    const disabledRadio = useRadio({ value: "dogs" }, disabledState);
    const disabledHandlers = disabledRadio.inputProps.value as RadioInputHandlers;
    disabledHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(disabledState.selectedValueRef.value).toBeNull();
    expect(disabledRadio.inputProps.value.disabled).toBe(true);
    expect(disabledRadio.inputProps.value.tabIndex).toBeUndefined();

    const readOnlyState = createRadioGroupState({ isReadOnly: true });
    useRadioGroup({ label: "Favorite Pet", isReadOnly: true }, readOnlyState);
    const readOnlyRadio = useRadio({ value: "dogs" }, readOnlyState);
    const readOnlyHandlers = readOnlyRadio.inputProps.value as RadioInputHandlers;
    readOnlyHandlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    expect(readOnlyState.selectedValueRef.value).toBeNull();
  });

  it("handles label press and focuses input", () => {
    const state = createRadioGroupState();
    useRadioGroup({ label: "Favorite Pet" }, state);
    const focus = vi.fn();
    const inputRef = { focus } as unknown as HTMLInputElement;
    const dogs = useRadio({ value: "dogs" }, state, inputRef);
    const labelHandlers = dogs.labelProps.value as RadioLabelHandlers;

    labelHandlers.onPointerdown?.(createPointerEvent("pointerdown"));
    labelHandlers.onPointerup?.(createPointerEvent("pointerup"));

    expect(state.selectedValueRef.value).toBe("dogs");
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("composes aria-describedby with group description and error ids", () => {
    const state = createRadioGroupState({ isRequired: true });
    const group = useRadioGroup(
      {
        label: "Favorite Pet",
        description: "Pick one option",
        errorMessage: "Selection required",
      },
      state
    );
    const dogs = useRadio(
      {
        value: "dogs",
        "aria-describedby": "external-help",
      },
      state
    );

    const describedBy = dogs.inputProps.value["aria-describedby"] as string;
    expect(describedBy).toContain("external-help");
    expect(describedBy).toContain(group.descriptionProps.value.id as string);
    expect(describedBy).toContain(group.errorMessageProps.value.id as string);
  });

  it("sets native required when validationBehavior is native", () => {
    const state = createRadioGroupState({ isRequired: true });
    useRadioGroup(
      {
        label: "Favorite Pet",
        validationBehavior: "native",
      },
      state
    );
    const dogs = useRadio({ value: "dogs" }, state);

    expect(dogs.inputProps.value.required).toBe(true);
  });
});
