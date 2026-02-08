import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseListBoxSectionOptions {
  heading?: MaybeReactive<unknown>;
  "aria-label"?: MaybeReactive<string | undefined>;
}

export interface UseListBoxSectionResult {
  itemProps: ReadonlyRef<Record<string, unknown>>;
  headingProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
}

export function useListBoxSection(
  options: UseListBoxSectionOptions = {}
): UseListBoxSectionResult {
  const headingId = useId(undefined, "v-aria-listbox-section");
  const hasHeading = computed(() => Boolean(toValue(options.heading)));

  const itemProps = computed<Record<string, unknown>>(() => ({
    role: "presentation",
  }));

  const headingProps = computed<Record<string, unknown>>(() => {
    if (!hasHeading.value) {
      return {};
    }

    return {
      id: headingId.value,
      role: "presentation",
      onMouseDown: (event: MouseEvent) => {
        event.preventDefault();
      },
    };
  });

  const groupProps = computed<Record<string, unknown>>(() => ({
    role: "group",
    "aria-label":
      options["aria-label"] === undefined
        ? undefined
        : toValue(options["aria-label"]),
    "aria-labelledby": hasHeading.value ? headingId.value : undefined,
  }));

  return {
    itemProps,
    headingProps,
    groupProps,
  };
}
