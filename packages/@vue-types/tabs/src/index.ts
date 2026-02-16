import type { VNodeChild } from "vue";

import type {
  AriaLabelingProps,
  CollectionBase,
  CollectionChildren,
  DOMProps,
  Key,
  Orientation,
  SingleSelection,
  StyleProps
} from "@vue-types/shared";

export interface AriaTabProps extends AriaLabelingProps {
  key: Key;
  isDisabled?: boolean;
  shouldSelectOnPressUp?: boolean;
}

export interface TabListProps<T> extends CollectionBase<T>, Omit<SingleSelection, "disallowEmptySelection" | "onSelectionChange"> {
  isDisabled?: boolean;
  onSelectionChange?: (key: Key) => void;
}

interface AriaTabListBase extends AriaLabelingProps {
  keyboardActivation?: "automatic" | "manual";
  orientation?: Orientation;
}

export interface AriaTabListProps<T> extends TabListProps<T>, AriaTabListBase, DOMProps, AriaLabelingProps {}

export interface AriaTabPanelProps extends Omit<DOMProps, "id">, AriaLabelingProps {
  id?: Key;
}

export interface SpectrumTabsProps<T> extends AriaTabListBase, Omit<SingleSelection, "onSelectionChange" | "disallowEmptySelection">, DOMProps, StyleProps {
  children: VNodeChild;
  items?: Iterable<T>;
  disabledKeys?: Iterable<Key>;
  isDisabled?: boolean;
  isQuiet?: boolean;
  isEmphasized?: boolean;
  density?: "compact" | "regular";
  onSelectionChange?: (key: Key) => void;
}

export interface SpectrumTabListProps<T> extends DOMProps, StyleProps {
  children: CollectionChildren<T>;
}

export interface SpectrumTabPanelsProps<T> extends DOMProps, StyleProps {
  children: CollectionChildren<T>;
}
