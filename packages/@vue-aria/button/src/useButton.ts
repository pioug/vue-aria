import { computed, toValue } from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { usePress } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

type ButtonElementType = "button" | "a" | "div" | "span";
type NativeButtonType = "button" | "submit" | "reset";

export interface UseButtonOptions {
  elementType?: MaybeReactive<ButtonElementType>;
  isDisabled?: MaybeReactive<boolean>;
  type?: MaybeReactive<NativeButtonType>;
  href?: MaybeReactive<string | undefined>;
  target?: MaybeReactive<string | undefined>;
  rel?: MaybeReactive<string | undefined>;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPressChange?: (isPressed: boolean) => void;
  onPressUp?: (event: PressEvent) => void;
  onPress?: (event: PressEvent) => void;
}

export interface UseButtonResult {
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
}

export function useButton(options: UseButtonOptions = {}): UseButtonResult {
  const elementType = computed<ButtonElementType>(() => {
    if (options.elementType === undefined) {
      return "button";
    }
    return toValue(options.elementType);
  });
  const isNativeButton = computed(() => elementType.value === "button");
  const isDisabled = computed(() => {
    if (options.isDisabled === undefined) {
      return false;
    }
    return Boolean(toValue(options.isDisabled));
  });

  const { pressProps, isPressed } = usePress({
    isDisabled,
    disableKeyboard: isNativeButton,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPressChange: options.onPressChange,
    onPressUp: options.onPressUp,
    onPress: options.onPress,
  });

  const { focusProps, isFocused, isFocusVisible } = useFocusRing();

  const buttonProps = computed<Record<string, unknown>>(() => {
    const mergedInteractionProps = mergeProps(pressProps, focusProps);
    const disabled = isDisabled.value;

    if (isNativeButton.value) {
      return {
        ...mergedInteractionProps,
        type: options.type === undefined ? "button" : toValue(options.type),
        disabled,
      };
    }

    const props: Record<string, unknown> = {
      ...mergedInteractionProps,
      role: "button",
      tabindex: disabled ? -1 : 0,
      "aria-disabled": disabled || undefined,
    };

    if (elementType.value === "a") {
      const href = options.href === undefined ? undefined : toValue(options.href);
      if (href && !disabled) {
        props.href = href;
      }

      const target =
        options.target === undefined ? undefined : toValue(options.target);
      if (target) {
        props.target = target;
      }

      const rel = options.rel === undefined ? undefined : toValue(options.rel);
      if (rel) {
        props.rel = rel;
      }
    }

    return props;
  });

  return {
    buttonProps,
    isPressed,
    isFocused,
    isFocusVisible,
  };
}
