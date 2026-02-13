import { useGridCell } from "@vue-aria/grid";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useFocusable, usePress } from "@vue-aria/interactions";
import { isAndroid, mergeProps, useDescription } from "@vue-aria/utils";
import type { GridNode } from "@vue-aria/grid-state";
import type { TableState } from "@vue-aria/table-state";
import { computed, watchEffect } from "vue";
import { intlMessages } from "./intlMessages";
import { getColumnHeaderId } from "./utils";

export interface AriaTableColumnHeaderProps<T> {
  node: GridNode<T>;
  isVirtualized?: boolean;
}

export interface TableColumnHeaderAria {
  columnHeaderProps: Record<string, unknown>;
  isPressed: boolean;
}

export function useTableColumnHeader<T>(
  props: AriaTableColumnHeaderProps<T>,
  state: TableState<T>,
  ref: { current: HTMLElement | null }
): TableColumnHeaderAria {
  const { node } = props;
  const allowsSorting = !!(node.props as { allowsSorting?: boolean } | undefined)
    ?.allowsSorting;
  const { gridCellProps } = useGridCell(
    {
      ...props,
      focusMode: "child",
    } as any,
    state as any,
    ref
  );

  const isSelectionCellDisabled =
    !!(node.props as { isSelectionCell?: boolean } | undefined)?.isSelectionCell
    && state.selectionManager.selectionMode === "single";

  const { pressProps, isPressed } = usePress({
    isDisabled: !allowsSorting || isSelectionCellDisabled,
    onPress() {
      state.sort(node.key);
    },
    ref,
  });

  const { focusableProps } = useFocusable({}, ref as any);

  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/table"
  );

  const sortDirection = computed(() => state.sortDescriptor?.direction);
  const isSortedColumn = computed(() => state.sortDescriptor?.column === node.key);
  const ariaSort = computed<"none" | "ascending" | "descending" | undefined>(() => {
    if (!allowsSorting || isAndroid()) {
      return undefined;
    }

    return isSortedColumn.value ? sortDirection.value : "none";
  });

  const sortDescription = computed<string | undefined>(() => {
    if (!allowsSorting) {
      return undefined;
    }

    let description = `${stringFormatter.format("sortable")}`;
    if (isSortedColumn.value && sortDirection.value && isAndroid()) {
      description = `${description}, ${stringFormatter.format(sortDirection.value)}`;
    }
    return description;
  });

  const { descriptionProps } = useDescription(sortDescription);

  const shouldDisableFocus = computed(() => state.collection.size === 0);
  watchEffect(() => {
    if (shouldDisableFocus.value && state.selectionManager.focusedKey === node.key) {
      state.selectionManager.setFocusedKey(null);
    }
  });

  return {
    columnHeaderProps: {
      ...mergeProps(
        focusableProps,
        gridCellProps,
        pressProps,
        descriptionProps.value,
        shouldDisableFocus.value ? { tabIndex: -1 } : undefined
      ),
      role: "columnheader",
      id: getColumnHeaderId(state, node.key),
      "aria-colspan": node.colSpan && node.colSpan > 1 ? node.colSpan : undefined,
      "aria-sort": ariaSort.value,
    },
    isPressed,
  };
}
