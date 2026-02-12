import { ref, toValue, watch } from "vue";
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
  const isFocused = ref(false);
  const activeTarget = ref<EventTarget | null>(null);

  const endFocus = (event: FocusEvent) => {
    if (!isFocused.value) {
      return;
    }

    isFocused.value = false;
    activeTarget.value = null;
    options.onBlur?.(event);
    options.onFocusChange?.(false);
  };

  const onBlur = (event: FocusEvent) => {
    if (isDisabled()) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    endFocus(event);
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

    isFocused.value = true;
    activeTarget.value = event.target;
    options.onFocus?.(event);
    options.onFocusChange?.(true);
  };

  watch(
    () => isDisabled(),
    (disabled) => {
      if (!disabled || !isFocused.value) {
        return;
      }

      const target = activeTarget.value;
      const syntheticBlur = new FocusEvent("blur", {
        relatedTarget: null,
        bubbles: true,
      });
      Object.defineProperty(syntheticBlur, "target", { value: target });
      Object.defineProperty(syntheticBlur, "currentTarget", { value: target });
      endFocus(syntheticBlur);
    }
  );

  return {
    focusProps: {
      onFocus:
        options.onFocus || options.onFocusChange || options.onBlur ? onFocus : undefined,
      onBlur: options.onBlur || options.onFocusChange ? onBlur : undefined,
    },
  };
}
