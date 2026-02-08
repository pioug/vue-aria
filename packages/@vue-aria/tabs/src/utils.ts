import type { Key } from "@vue-aria/types";
import type { TabListItem, UseTabListStateResult } from "./useTabListState";

const tabsIds = new WeakMap<object, string>();

export function setTabsId(
  state: UseTabListStateResult<TabListItem>,
  id: string
): void {
  tabsIds.set(state as object, id);
}

export function generateId<T extends TabListItem>(
  state: UseTabListStateResult<T> | null,
  key: Key | null | undefined,
  role: "tab" | "tabpanel"
): string {
  if (!state) {
    return "";
  }

  let normalizedKey = key;
  if (typeof normalizedKey === "string") {
    normalizedKey = normalizedKey.replace(/\s+/g, "");
  }

  const baseId = tabsIds.get(state as object);
  if (!baseId) {
    return "";
  }

  return `${baseId}-${role}-${String(normalizedKey)}`;
}
