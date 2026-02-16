import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, StyleProps } from "@vue-types/shared";
import type { OverlayTriggerProps, Placement, PositionProps } from "@vue-types/overlays";

export interface SpectrumContextualHelpProps extends OverlayTriggerProps, PositionProps, StyleProps, DOMProps, AriaLabelingProps {
  children: VNodeChild;
  variant?: "help" | "info";
  placement?: Placement;
}
