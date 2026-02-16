import type { Key } from "@vue-aria/collections";
import type { TabListState } from "@vue-stately/tabs";

export const tabsIds: WeakMap<TabListState<unknown>, string> = new WeakMap<
  TabListState<unknown>,
  string
>();

export function generateId<T>(
  state: TabListState<T> | null,
  key: Key | null | undefined,
  role: string
): string {
  if (!state) {
    return "";
  }

  let normalizedKey: Key | null | undefined = key;
  if (typeof normalizedKey === "string") {
    normalizedKey = normalizedKey.replace(/\s+/g, "");
  }

  const baseId = tabsIds.get(state as TabListState<unknown>);
  if (process.env.NODE_ENV !== "production" && !baseId) {
    console.error(
      "There is no tab id, please check if you have rendered the tab panel before the tab list."
    );
  }

  return `${baseId}-${role}-${normalizedKey}`;
}
