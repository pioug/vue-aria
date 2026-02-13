import { useLink } from "@vue-aria/link";

export interface AriaBreadcrumbItemProps {
  isCurrent?: boolean;
  isDisabled?: boolean;
  "aria-current"?: string;
  elementType?: string;
  autoFocus?: boolean;
  [key: string]: unknown;
}

export interface BreadcrumbItemAria {
  itemProps: Record<string, unknown>;
}

export function useBreadcrumbItem(
  props: AriaBreadcrumbItemProps,
  ref: { current: Element | null } = { current: null }
): BreadcrumbItemAria {
  const {
    isCurrent,
    isDisabled,
    "aria-current": ariaCurrent,
    elementType = "a",
    ...otherProps
  } = props;

  const { linkProps } = useLink(
    {
      isDisabled: isDisabled || isCurrent,
      elementType,
      ...otherProps,
    },
    ref
  );
  const isHeading = /^h[1-6]$/.test(elementType);
  let itemProps: Record<string, unknown> = {};

  if (!isHeading) {
    itemProps = linkProps;
  }

  if (isCurrent) {
    itemProps["aria-current"] = ariaCurrent || "page";
    itemProps.tabIndex = props.autoFocus ? -1 : undefined;
  }

  return {
    itemProps: {
      "aria-disabled": isDisabled,
      ...itemProps,
    },
  };
}
