import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useRadioGroup, type UseRadioGroupState } from "../src/useRadioGroup";

interface RadioGroupHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
  onFocusin?: (event: FocusEvent) => void;
  onFocusout?: (event: FocusEvent) => void;
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

function createRadioGroupState(
  options: RadioGroupStateOptions = {}
): UseRadioGroupState & {
  selectedValueRef: ReturnType<typeof ref<string | null>>;
  lastFocusedValueRef: ReturnType<typeof ref<string | null>>;
} {
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
    setSelectedValue: (value) => {
      if (isDisabled.value || isReadOnly.value) {
        return;
      }

      selectedValue.value = value;
      options.onChange?.(value);
    },
    selectedValueRef: selectedValue,
    lastFocusedValue: lastFocusedValue,
    lastFocusedValueRef: lastFocusedValue,
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

function createFocusEvent(
  type: "focus" | "blur",
  target: EventTarget | null,
  currentTarget: EventTarget | null,
  relatedTarget: EventTarget | null = null
): FocusEvent {
  const event = new FocusEvent(type, { bubbles: true, relatedTarget });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  return event;
}

describe("useRadioGroup", () => {
  it("returns default radiogroup props", () => {
    const state = createRadioGroupState();
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
      },
      state
    );

    expect(radioGroupProps.value.role).toBe("radiogroup");
    expect(radioGroupProps.value["aria-orientation"]).toBe("vertical");
    expect(radioGroupProps.value["aria-disabled"]).toBeUndefined();
    expect(radioGroupProps.value["aria-readonly"]).toBeUndefined();
    expect(radioGroupProps.value["aria-required"]).toBeUndefined();
  });

  it("supports label and aria-label", () => {
    const state = createRadioGroupState();
    const withLabel = useRadioGroup({ label: "Favorite Pet" }, state);
    expect(withLabel.radioGroupProps.value["aria-labelledby"]).toBe(
      withLabel.labelProps.value.id
    );

    const withAriaLabel = useRadioGroup({ "aria-label": "Pet Group" }, state);
    expect(withAriaLabel.radioGroupProps.value["aria-label"]).toBe("Pet Group");
  });

  it("supports custom data props", () => {
    const state = createRadioGroupState();
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
        "data-testid": "favorite-pet",
      },
      state
    );

    expect(radioGroupProps.value["data-testid"]).toBe("favorite-pet");
  });

  it("applies disabled, readonly, and required semantics", () => {
    const state = createRadioGroupState({
      isDisabled: true,
      isReadOnly: true,
      isRequired: true,
    });
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
        isDisabled: true,
        isReadOnly: true,
        isRequired: true,
      },
      state
    );

    expect(radioGroupProps.value["aria-disabled"]).toBe(true);
    expect(radioGroupProps.value["aria-readonly"]).toBe(true);
    expect(radioGroupProps.value["aria-required"]).toBe(true);
  });

  it("navigates radios with arrow keys in LTR horizontal groups", () => {
    const state = createRadioGroupState({ selectedValue: "dogs" });
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
        orientation: "horizontal",
      },
      state
    );
    const handlers = radioGroupProps.value as RadioGroupHandlers;

    const container = document.createElement("div");
    const dogs = document.createElement("input");
    dogs.type = "radio";
    dogs.value = "dogs";
    const cats = document.createElement("input");
    cats.type = "radio";
    cats.value = "cats";
    const dragons = document.createElement("input");
    dragons.type = "radio";
    dragons.value = "dragons";
    container.append(dogs, cats, dragons);
    document.body.appendChild(container);

    const preventDefault = vi.fn();
    handlers.onKeydown?.({
      key: "ArrowRight",
      preventDefault,
      currentTarget: container,
      target: dogs,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(state.selectedValueRef.value).toBe("cats");
    expect(document.activeElement).toBe(cats);
  });

  it("uses RTL arrow semantics for horizontal groups", () => {
    const state = createRadioGroupState({ selectedValue: "cats" });
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
        orientation: "horizontal",
        direction: "rtl",
      },
      state
    );
    const handlers = radioGroupProps.value as RadioGroupHandlers;

    const container = document.createElement("div");
    const dogs = document.createElement("input");
    dogs.type = "radio";
    dogs.value = "dogs";
    const cats = document.createElement("input");
    cats.type = "radio";
    cats.value = "cats";
    const dragons = document.createElement("input");
    dragons.type = "radio";
    dragons.value = "dragons";
    container.append(dogs, cats, dragons);
    document.body.appendChild(container);

    handlers.onKeydown?.({
      key: "ArrowRight",
      preventDefault: vi.fn(),
      currentTarget: container,
      target: cats,
    } as unknown as KeyboardEvent);

    expect(state.selectedValueRef.value).toBe("dogs");
    expect(document.activeElement).toBe(dogs);
  });

  it("resets last focused value on blur when there is no selection", () => {
    const state = createRadioGroupState({ selectedValue: null });
    state.lastFocusedValueRef.value = "dogs";
    const { radioGroupProps } = useRadioGroup(
      {
        label: "Favorite Pet",
      },
      state
    );
    const handlers = radioGroupProps.value as RadioGroupHandlers;

    const container = document.createElement("div");
    const radio = document.createElement("input");
    radio.type = "radio";
    container.appendChild(radio);
    document.body.appendChild(container);

    handlers.onFocusin?.(createFocusEvent("focus", radio, container));
    handlers.onFocusout?.(createFocusEvent("blur", radio, container));

    expect(state.lastFocusedValueRef.value).toBeNull();
  });
});
