import { useGridRow, type GridRowAria, type GridRowProps } from "@vue-aria/grid";
import { useLocale } from "@vue-aria/i18n";
import { tableNestedRows } from "@vue-aria/flags";
import { mergeProps, useSyntheticLinkProps } from "@vue-aria/utils";
import type { GridNode } from "@vue-aria/grid-state";
import type { TableState, TreeGridState } from "@vue-aria/table-state";
import { getRowLabelledBy } from "./utils";

const EXPANSION_KEYS = {
  expand: {
    ltr: "ArrowRight",
    rtl: "ArrowLeft",
  },
  collapse: {
    ltr: "ArrowLeft",
    rtl: "ArrowRight",
  },
} as const;

function getLastItem<T>(iterable: Iterable<T>): T | null {
  let last: T | null = null;
  for (const item of iterable) {
    last = item;
  }
  return last;
}

export function useTableRow<T>(
  props: GridRowProps<T>,
  state: TableState<T> | TreeGridState<T>,
  ref: { current: HTMLElement | null }
): GridRowAria {
  const { node, isVirtualized } = props;
  const { rowProps, ...states } = useGridRow(props as any, state as any, ref as any);
  const { direction } = useLocale().value;

  if (isVirtualized && !(tableNestedRows() && "expandedKeys" in state)) {
    rowProps["aria-rowindex"] = node.index + 1 + state.collection.headerRows.length;
  } else {
    delete rowProps["aria-rowindex"];
  }

  let treeGridRowProps: Record<string, unknown> = {};
  if (tableNestedRows() && "expandedKeys" in state) {
    const treeNode = state.keyMap.get(node.key);
    if (treeNode != null) {
      const hasChildRows =
        !!(treeNode.props as { UNSTABLE_childItems?: Iterable<unknown> } | undefined)?.UNSTABLE_childItems
        || ((treeNode.props as { children?: unknown[] } | undefined)?.children?.length ?? 0)
          > state.userColumnCount;
      treeGridRowProps = {
        onKeydown: (event: KeyboardEvent) => {
          if (
            event.key === EXPANSION_KEYS.expand[direction]
            && state.selectionManager.focusedKey === treeNode.key
            && hasChildRows
            && state.expandedKeys !== "all"
            && !state.expandedKeys.has(treeNode.key)
          ) {
            state.toggleKey(treeNode.key);
            event.stopPropagation();
          } else if (
            event.key === EXPANSION_KEYS.collapse[direction]
            && state.selectionManager.focusedKey === treeNode.key
            && hasChildRows
            && (state.expandedKeys === "all" || state.expandedKeys.has(treeNode.key))
          ) {
            state.toggleKey(treeNode.key);
            event.stopPropagation();
          }
        },
        "aria-expanded": hasChildRows
          ? state.expandedKeys === "all" || state.expandedKeys.has(node.key)
          : undefined,
        "aria-level": treeNode.level,
        "aria-posinset": (treeNode.indexOfType ?? 0) + 1,
        "aria-setsize":
          treeNode.level > 1
            ? ((getLastItem(
                state.keyMap.get(treeNode.parentKey!)?.childNodes ?? []
              ) as GridNode<T> | null)?.indexOfType ?? 0) + 1
            : ((getLastItem(state.collection.body.childNodes) as GridNode<T> | null)?.indexOfType ?? 0)
              + 1,
      };
    }
  }

  const syntheticLinkProps = useSyntheticLinkProps(node.props);
  const linkProps = states.hasAction ? syntheticLinkProps : {};
  return {
    rowProps: {
      ...mergeProps(rowProps, treeGridRowProps, linkProps),
      "aria-labelledby": getRowLabelledBy(state as TableState<T>, node.key),
    },
    ...states,
  };
}
