import { readonly, ref, watchEffect } from "vue";
import { useFocusVisible } from "./useFocusVisible";
import type { ReadonlyRef } from "@vue-aria/types";

export interface UseFocusRingOptions {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export interface UseFocusRingResult {
  focusProps: Record<string, unknown>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
}

export function useFocusRing(options: UseFocusRingOptions = {}): UseFocusRingResult {
  const globalFocusVisible = useFocusVisible();
  const isFocused = ref(false);
  const isFocusVisible = ref(false);

  const onFocus = (event: FocusEvent) => {
    isFocused.value = true;
    isFocusVisible.value = globalFocusVisible.value;
    options.onFocus?.(event);
  };

  const onBlur = (event: FocusEvent) => {
    isFocused.value = false;
    isFocusVisible.value = false;
    options.onBlur?.(event);
  };

  watchEffect(() => {
    if (isFocused.value) {
      isFocusVisible.value = globalFocusVisible.value;
    }
  });

  return {
    focusProps: {
      onFocus,
      onBlur,
    },
    isFocused: readonly(isFocused),
    isFocusVisible: readonly(isFocusVisible),
  };
}
