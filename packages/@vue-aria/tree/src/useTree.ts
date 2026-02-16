import { useGridList, type AriaGridListOptions, type AriaGridListProps, type GridListProps } from "@vue-aria/gridlist";
import type { KeyboardDelegate } from "@vue-aria/selection";
import type { TreeState } from "@vue-stately/tree";

export interface TreeProps<T> extends GridListProps<T> {}

export interface AriaTreeProps<T> extends Omit<AriaGridListProps<T>, "keyboardNavigationBehavior"> {}

export interface AriaTreeOptions<T> extends Omit<AriaGridListOptions<T>, "children" | "shouldFocusWrap"> {
  keyboardDelegate?: KeyboardDelegate;
}

export interface TreeAria {
  gridProps: Record<string, unknown>;
}

/**
 * Provides treegrid semantics for tree collections.
 */
export function useTree<T>(
  props: AriaTreeOptions<T>,
  state: TreeState<T>,
  ref: { current: HTMLElement | null }
): TreeAria {
  const { gridProps } = useGridList(props, state as any, ref);
  gridProps.role = "treegrid";

  return {
    gridProps,
  };
}
