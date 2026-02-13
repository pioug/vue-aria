import {
  isFocusVisible,
  useFocus,
  useFocusVisibleListener,
  useFocusWithin,
} from "@vue-aria/interactions";

export interface AriaFocusRingProps {
  within?: boolean;
  isTextInput?: boolean;
  autoFocus?: boolean;
}

export interface FocusRingAria {
  isFocused: boolean;
  isFocusVisible: boolean;
  focusProps: Record<string, unknown>;
}

export function useFocusRing(props: AriaFocusRingProps = {}): FocusRingAria {
  const { autoFocus = false, isTextInput, within } = props;

  const state = {
    isFocused: false,
    isFocusVisible: autoFocus || isFocusVisible(),
  };

  let isFocused = false;
  let isFocusVisibleState = false;

  const updateState = () => {
    isFocusVisibleState = state.isFocused && state.isFocusVisible;
  };

  const onFocusChange = (focused: boolean) => {
    state.isFocused = focused;
    state.isFocusVisible = isFocusVisible();
    isFocused = focused;
    updateState();
  };

  useFocusVisibleListener(
    (nextFocusVisible) => {
      state.isFocusVisible = nextFocusVisible;
      updateState();
    },
    [isTextInput, isFocused],
    { enabled: isFocused, isTextInput }
  );

  const { focusProps } = useFocus({
    isDisabled: within,
    onFocusChange,
  });

  const { focusWithinProps } = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: onFocusChange,
  });

  updateState();

  return {
    get isFocused() {
      return isFocused;
    },
    get isFocusVisible() {
      return isFocusVisibleState;
    },
    focusProps: within ? focusWithinProps : focusProps,
  } as FocusRingAria;
}
