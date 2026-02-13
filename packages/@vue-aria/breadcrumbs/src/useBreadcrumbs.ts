import { filterDOMProps } from "@vue-aria/utils";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";

const intlMessages = {
  "en-US": {
    breadcrumbs: "Breadcrumbs",
  },
};

export interface AriaBreadcrumbsProps {
  "aria-label"?: string;
  [key: string]: unknown;
}

export interface BreadcrumbsAria {
  navProps: Record<string, unknown>;
}

export function useBreadcrumbs(props: AriaBreadcrumbsProps): BreadcrumbsAria {
  const { "aria-label": ariaLabel, ...otherProps } = props;
  const strings = useLocalizedStringFormatter(intlMessages as any, "@react-aria/breadcrumbs");

  return {
    navProps: {
      ...filterDOMProps(otherProps, { labelable: true }),
      "aria-label": ariaLabel || strings.format("breadcrumbs"),
    },
  };
}
