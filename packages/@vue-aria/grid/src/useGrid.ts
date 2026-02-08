import type { MaybeReactive } from "@vue-aria/types";
import type { Key } from "@vue-aria/types";
import type { UseTableStateResult } from "@vue-aria/table-state";
import {
  useTable,
  type UseTableOptions,
  type UseTableResult,
} from "@vue-aria/table";

export interface UseGridOptions extends Omit<UseTableOptions, "onAction"> {
  onAction?: (key: Key) => void;
  onRowAction?: (key: Key) => void;
  onCellAction?: (key: Key) => void;
  isVirtualized?: MaybeReactive<boolean | undefined>;
}

export interface UseGridResult extends UseTableResult {}

export function useGrid<T>(
  options: UseGridOptions,
  state: UseTableStateResult<T>,
  gridRef: MaybeReactive<HTMLElement | null | undefined>
): UseGridResult {
  const { onAction, onRowAction, onCellAction: _onCellAction, ...restOptions } = options;

  return useTable(
    {
      ...restOptions,
      onAction: onRowAction ?? onAction,
    },
    state,
    gridRef
  );
}
