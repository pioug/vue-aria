import type { VNodeChild } from "vue";

import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface HeadingProps extends DOMProps, StyleProps {
  children: VNodeChild;
  slot?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}
