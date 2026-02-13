import type { Key } from "@vue-aria/collections";
import type { ListState } from "./types";

interface ListData {
  id?: string;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  onAction?: (key: Key) => void;
  linkBehavior?: "action" | "selection" | "override";
  UNSTABLE_itemBehavior?: "action" | "option";
}

export const listData: WeakMap<ListState<unknown>, ListData> = new WeakMap();

function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return `${key}`;
}

export function getItemId<T>(state: ListState<T>, itemKey: Key): string {
  const data = listData.get(state as ListState<unknown>);
  if (!data) {
    throw new Error("Unknown list");
  }

  return `${data.id}-option-${normalizeKey(itemKey)}`;
}

export function getItemCount<T>(collection: ListState<T>["collection"]): number {
  let count = 0;
  for (let key = collection.getFirstKey(); key != null; key = collection.getKeyAfter(key)) {
    count += 1;
  }
  return count;
}
