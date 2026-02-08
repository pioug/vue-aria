import { computed, ref, toValue } from "vue";
import { useFocusWithin } from "@vue-aria/interactions";
import type { CSSProperties } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseVisuallyHiddenOptions {
  style?: MaybeReactive<CSSProperties | undefined>;
  isFocusable?: MaybeReactive<boolean>;
}

export interface UseVisuallyHiddenResult {
  visuallyHiddenProps: ReadonlyRef<Record<string, unknown>>;
}

export const visuallyHiddenStyles: CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
};

export function useVisuallyHidden(
  options: UseVisuallyHiddenOptions = {}
): UseVisuallyHiddenResult {
  const isFocused = ref(false);
  const isFocusable = () =>
    options.isFocusable ? Boolean(toValue(options.isFocusable)) : false;

  const { focusWithinProps } = useFocusWithin({
    isDisabled: computed(() => !isFocusable()),
    onFocusWithinChange: (focused) => {
      isFocused.value = focused;
    },
  });

  const visuallyHiddenProps = computed<Record<string, unknown>>(() => {
    const style = options.style === undefined ? undefined : toValue(options.style);
    const resolvedStyle = isFocused.value
      ? style
      : style
        ? { ...visuallyHiddenStyles, ...style }
        : visuallyHiddenStyles;

    return {
      ...focusWithinProps,
      style: resolvedStyle,
    };
  });

  return { visuallyHiddenProps };
}
