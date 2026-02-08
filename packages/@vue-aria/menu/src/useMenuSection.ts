import { computed, toValue } from "vue";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseMenuSectionOptions {
  heading?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
}

export interface UseMenuSectionResult {
  itemProps: ReadonlyRef<Record<string, unknown>>;
  headingProps: ReadonlyRef<Record<string, unknown>>;
  groupProps: ReadonlyRef<Record<string, unknown>>;
}

export function useMenuSection(
  options: UseMenuSectionOptions = {}
): UseMenuSectionResult {
  const headingId = useId(undefined, "v-aria-menu-section-heading");

  const heading = computed(() =>
    options.heading === undefined ? undefined : toValue(options.heading)
  );
  const ariaLabel = computed(() =>
    options["aria-label"] === undefined
      ? undefined
      : toValue(options["aria-label"])
  );

  return {
    itemProps: computed(() => ({
      role: "presentation",
    })),
    headingProps: computed(() => {
      if (!heading.value) {
        return {};
      }

      return {
        id: headingId.value,
        role: "presentation",
      };
    }),
    groupProps: computed(() => ({
      role: "group",
      "aria-label": ariaLabel.value,
      "aria-labelledby": heading.value ? headingId.value : undefined,
    })),
  };
}
