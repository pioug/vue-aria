import type { GridCollectionType, GridState } from "@vue-stately/grid";
import type { Key } from "@vue-aria/collections";
import type { KeyboardDelegate } from "@vue-aria/selection";

interface GridMapShared {
  keyboardDelegate?: KeyboardDelegate;
  actions: {
    onRowAction?: (key: Key) => void;
    onCellAction?: (key: Key) => void;
  };
  shouldSelectOnPressUp?: boolean;
}

export const gridMap: WeakMap<
  GridState<unknown, GridCollectionType<unknown>>,
  GridMapShared
> = new WeakMap<GridState<unknown, GridCollectionType<unknown>>, GridMapShared>();
