import { toValue } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

export interface UseFocusOptions {
  isDisabled?: MaybeReactive<boolean>;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export interface UseFocusResult {
  focusProps: Record<string, unknown>;
}

function getActiveElement(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) {
    return document.activeElement;
  }

  const root = target.getRootNode();
  if (root instanceof ShadowRoot) {
    return root.activeElement;
  }

  return target.ownerDocument?.activeElement ?? document.activeElement;
}

export function useFocus(options: UseFocusOptions = {}): UseFocusResult {
  const isDisabled = () =>
    options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;

  const onBlur = (event: FocusEvent) => {
    if (isDisabled()) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    options.onBlur?.(event);
    options.onFocusChange?.(false);
  };

  const onFocus = (event: FocusEvent) => {
    if (isDisabled()) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    // If a previously chained focus handler changed focus, ignore stale events.
    if (getActiveElement(event.target) !== event.target) {
      return;
    }

    options.onFocus?.(event);
    options.onFocusChange?.(true);
  };

  return {
    focusProps: {
      onFocus:
        options.onFocus || options.onFocusChange || options.onBlur ? onFocus : undefined,
      onBlur: options.onBlur || options.onFocusChange ? onBlur : undefined,
    },
  };
}
