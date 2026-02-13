import { useFocusable, usePress } from "@vue-aria/interactions";
import { filterDOMProps, mergeProps, useFormReset } from "@vue-aria/utils";

export interface AriaToggleProps {
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: string;
  name?: string;
  form?: string;
  children?: unknown;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  "aria-errormessage"?: string;
  "aria-controls"?: string;
  onPressStart?: (event: unknown) => void;
  onPressEnd?: (event: unknown) => void;
  onPressChange?: (pressed: boolean) => void;
  onPress?: (event: unknown) => void;
  onPressUp?: (event: unknown) => void;
  onClick?: (event: MouseEvent) => void;
  [key: string]: unknown;
}

export interface ToggleState {
  isSelected: boolean;
  defaultSelected: boolean;
  setSelected: (value: boolean) => void;
  toggle: () => void;
}

export interface ToggleAria {
  labelProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  isSelected: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
}

export function useToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref: { current: HTMLInputElement | null }
): ToggleAria {
  const {
    isDisabled = false,
    isReadOnly = false,
    value,
    name,
    form,
    children,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    validationState = "valid",
    isInvalid,
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick,
  } = props;

  const onChange = (event: Event) => {
    const e = event as Event & { target: HTMLInputElement };
    e.stopPropagation();
    state.setSelected(e.target.checked);
  };

  const hasChildren = children != null;
  const hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel && process.env.NODE_ENV !== "production") {
    console.warn("If you do not provide children, you must specify an aria-label for accessibility");
  }

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
    onPress(event) {
      onPress?.(event);
      state.toggle();
      ref.current?.focus();
    },
    isDisabled: isDisabled || isReadOnly,
  });

  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: HTMLInputElement | null) {
      ref.current = value;
    },
  };

  const { focusableProps } = useFocusable(props as any, focusRef as any);
  const interactions = mergeProps(pressProps, focusableProps);
  const domProps = filterDOMProps(props, { labelable: true });

  useFormReset(focusRef as any, state.defaultSelected, state.setSelected);

  return {
    labelProps: mergeProps(labelProps, { onClick: (e: MouseEvent) => e.preventDefault() }),
    inputProps: mergeProps(domProps, {
      "aria-invalid": isInvalid || validationState === "invalid" || undefined,
      "aria-errormessage": props["aria-errormessage"],
      "aria-controls": props["aria-controls"],
      "aria-readonly": isReadOnly || undefined,
      onChange,
      disabled: isDisabled,
      ...(value == null ? {} : { value }),
      name,
      form,
      type: "checkbox",
      ...interactions,
    }),
    isSelected: state.isSelected,
    isPressed: isPressed || isLabelPressed,
    isDisabled,
    isReadOnly,
    isInvalid: Boolean(isInvalid || validationState === "invalid"),
  };
}
