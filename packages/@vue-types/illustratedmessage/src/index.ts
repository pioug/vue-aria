import type { VNodeChild } from "vue";

import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface SpectrumIllustratedMessageProps extends DOMProps, StyleProps {
  children: VNodeChild;
}
