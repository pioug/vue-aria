import type { VNodeChild } from "vue";

import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface ContentProps extends DOMProps, StyleProps {
  children: VNodeChild;
}
