import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  useCheckboxGroup,
  useCheckboxGroupItem,
  type UseCheckboxGroupOptions,
  type UseCheckboxGroupState,
  type UseCheckboxGroupItemResult,
} from "../src";

interface CheckboxInputHandlers {
  onChange?: (event: Event) => void;
}

interface CheckboxLabelHandlers {
  onPointerdown?: (event: PointerEvent) => void;
  onPointerup?: (event: PointerEvent) => void;
}

interface CheckboxGroupStateOptions {
  value?: readonly string[];
  defaultValue?: readonly string[];
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationState?: "valid" | "invalid";
  onChange?: (value: readonly string[]) => void;
}

function createPointerEvent(type: string): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
  });
}

function pressCheckboxLabel(item: UseCheckboxGroupItemResult): void {
  const handlers = item.labelProps.value as CheckboxLabelHandlers;
  handlers.onPointerdown?.(createPointerEvent("pointerdown"));
  handlers.onPointerup?.(createPointerEvent("pointerup"));
}

function createCheckboxGroupState(
  options: CheckboxGroupStateOptions = {}
): UseCheckboxGroupState {
  const selectedValues = ref<string[]>([
    ...(options.value ?? options.defaultValue ?? []),
  ]);
  const isDisabled = ref(Boolean(options.isDisabled));
  const isReadOnly = ref(Boolean(options.isReadOnly));
  const isRequired = ref(Boolean(options.isRequired));
  const explicitInvalid = ref(Boolean(options.isInvalid));
  const validationState = ref<"valid" | "invalid" | undefined>(
    options.validationState
  );

  const updateValue = (nextValue: string[]) => {
    if (isDisabled.value || isReadOnly.value) {
      return;
    }

    selectedValues.value = nextValue;
    options.onChange?.(nextValue);
  };

  return {
    value: selectedValues,
    isDisabled,
    isReadOnly,
    isRequired,
    isInvalid: computed(
      () =>
        explicitInvalid.value ||
        validationState.value === "invalid" ||
        (isRequired.value && selectedValues.value.length === 0)
    ),
    validationState,
    isSelected: (value) => selectedValues.value.includes(value),
    addValue: (value) => {
      if (selectedValues.value.includes(value)) {
        return;
      }
      updateValue([...selectedValues.value, value]);
    },
    removeValue: (value) => {
      if (!selectedValues.value.includes(value)) {
        return;
      }
      updateValue(selectedValues.value.filter((existing) => existing !== value));
    },
    toggleValue: (value) => {
      if (selectedValues.value.includes(value)) {
        updateValue(selectedValues.value.filter((existing) => existing !== value));
      } else {
        updateValue([...selectedValues.value, value]);
      }
    },
  };
}

function createCheckboxGroupHarness(
  groupOptions: UseCheckboxGroupOptions = {},
  stateOptions: CheckboxGroupStateOptions = {},
  itemOptions: Array<{ value: string; onChange?: (isSelected: boolean) => void; isReadOnly?: boolean }> = [
    { value: "dogs" },
    { value: "cats" },
    { value: "dragons" },
  ]
) {
  const state = createCheckboxGroupState(stateOptions);
  const group = useCheckboxGroup(groupOptions, state);
  const items = itemOptions.map((options) => useCheckboxGroupItem(options, state));

  return {
    state,
    group,
    items,
  };
}

describe("useCheckboxGroup", () => {
  it("handles defaults", () => {
    const onChangeSpy = vi.fn();
    const { group, items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      { onChange: onChangeSpy }
    );

    expect(group.groupProps.value.role).toBe("group");
    expect(items).toHaveLength(3);

    expect(items[0].inputProps.value.name).toBeUndefined();
    expect(items[1].inputProps.value.name).toBeUndefined();
    expect(items[2].inputProps.value.name).toBeUndefined();

    expect(items[0].inputProps.value.value).toBe("dogs");
    expect(items[1].inputProps.value.value).toBe("cats");
    expect(items[2].inputProps.value.value).toBe("dragons");

    expect(items[0].inputProps.value.checked).toBe(false);
    expect(items[1].inputProps.value.checked).toBe(false);
    expect(items[2].inputProps.value.checked).toBe(false);

    pressCheckboxLabel(items[2]);

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(["dragons"]);
    expect(items[2].inputProps.value.checked).toBe(true);
    expect(items[0].inputProps.value.checked).toBe(false);
    expect(items[1].inputProps.value.checked).toBe(false);
  });

  it("can have a default value", () => {
    const { items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      { defaultValue: ["cats"] }
    );

    expect(items[1].inputProps.value.checked).toBe(true);
    expect(items[0].inputProps.value.checked).toBe(false);
    expect(items[2].inputProps.value.checked).toBe(false);
  });

  it("name can be controlled", () => {
    const { items } = createCheckboxGroupHarness(
      { label: "Favorite Pet", name: "awesome-react-aria" },
      {}
    );

    expect(items[0].inputProps.value.name).toBe("awesome-react-aria");
    expect(items[1].inputProps.value.name).toBe("awesome-react-aria");
    expect(items[2].inputProps.value.name).toBe("awesome-react-aria");
  });

  it("supports labeling", () => {
    const { group } = createCheckboxGroupHarness({ label: "Favorite Pet" }, {});

    const labelledBy = group.groupProps.value["aria-labelledby"];
    expect(typeof labelledBy).toBe("string");
    expect(labelledBy).toBe(group.labelProps.value.id);
  });

  it("supports aria-label", () => {
    const { group } = createCheckboxGroupHarness(
      { "aria-label": "My Favorite Pet" },
      {}
    );

    expect(group.groupProps.value["aria-label"]).toBe("My Favorite Pet");
  });

  it("supports custom data props", () => {
    const { group } = createCheckboxGroupHarness(
      { label: "Favorite Pet", "data-testid": "favorite-pet" },
      {}
    );

    expect(group.groupProps.value["data-testid"]).toBe("favorite-pet");
  });

  it("sets aria-disabled and disables items when group is disabled", () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    const { group, items } = createCheckboxGroupHarness(
      { label: "Favorite Pet", isDisabled: true },
      { isDisabled: true, onChange: groupOnChangeSpy },
      [
        { value: "dogs" },
        { value: "cats" },
        { value: "dragons", onChange: checkboxOnChangeSpy },
      ]
    );

    expect(group.groupProps.value["aria-disabled"]).toBe(true);
    expect(items[0].inputProps.value.disabled).toBe(true);
    expect(items[1].inputProps.value.disabled).toBe(true);
    expect(items[2].inputProps.value.disabled).toBe(true);

    pressCheckboxLabel(items[2]);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(items[2].inputProps.value.checked).toBe(false);
  });

  it("does not set aria-disabled by default", () => {
    const { group, items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      {}
    );

    expect(group.groupProps.value["aria-disabled"]).toBeUndefined();
    expect(items[0].inputProps.value.disabled).toBe(false);
    expect(items[1].inputProps.value.disabled).toBe(false);
    expect(items[2].inputProps.value.disabled).toBe(false);
  });

  it("does not set aria-disabled when false", () => {
    const { group, items } = createCheckboxGroupHarness(
      { label: "Favorite Pet", isDisabled: false },
      { isDisabled: false }
    );

    expect(group.groupProps.value["aria-disabled"]).toBeUndefined();
    expect(items[0].inputProps.value.disabled).toBe(false);
    expect(items[1].inputProps.value.disabled).toBe(false);
    expect(items[2].inputProps.value.disabled).toBe(false);
  });

  it("sets aria-readonly on each checkbox when group is readonly", () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    const { items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      { isReadOnly: true, onChange: groupOnChangeSpy },
      [
        { value: "dogs" },
        { value: "cats" },
        { value: "dragons", onChange: checkboxOnChangeSpy },
      ]
    );

    expect(items[0].inputProps.value["aria-readonly"]).toBe(true);
    expect(items[1].inputProps.value["aria-readonly"]).toBe(true);
    expect(items[2].inputProps.value["aria-readonly"]).toBe(true);
    expect(items[2].inputProps.value.checked).toBe(false);

    pressCheckboxLabel(items[2]);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(items[2].inputProps.value.checked).toBe(false);
  });

  it("does not update state for readonly checkbox item", () => {
    const groupOnChangeSpy = vi.fn();
    const checkboxOnChangeSpy = vi.fn();
    const { items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      { onChange: groupOnChangeSpy },
      [
        { value: "dogs" },
        { value: "cats" },
        { value: "dragons", isReadOnly: true, onChange: checkboxOnChangeSpy },
      ]
    );

    pressCheckboxLabel(items[2]);

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(items[2].inputProps.value.checked).toBe(false);
  });

  it("re-validates in realtime when required", () => {
    const { group, items } = createCheckboxGroupHarness(
      { label: "Favorite Pet" },
      { isRequired: true }
    );

    pressCheckboxLabel(items[2]);
    expect(group.isInvalid.value).toBe(false);

    pressCheckboxLabel(items[2]);
    expect(group.isInvalid.value).toBe(true);

    pressCheckboxLabel(items[2]);
    expect(group.isInvalid.value).toBe(false);
  });

  it("composes describedby with group description and error ids", () => {
    const { group, items } = createCheckboxGroupHarness(
      {
        label: "Favorite Pet",
        description: "Select all that apply",
        errorMessage: "At least one option is required",
      },
      { isRequired: true }
    );

    const handlers = items[0].inputProps.value as CheckboxInputHandlers;
    handlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: true },
    } as unknown as Event);
    handlers.onChange?.({
      stopPropagation: vi.fn(),
      target: { checked: false },
    } as unknown as Event);

    const describedBy = items[0].inputProps.value["aria-describedby"] as
      | string
      | undefined;
    expect(describedBy).toContain(group.errorMessageProps.value.id as string);
    expect(describedBy).toContain(group.descriptionProps.value.id as string);
  });
});
