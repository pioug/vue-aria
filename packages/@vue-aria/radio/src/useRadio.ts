import type { RadioGroupState } from "@vue-stately/radio";
import { filterDOMProps, mergeProps, useFormReset } from "@vue-aria/utils";
import { useFocusable, usePress } from "@vue-aria/interactions";
import { radioGroupData } from "./utils";

export interface AriaRadioProps {
  value: string;
  children?: unknown;
  isDisabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onPressStart?: (event: unknown) => void;
  onPressEnd?: (event: unknown) => void;
  onPressChange?: (pressed: boolean) => void;
  onPress?: (event: unknown) => void;
  onPressUp?: (event: unknown) => void;
  onClick?: (event: MouseEvent) => void;
  [key: string]: unknown;
}

export interface RadioAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  isDisabled: boolean;
  isSelected: boolean;
  isPressed: boolean;
}

export function useRadio(
  props: AriaRadioProps,
  state: RadioGroupState,
  ref: { current: HTMLInputElement | null }
): RadioAria {
  const {
    value,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick,
  } = props;

  const isDisabled = props.isDisabled || state.isDisabled;
  const hasChildren = children != null;
  const hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel && process.env.NODE_ENV !== "production") {
    console.warn("If you do not provide children, you must specify an aria-label for accessibility");
  }

  const checked = state.selectedValue === value;
  const onChange = (event: Event) => {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement | null;
    state.setSelectedValue(value);
    if (!input) {
      return;
    }

    const container =
      input.closest("[role='radiogroup']")
      ?? input.form
      ?? input.ownerDocument;
    const radios = container?.querySelectorAll?.("input[type='radio']");
    if (!radios || radios.length === 0) {
      const shouldBeChecked = state.selectedValue === value;
      if (input.checked !== shouldBeChecked) {
        input.checked = shouldBeChecked;
      }
      return;
    }

    radios.forEach((radio) => {
      const next = radio as HTMLInputElement;
      if (next.name === input.name) {
        next.checked = next.value === state.selectedValue;
      }
    });
  };

  const { pressProps, isPressed } = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick,
    isDisabled,
  });

  const { pressProps: labelProps, isPressed: isLabelPressed } = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPressUp,
    onClick,
    isDisabled,
    onPress(event) {
      onPress?.(event);
      state.setSelectedValue(value);
      ref.current?.focus();
    },
  });

  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: HTMLInputElement | null) {
      ref.current = value;
    },
  };
  const { focusableProps } = useFocusable(
    mergeProps(props, {
      onFocus: () => state.setLastFocusedValue(value),
    }) as any,
    focusRef as any
  );
  const interactions = mergeProps(pressProps, focusableProps);
  const domProps = filterDOMProps(props, { labelable: true });

  let tabIndex: number | undefined = -1;
  if (state.selectedValue != null) {
    if (state.selectedValue === value) {
      tabIndex = 0;
    }
  } else if (state.lastFocusedValue === value || state.lastFocusedValue == null) {
    tabIndex = 0;
  }
  if (isDisabled) {
    tabIndex = undefined;
  }

  const data = radioGroupData.get(state);
  useFormReset(focusRef as any, state.defaultSelectedValue, state.setSelectedValue);

  return {
    labelProps: mergeProps(labelProps, {
      onClick: (event: MouseEvent) => event.preventDefault(),
      onMousedown: (event: MouseEvent) => event.preventDefault(),
    }),
    inputProps: mergeProps(domProps, {
      ...interactions,
      type: "radio",
      name: data?.name,
      form: data?.form,
      tabIndex,
      disabled: isDisabled,
      required: state.isRequired && data?.validationBehavior === "native",
      checked,
      value,
      onChange,
      "aria-describedby": [
        props["aria-describedby"],
        state.isInvalid ? data?.errorMessageId : null,
        data?.descriptionId,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    }),
    isDisabled: Boolean(isDisabled),
    isSelected: checked,
    isPressed: isPressed || isLabelPressed,
  };
}
