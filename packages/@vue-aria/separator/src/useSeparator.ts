import { computed, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type Orientation = "horizontal" | "vertical";

export interface UseSeparatorOptions {
  orientation?: MaybeReactive<Orientation>;
  elementType?: MaybeReactive<string>;
  id?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
}

export interface UseSeparatorResult {
  separatorProps: ReadonlyRef<Record<string, unknown>>;
}

export function useSeparator(
  options: UseSeparatorOptions = {}
): UseSeparatorResult {
  const separatorProps = computed<Record<string, unknown>>(() => {
    const elementType =
      options.elementType === undefined ? undefined : toValue(options.elementType);
    const orientation =
      options.orientation === undefined ? "horizontal" : toValue(options.orientation);

    const domProps: Record<string, unknown> = {
      id: options.id === undefined ? undefined : toValue(options.id),
      "aria-label":
        options["aria-label"] === undefined
          ? undefined
          : toValue(options["aria-label"]),
      "aria-labelledby":
        options["aria-labelledby"] === undefined
          ? undefined
          : toValue(options["aria-labelledby"]),
    };

    if (elementType === "hr") {
      return domProps;
    }

    return {
      ...domProps,
      role: "separator",
      "aria-orientation": orientation === "vertical" ? "vertical" : undefined,
    };
  });

  return { separatorProps };
}
