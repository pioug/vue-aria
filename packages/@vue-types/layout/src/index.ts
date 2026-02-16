import type { DOMProps, FlexStyleProps, GridStyleProps } from "@vue-types/shared";
import type { VNodeChild } from "vue";

export type Slots = {[key: string]: any};

export interface FlexProps extends DOMProps, FlexStyleProps {
  children: VNodeChild;
}

export interface GridProps extends DOMProps, GridStyleProps {
  children: VNodeChild;
}
