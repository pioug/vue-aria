import type { AriaLinkOptions } from "@vue-aria/link";

export type SpectrumLinkVariant = "primary" | "secondary" | "overBackground";

export interface SpectrumLinkProps extends AriaLinkOptions {
  variant?: SpectrumLinkVariant;
  isQuiet?: boolean;
  autoFocus?: boolean;
  UNSAFE_className?: string;
  UNSAFE_style?: Record<string, unknown>;
}
