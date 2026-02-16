import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, StyleProps } from "@vue-types/shared";

export interface SpectrumBadgeProps extends DOMProps, StyleProps, AriaLabelingProps {
  /** The content to display in the badge. */
  children: VNodeChild,
  /**
   * The variant changes the background color of the badge.
   * When badge has a semantic meaning, they should use the variant for semantic colors.
   */
  variant: "neutral" | "info" | "positive" | "negative" | "indigo" | "yellow" | "magenta" | "fuchsia" | "purple" | "seafoam"
}
