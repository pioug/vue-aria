import { chain } from "@vue-aria/utils";
import { useSelectableItem, type SelectableItemStates } from "@vue-aria/selection";
import type { GridCollectionType, GridNode, GridState } from "@vue-stately/grid";
import { gridMap } from "./utils";

export interface GridRowProps<T> {
  node: GridNode<T>;
  isVirtualized?: boolean;
  shouldSelectOnPressUp?: boolean;
  onAction?: () => void;
}

export interface GridRowAria extends SelectableItemStates {
  rowProps: Record<string, unknown>;
  isPressed: boolean;
}

export function useGridRow<
  T,
  C extends GridCollectionType<T>,
  S extends GridState<T, C>
>(
  props: GridRowProps<T>,
  state: S,
  ref: { current: HTMLElement | null }
): GridRowAria {
  const { node, isVirtualized, shouldSelectOnPressUp, onAction } = props;

  const gridData = gridMap.get(state as unknown as GridState<unknown, GridCollectionType<unknown>>);
  const actions = gridData?.actions ?? {};
  const gridShouldSelectOnPressUp = gridData?.shouldSelectOnPressUp;
  const onRowAction = actions.onRowAction ? () => actions.onRowAction?.(node.key) : onAction;
  const { itemProps, ...states } = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    shouldSelectOnPressUp: gridShouldSelectOnPressUp || shouldSelectOnPressUp,
    onAction:
      onRowAction || node?.props?.onAction
        ? chain(
          node?.props?.onAction as (() => void) | undefined,
          onRowAction
        )
        : undefined,
    isDisabled: state.collection.size === 0,
  });

  const rowProps: Record<string, unknown> = {
    ...itemProps,
    role: "row",
    get "aria-selected"() {
      return state.selectionManager.selectionMode !== "none"
        ? state.selectionManager.isSelected(node.key)
        : undefined;
    },
    get "aria-disabled"() {
      return (state.collection.size === 0 || state.selectionManager.isDisabled(node.key))
        || undefined;
    },
  };

  if (isVirtualized) {
    rowProps["aria-rowindex"] = node.index + 1;
  }

  return {
    rowProps,
    ...states,
  };
}
