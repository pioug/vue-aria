import type { VNodeChild } from "vue";

import type { AriaLabelingProps, DOMProps, StyleProps } from "@vue-types/shared";

export interface SpectrumWellProps extends DOMProps, AriaLabelingProps, StyleProps {
  children: VNodeChild;
  role?: "region" | "group";
}
