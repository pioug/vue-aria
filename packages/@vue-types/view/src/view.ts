import type { Component, VNodeChild } from "vue";

import type { ColorVersion, DOMProps, ViewStyleProps } from "@vue-types/shared";

export interface ViewProps<C extends ColorVersion> extends ViewStyleProps<C>, DOMProps {
  elementType?: string | Component;
  children?: VNodeChild;
}
