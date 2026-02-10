import { computed, toValue } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps } from "@vue-aria/utils";

const messages = {
  "en-US": {
    breadcrumbs: "Breadcrumbs",
  },
} as const;

export interface UseBreadcrumbsOptions extends Record<string, unknown> {
  "aria-label"?: MaybeReactive<string | undefined>;
}

export interface UseBreadcrumbsResult {
  navProps: ReadonlyRef<Record<string, unknown>>;
}

export function useBreadcrumbs(
  options: UseBreadcrumbsOptions = {}
): UseBreadcrumbsResult {
  const strings = useLocalizedStringFormatter(messages, "@vue-aria/breadcrumbs");

  const navProps = computed<Record<string, unknown>>(() => {
    const ariaLabel =
      options["aria-label"] === undefined
        ? undefined
        : toValue(options["aria-label"]);
    const domProps = filterDOMProps({
      ...options,
      "aria-label": ariaLabel,
    });

    return {
      ...domProps,
      "aria-label": ariaLabel ?? strings.value.format("breadcrumbs"),
    };
  });

  return {
    navProps,
  };
}
