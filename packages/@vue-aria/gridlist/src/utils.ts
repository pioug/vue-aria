import type { Key } from "@vue-aria/collections";

interface ListMapShared {
  id: string;
  onAction?: (key: Key) => void;
  linkBehavior?: "action" | "selection" | "override";
  keyboardNavigationBehavior: "arrow" | "tab";
  shouldSelectOnPressUp?: boolean;
}

// Shared id/action metadata between grid list root and item-level hooks.
export const listMap: WeakMap<object, ListMapShared> = new WeakMap<object, ListMapShared>();

export function getRowId(state: object, key: Key): string {
  const { id } = listMap.get(state) ?? {};
  if (!id) {
    throw new Error("Unknown list");
  }

  return `${id}-${normalizeKey(key)}`;
}

export function normalizeKey(key: Key): string {
  if (typeof key === "string") {
    return key.replace(/\s*/g, "");
  }

  return `${key}`;
}
