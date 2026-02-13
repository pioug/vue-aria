export interface FocusProps<Target extends Element = Element> {
  isDisabled?: boolean;
  onFocus?: (event: FocusEvent & { target: Target; currentTarget: Target }) => void;
  onBlur?: (event: FocusEvent & { target: Target; currentTarget: Target }) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export interface FocusResult<Target extends Element = Element> {
  focusProps: Record<string, unknown>;
}

export function useFocus<Target extends Element = Element>(props: FocusProps<Target>): FocusResult<Target> {
  const { isDisabled, onFocus: onFocusProp, onBlur: onBlurProp, onFocusChange } = props;

  const onBlur = (event: FocusEvent) => {
    if (event.target === event.currentTarget) {
      onBlurProp?.(event as FocusEvent & { target: Target; currentTarget: Target });
      onFocusChange?.(false);
      return true;
    }

    return false;
  };

  const onFocus = (event: FocusEvent) => {
    if (event.target === event.currentTarget) {
      onFocusProp?.(event as FocusEvent & { target: Target; currentTarget: Target });
      onFocusChange?.(true);
    }
  };

  return {
    focusProps: {
      onFocus: !isDisabled && (onFocusProp || onFocusChange || onBlurProp) ? onFocus : undefined,
      onBlur: !isDisabled && (onBlurProp || onFocusChange) ? onBlur : undefined,
    },
  };
}
