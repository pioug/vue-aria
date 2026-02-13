import { useFocusable, usePress } from "@vue-aria/interactions";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";

export interface AriaButtonOptions {
  elementType?: "button" | "a" | "div" | "input" | "span";
  isDisabled?: boolean;
  onPress?: (event: unknown) => void;
  onPressStart?: (event: unknown) => void;
  onPressEnd?: (event: unknown) => void;
  onPressUp?: (event: unknown) => void;
  onPressChange?: (pressed: boolean) => void;
  preventFocusOnPress?: boolean;
  allowFocusWhenDisabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  href?: string;
  target?: string;
  rel?: string;
  type?: string;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  value?: string;
  "aria-haspopup"?: string | boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-pressed"?: boolean | "mixed";
  "aria-current"?: string | boolean;
  "aria-disabled"?: boolean | "true" | "false";
}

export interface ButtonAria<T = Record<string, unknown>> {
  buttonProps: T;
  isPressed: boolean;
}

export function useButton(
  props: AriaButtonOptions,
  ref: { current: Element | null } = { current: null }
): ButtonAria<Record<string, unknown>> {
  const {
    elementType = "button",
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressUp,
    onPressChange,
    preventFocusOnPress,
    allowFocusWhenDisabled,
    onClick,
    href,
    target,
    rel,
    type = "button",
  } = props;

  let additionalProps: Record<string, unknown>;
  if (elementType === "button") {
    additionalProps = {
      type,
      disabled: isDisabled,
      form: props.form,
      formAction: props.formAction,
      formEncType: props.formEncType,
      formMethod: props.formMethod,
      formNoValidate: props.formNoValidate,
      formTarget: props.formTarget,
      name: props.name,
      value: props.value,
    };
  } else {
    additionalProps = {
      role: "button",
      href: elementType === "a" && !isDisabled ? href : undefined,
      target: elementType === "a" ? target : undefined,
      type: elementType === "input" ? type : undefined,
      disabled: elementType === "input" ? isDisabled : undefined,
      "aria-disabled": !isDisabled || elementType === "input" ? undefined : isDisabled,
      rel: elementType === "a" ? rel : undefined,
    };
  }

  const { pressProps, isPressed } = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    onPressUp,
    onClick,
    isDisabled,
    preventFocusOnPress,
    ref,
  });

  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: Element | null) {
      ref.current = value;
    },
  };

  const { focusableProps } = useFocusable(props, focusRef as any);
  if (allowFocusWhenDisabled) {
    focusableProps.tabIndex = isDisabled ? -1 : (focusableProps.tabIndex as number | undefined);
  }

  const buttonProps = mergeProps(
    focusableProps,
    pressProps,
    filterDOMProps(props as Record<string, unknown>, { labelable: true })
  );

  return {
    isPressed,
    buttonProps: mergeProps(additionalProps, buttonProps, {
      "aria-haspopup": props["aria-haspopup"],
      "aria-expanded": props["aria-expanded"],
      "aria-controls": props["aria-controls"],
      "aria-pressed": props["aria-pressed"],
      "aria-current": props["aria-current"],
      "aria-disabled": props["aria-disabled"],
    }),
  };
}
