import type { VNodeChild } from "vue";

import type { AriaLabelingProps, FocusableProps, LinkDOMProps, PressEvents, StyleProps } from "@vue-types/shared";

export interface LinkProps extends PressEvents, FocusableProps {}

export interface AriaLinkProps extends LinkProps, LinkDOMProps, AriaLabelingProps {}

export interface SpectrumLinkProps extends Omit<AriaLinkProps, "onClick">, StyleProps {
  children: VNodeChild;
  variant?: "primary" | "secondary" | "overBackground";
  isQuiet?: boolean;
}
