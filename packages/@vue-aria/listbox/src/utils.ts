import type { Key } from "@vue-aria/types";
import type {
  ListBoxItem,
  SelectionBehavior,
  UseListBoxStateResult,
} from "./useListBoxState";

export interface ListData {
  id?: string;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  onAction?: (key: Key) => void;
  selectionBehavior?: SelectionBehavior;
}

export const listData: WeakMap<object, ListData> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return String(key);
}

export function getItemId<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>,
  itemKey: Key
): string {
  const data = listData.get(state as object);
  if (!data || !data.id) {
    throw new Error("Unknown list");
  }

  return `${data.id}-option-${normalizeKey(itemKey)}`;
}
