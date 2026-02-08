import { computed, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  TableCell,
  TableColumn,
  TableRowNode,
  UseTableStateResult,
} from "@vue-aria/table-state";
import { getCellId } from "./utils";

export interface UseTableCellOptions<T = unknown> {
  row: TableRowNode<T>;
  column: TableColumn;
  columnIndex: number;
  cell?: TableCell | undefined;
  colSpan?: MaybeReactive<number | undefined>;
  onAction?: () => void;
}

export interface UseTableCellResult {
  gridCellProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
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

export function useTableCell<T>(
  options: UseTableCellOptions<T>,
  state: UseTableStateResult<T>,
  _cellRef: MaybeReactive<HTMLElement | null | undefined>
): UseTableCellResult {
  const isPressed = ref(false);

  const colSpan = computed(() => {
    const fromOption = resolveNumber(options.colSpan);
    if (fromOption !== undefined) {
      return fromOption;
    }

    return options.column.colSpan;
  });

  const isRowHeader = computed(() =>
    state.collection.value.rowHeaderColumnKeys.has(options.column.key)
  );

  const gridCellProps = computed<Record<string, unknown>>(() => ({
    id: isRowHeader.value
      ? getCellId(state, options.row.key, options.column.key)
      : undefined,
    role: isRowHeader.value ? "rowheader" : "gridcell",
    "aria-colindex": options.columnIndex + 1,
    "aria-colspan": colSpan.value && colSpan.value > 1 ? colSpan.value : undefined,
    onMouseDown: () => {
      isPressed.value = true;
    },
    onMouseUp: () => {
      isPressed.value = false;
    },
    onMouseLeave: () => {
      isPressed.value = false;
    },
    onDblclick: () => {
      options.onAction?.();
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        options.onAction?.();
      }
    },
  }));

  return {
    gridCellProps,
    isPressed,
  };
}
