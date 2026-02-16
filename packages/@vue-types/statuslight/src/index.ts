import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, StyleProps } from "@vue-types/shared";

export interface SpectrumStatusLightProps extends DOMProps, StyleProps, AriaLabelingProps {
  children?: VNodeChild;
  variant: "positive" | "negative" | "notice" | "info" | "neutral" | "celery" | "chartreuse" | "yellow" | "magenta" | "fuchsia" | "purple" | "indigo" | "seafoam";
  isDisabled?: boolean;
  role?: "status";
}
