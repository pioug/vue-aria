import type { VNodeChild } from "vue";

import type { AriaLabelingProps, CollectionBase, DOMProps, Expandable, MultipleSelection, Node, StyleProps } from "@vue-types/shared";

export interface SideNavProps<T> extends CollectionBase<T>, Expandable, MultipleSelection {
  shouldFocusWrap?: boolean;
}

export interface AriaSideNavProps<T> extends SideNavProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumSideNavProps<T> extends AriaSideNavProps<T>, StyleProps {}

export interface SpectrumSideNavItemProps<T> extends Record<string, unknown> {
  item: Node<T>;
}

export interface SideNavSectionProps<T> {
  layoutInfo: any;
  headerLayoutInfo: any;
  virtualizer: any;
  item: Node<T>;
  children?: VNodeChild;
}
