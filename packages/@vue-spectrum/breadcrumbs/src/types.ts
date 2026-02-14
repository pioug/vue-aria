import type { AriaBreadcrumbItemProps, AriaBreadcrumbsProps } from "@vue-aria/breadcrumbs";

export type SpectrumBreadcrumbSize = "S" | "M" | "L";

export interface SpectrumItemProps {
  href?: string;
  target?: string;
  rel?: string;
  isDisabled?: boolean;
  "aria-current"?: string;
  [key: string]: unknown;
}

export interface SpectrumBreadcrumbItemProps extends AriaBreadcrumbItemProps, SpectrumItemProps {
  isMenu?: boolean;
  isCurrent?: boolean;
}

export interface SpectrumBreadcrumbsProps extends AriaBreadcrumbsProps {
  size?: SpectrumBreadcrumbSize;
  isMultiline?: boolean;
  showRoot?: boolean;
  isDisabled?: boolean;
  autoFocusCurrent?: boolean;
  onAction?: (key: string | number) => void;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
