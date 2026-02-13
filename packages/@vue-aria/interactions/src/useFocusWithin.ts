import { getOwnerDocument, nodeContains, useGlobalListeners } from "@vue-aria/utils";

export interface FocusWithinProps {
  isDisabled?: boolean;
  onFocusWithin?: (event: FocusEvent) => void;
  onBlurWithin?: (event: FocusEvent) => void;
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinResult {
  focusWithinProps: Record<string, unknown>;
}

export function useFocusWithin(props: FocusWithinProps): FocusWithinResult {
  const { isDisabled, onBlurWithin, onFocusWithin, onFocusWithinChange } = props;
  const state = {
    isFocusWithin: false,
  };

  const { addGlobalListener, removeAllGlobalListeners } = useGlobalListeners();

  const onBlur = (event: FocusEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    if (
      state.isFocusWithin &&
      !nodeContains(event.currentTarget as Node | null, event.relatedTarget as Node | null)
    ) {
      state.isFocusWithin = false;
      removeAllGlobalListeners();
      onBlurWithin?.(event);
      onFocusWithinChange?.(false);
    }
  };

  const onFocus = (event: FocusEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    if (!state.isFocusWithin) {
      onFocusWithin?.(event);
      onFocusWithinChange?.(true);
      state.isFocusWithin = true;

      const currentTarget = event.currentTarget as Element;
      const ownerDocument = getOwnerDocument(event.target as Element);
      addGlobalListener(
        ownerDocument,
        "focus",
        (outsideFocusEvent: Event) => {
          if (
            state.isFocusWithin &&
            !nodeContains(currentTarget, outsideFocusEvent.target as Element | null)
          ) {
            const blurEvent = new FocusEvent("blur", {
              relatedTarget: outsideFocusEvent.target as EventTarget | null,
            });
            Object.defineProperty(blurEvent, "target", { value: currentTarget });
            Object.defineProperty(blurEvent, "currentTarget", { value: currentTarget });
            onBlur(blurEvent);
          }
        },
        { capture: true }
      );
    }
  };

  if (isDisabled) {
    return {
      focusWithinProps: {
        onFocus: undefined,
        onBlur: undefined,
      },
    };
  }

  return {
    focusWithinProps: {
      onFocus,
      onBlur,
    },
  };
}
