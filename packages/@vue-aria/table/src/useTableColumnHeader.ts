import { computed, ref, toValue } from "vue";
import { useDescription, mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  TableColumn,
  UseTableStateResult,
} from "@vue-aria/table-state";
import { getColumnHeaderId } from "./utils";

export interface UseTableColumnHeaderOptions {
  column: TableColumn;
  columnIndex: number;
  allowsSorting?: MaybeReactive<boolean | undefined>;
  colSpan?: MaybeReactive<number | undefined>;
}

export interface UseTableColumnHeaderResult {
  columnHeaderProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function resolveNumber(value: MaybeReactive<number | undefined> | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const resolved = toValue(value);
  if (resolved === undefined || Number.isNaN(resolved)) {
    return undefined;
  }

  return resolved;
}

export function useTableColumnHeader<T>(
  options: UseTableColumnHeaderOptions,
  state: UseTableStateResult<T>,
  _headerRef: MaybeReactive<HTMLElement | null | undefined>
): UseTableColumnHeaderResult {
  const fallbackId = useId(undefined, "v-aria-table-column");
  const isPressed = ref(false);

  const allowsSorting = computed(() => {
    if (options.allowsSorting !== undefined) {
      return resolveBoolean(options.allowsSorting);
    }

    return Boolean(options.column.allowsSorting);
  });

  const isSelectionCellDisabled = computed(
    () =>
      Boolean(options.column.isSelectionCell) &&
      state.selectionManager.selectionMode.value === "single"
  );

  const isSortedColumn = computed(
    () => state.sortDescriptor.value?.column === options.column.key
  );
  const sortDirection = computed(() => state.sortDescriptor.value?.direction);

  const ariaSort = computed(() => {
    if (!allowsSorting.value) {
      return undefined;
    }

    if (isSortedColumn.value && sortDirection.value) {
      return sortDirection.value;
    }

    return undefined;
  });

  const sortDescription = computed(() => {
    if (!allowsSorting.value) {
      return undefined;
    }

    if (isSortedColumn.value && sortDirection.value) {
      return `Sortable, sorted ${sortDirection.value}.`;
    }

    return "Sortable.";
  });

  const { descriptionProps } = useDescription(sortDescription);

  const colSpan = computed(() => {
    const fromOption = resolveNumber(options.colSpan);
    if (fromOption !== undefined) {
      return fromOption;
    }

    return options.column.colSpan;
  });

  const shouldDisableFocus = computed(() => state.collection.value.size === 0);

  const onSort = () => {
    if (!allowsSorting.value || isSelectionCellDisabled.value) {
      return;
    }

    state.sort(options.column.key);
  };

  const columnHeaderProps = computed<Record<string, unknown>>(() => {
    let columnId: string;
    try {
      columnId = getColumnHeaderId(state, options.column.key);
    } catch {
      columnId = fallbackId.value;
    }

    return mergeProps(descriptionProps.value, {
      role: "columnheader",
      id: columnId,
      tabIndex: shouldDisableFocus.value ? -1 : undefined,
      "aria-colindex": options.columnIndex + 1,
      "aria-colspan": colSpan.value && colSpan.value > 1 ? colSpan.value : undefined,
      "aria-sort": ariaSort.value,
      onMouseDown: () => {
        isPressed.value = true;
      },
      onMouseUp: () => {
        isPressed.value = false;
      },
      onMouseLeave: () => {
        isPressed.value = false;
      },
      onClick: () => {
        isPressed.value = false;
        onSort();
      },
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSort();
        }
      },
    });
  });

  return {
    columnHeaderProps,
    isPressed,
  };
}
