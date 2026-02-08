import { ref, toValue, watch } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

export interface UseFocusWithinOptions {
  isDisabled?: MaybeReactive<boolean>;
  onFocusWithin?: (event: FocusEvent) => void;
  onBlurWithin?: (event: FocusEvent) => void;
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface UseFocusWithinResult {
  focusWithinProps: Record<string, unknown>;
}

function isWithin(currentTarget: EventTarget | null, target: EventTarget | null): boolean {
  return (
    currentTarget instanceof Element &&
    target instanceof Element &&
    currentTarget.contains(target)
  );
}

function isDisabled(options: UseFocusWithinOptions): boolean {
  return options.isDisabled ? Boolean(toValue(options.isDisabled)) : false;
}

export function useFocusWithin(
  options: UseFocusWithinOptions = {}
): UseFocusWithinResult {
  const isFocusWithin = ref(false);
  const activeTarget = ref<EventTarget | null>(null);

  const endFocusWithin = (event: FocusEvent) => {
    if (!isFocusWithin.value) {
      return;
    }

    isFocusWithin.value = false;
    activeTarget.value = null;
    options.onBlurWithin?.(event);
    options.onFocusWithinChange?.(false);
  };

  const onFocus = (event: FocusEvent) => {
    if (isDisabled(options)) {
      return;
    }

    if (!isWithin(event.currentTarget, event.target)) {
      return;
    }

    if (!isFocusWithin.value) {
      isFocusWithin.value = true;
      activeTarget.value = event.currentTarget;
      options.onFocusWithin?.(event);
      options.onFocusWithinChange?.(true);
    }
  };

  const onBlur = (event: FocusEvent) => {
    if (!isFocusWithin.value) {
      return;
    }

    if (!isWithin(event.currentTarget, event.target)) {
      return;
    }

    const nextTarget = event.relatedTarget;
    if (isWithin(event.currentTarget, nextTarget)) {
      return;
    }

    endFocusWithin(event);
  };

  watch(
    () => isDisabled(options),
    (disabled) => {
      if (!disabled || !isFocusWithin.value) {
        return;
      }

      // disabled transitions should end focus-within even without blur.
      const target = activeTarget.value;
      const syntheticBlur = new FocusEvent("blur", {
        relatedTarget: null,
        bubbles: true,
      });
      Object.defineProperty(syntheticBlur, "target", { value: target });
      Object.defineProperty(syntheticBlur, "currentTarget", { value: target });
      endFocusWithin(syntheticBlur);
    }
  );

  return {
    focusWithinProps: {
      onFocusin: onFocus,
      onFocusout: onBlur,
    },
  };
}
