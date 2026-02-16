import type { VNodeChild } from "vue";

import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface TextProps extends DOMProps, StyleProps {
  children: VNodeChild;
  slot?: string;
}
