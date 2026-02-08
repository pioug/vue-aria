import type { Key } from "@vue-aria/types";
import type { ListBoxItem, UseListBoxStateResult } from "@vue-aria/listbox";

export interface MenuData {
  id?: string;
  onClose?: () => void;
  onAction?: (key: Key) => void;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
}

export const menuData: WeakMap<object, MenuData> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return String(key);
}

export function getMenuItemId<T extends ListBoxItem>(
  state: UseListBoxStateResult<T>,
  itemKey: Key
): string {
  const data = menuData.get(state as object);
  if (!data?.id) {
    throw new Error("Unknown menu");
  }

  return `${data.id}-item-${normalizeKey(itemKey)}`;
}
