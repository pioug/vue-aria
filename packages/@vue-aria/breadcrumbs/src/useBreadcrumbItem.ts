import { computed, toValue } from "vue";
import { useLink, type UseLinkOptions } from "@vue-aria/link";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type BreadcrumbElementType = "a" | "span" | "div" | HeadingElement;

export interface UseBreadcrumbItemOptions extends Omit<UseLinkOptions, "isDisabled" | "elementType"> {
  isCurrent?: MaybeReactive<boolean | undefined>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  "aria-current"?: MaybeReactive<"page" | "step" | "location" | "date" | "time" | "true" | undefined>;
  elementType?: MaybeReactive<BreadcrumbElementType | undefined>;
  autoFocus?: MaybeReactive<boolean | undefined>;
}

export interface UseBreadcrumbItemResult {
  itemProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

export function useBreadcrumbItem(
  options: UseBreadcrumbItemOptions = {}
): UseBreadcrumbItemResult {
  const elementType = computed<BreadcrumbElementType>(() => {
    if (options.elementType === undefined) {
      return "a";
    }

    return (toValue(options.elementType) ?? "a") as BreadcrumbElementType;
  });

  const isCurrent = computed(() => resolveBoolean(options.isCurrent));
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const isHeading = computed(() => /^h[1-6]$/.test(elementType.value));

  const linkElementType = computed<"a" | "span" | "div">(() => {
    if (isHeading.value) {
      return "a";
    }

    if (elementType.value === "span" || elementType.value === "div") {
      return elementType.value;
    }

    return "a";
  });

  const { linkProps } = useLink({
    ...options,
    elementType: linkElementType,
    isDisabled: computed(() => isDisabled.value || isCurrent.value),
  });

  const itemProps = computed<Record<string, unknown>>(() => {
    let resolvedProps: Record<string, unknown> = isHeading.value ? {} : linkProps.value;

    if (isCurrent.value) {
      resolvedProps = {
        ...resolvedProps,
        "aria-current":
          options["aria-current"] === undefined
            ? "page"
            : (toValue(options["aria-current"]) ?? "page"),
        tabIndex:
          options.autoFocus !== undefined && Boolean(toValue(options.autoFocus))
            ? -1
            : undefined,
      };
    }

    return {
      "aria-disabled": isDisabled.value || undefined,
      ...resolvedProps,
    };
  });

  return {
    itemProps,
  };
}
