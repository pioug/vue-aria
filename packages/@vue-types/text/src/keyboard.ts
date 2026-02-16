import type { VNodeChild } from "vue";

import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface KeyboardProps extends DOMProps, StyleProps {
  children: VNodeChild;
  slot?: string;
}
