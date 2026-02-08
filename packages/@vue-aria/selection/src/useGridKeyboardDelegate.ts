import { computed, toValue } from "vue";
import type { Key, MaybeReactive } from "@vue-aria/types";
import type { KeyboardDelegate } from "./types";

type Direction = "ltr" | "rtl";

export interface GridKeyboardCollectionItem {
  key: Key;
  rowIndex: number;
  colIndex: number;
  textValue?: string;
  isDisabled?: boolean;
}

export interface UseGridKeyboardDelegateOptions<
  T extends GridKeyboardCollectionItem = GridKeyboardCollectionItem,
> {
  collection: MaybeReactive<Iterable<T> | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  collator?: MaybeReactive<Intl.Collator | undefined>;
}

interface GridRows<T extends GridKeyboardCollectionItem> {
  orderedItems: T[];
  rowOrder: number[];
  rowMap: Map<number, T[]>;
  itemMap: Map<Key, T>;
}

function resolveDirection(value: MaybeReactive<Direction | undefined> | undefined): Direction {
  if (value === undefined) {
    return "ltr";
  }

  return toValue(value) ?? "ltr";
}

function toCollectionArray<T extends GridKeyboardCollectionItem>(
  value: Iterable<T> | undefined
): T[] {
  if (!value) {
    return [];
  }

  return Array.from(value);
}

function toDisabledSet(value: Iterable<Key> | undefined): Set<Key> {
  if (!value) {
    return new Set();
  }

  return new Set(value);
}

function buildRows<T extends GridKeyboardCollectionItem>(
  collection: T[]
): GridRows<T> {
  const rowMap = new Map<number, T[]>();
  const itemMap = new Map<Key, T>();

  for (const item of collection) {
    itemMap.set(item.key, item);

    const row = rowMap.get(item.rowIndex);
    if (row) {
      row.push(item);
      continue;
    }

    rowMap.set(item.rowIndex, [item]);
  }

  for (const [, rowItems] of rowMap) {
    rowItems.sort((a, b) => a.colIndex - b.colIndex);
  }

  const rowOrder = Array.from(rowMap.keys()).sort((a, b) => a - b);
  const orderedItems = rowOrder.flatMap((rowIndex) => rowMap.get(rowIndex) ?? []);

  return {
    orderedItems,
    rowOrder,
    rowMap,
    itemMap,
  };
}

function findFirstEnabledInRow<T extends GridKeyboardCollectionItem>(
  rowItems: T[],
  isDisabled: (item: T) => boolean
): Key | null {
  for (const rowItem of rowItems) {
    if (!isDisabled(rowItem)) {
      return rowItem.key;
    }
  }

  return null;
}

function findEnabledByColumn<T extends GridKeyboardCollectionItem>(
  rowItems: T[],
  targetColumn: number,
  isDisabled: (item: T) => boolean
): Key | null {
  for (const rowItem of rowItems) {
    if (rowItem.colIndex === targetColumn && !isDisabled(rowItem)) {
      return rowItem.key;
    }
  }

  return null;
}

export function useGridKeyboardDelegate<T extends GridKeyboardCollectionItem>(
  options: UseGridKeyboardDelegateOptions<T>
): KeyboardDelegate {
  const collection = computed<T[]>(() => toCollectionArray(toValue(options.collection)));
  const rows = computed<GridRows<T>>(() => buildRows(collection.value));
  const disabledKeys = computed<Set<Key>>(() =>
    toDisabledSet(
      options.disabledKeys === undefined ? undefined : toValue(options.disabledKeys)
    )
  );
  const direction = computed(() => resolveDirection(options.direction));
  const collator = computed(
    () => options.collator === undefined ? undefined : toValue(options.collator)
  );

  const getItem = (key: Key): T | undefined => rows.value.itemMap.get(key);
  const isDisabled = (item: T): boolean =>
    disabledKeys.value.has(item.key) || Boolean(item.isDisabled);

  const getFirstKey = (): Key | null => {
    for (const item of rows.value.orderedItems) {
      if (!isDisabled(item)) {
        return item.key;
      }
    }

    return null;
  };

  const getLastKey = (): Key | null => {
    for (let index = rows.value.orderedItems.length - 1; index >= 0; index -= 1) {
      const item = rows.value.orderedItems[index];
      if (!isDisabled(item)) {
        return item.key;
      }
    }

    return null;
  };

  const getKeyRightOf = (key: Key): Key | null => {
    const item = getItem(key);
    if (!item) {
      return null;
    }

    const rowItems = rows.value.rowMap.get(item.rowIndex) ?? [];
    const index = rowItems.findIndex((rowItem) => rowItem.key === item.key);
    if (index < 0) {
      return null;
    }

    const step = direction.value === "rtl" ? -1 : 1;
    for (
      let cursor = index + step;
      cursor >= 0 && cursor < rowItems.length;
      cursor += step
    ) {
      const candidate = rowItems[cursor];
      if (!isDisabled(candidate)) {
        return candidate.key;
      }
    }

    return null;
  };

  const getKeyLeftOf = (key: Key): Key | null => {
    const item = getItem(key);
    if (!item) {
      return null;
    }

    const rowItems = rows.value.rowMap.get(item.rowIndex) ?? [];
    const index = rowItems.findIndex((rowItem) => rowItem.key === item.key);
    if (index < 0) {
      return null;
    }

    const step = direction.value === "rtl" ? 1 : -1;
    for (
      let cursor = index + step;
      cursor >= 0 && cursor < rowItems.length;
      cursor += step
    ) {
      const candidate = rowItems[cursor];
      if (!isDisabled(candidate)) {
        return candidate.key;
      }
    }

    return null;
  };

  const getKeyAbove = (key: Key): Key | null => {
    const item = getItem(key);
    if (!item) {
      return null;
    }

    const rowPosition = rows.value.rowOrder.findIndex((rowIndex) => rowIndex === item.rowIndex);
    if (rowPosition < 0) {
      return null;
    }

    for (let cursor = rowPosition - 1; cursor >= 0; cursor -= 1) {
      const rowIndex = rows.value.rowOrder[cursor];
      const rowItems = rows.value.rowMap.get(rowIndex);
      if (!rowItems) {
        continue;
      }

      const candidate = findEnabledByColumn(rowItems, item.colIndex, isDisabled);
      if (candidate !== null) {
        return candidate;
      }
    }

    for (let cursor = rowPosition - 1; cursor >= 0; cursor -= 1) {
      const rowIndex = rows.value.rowOrder[cursor];
      const rowItems = rows.value.rowMap.get(rowIndex);
      if (!rowItems) {
        continue;
      }

      const candidate = findFirstEnabledInRow(rowItems, isDisabled);
      if (candidate !== null) {
        return candidate;
      }
    }

    return null;
  };

  const getKeyBelow = (key: Key): Key | null => {
    const item = getItem(key);
    if (!item) {
      return null;
    }

    const rowPosition = rows.value.rowOrder.findIndex((rowIndex) => rowIndex === item.rowIndex);
    if (rowPosition < 0) {
      return null;
    }

    for (let cursor = rowPosition + 1; cursor < rows.value.rowOrder.length; cursor += 1) {
      const rowIndex = rows.value.rowOrder[cursor];
      const rowItems = rows.value.rowMap.get(rowIndex);
      if (!rowItems) {
        continue;
      }

      const candidate = findEnabledByColumn(rowItems, item.colIndex, isDisabled);
      if (candidate !== null) {
        return candidate;
      }
    }

    for (let cursor = rowPosition + 1; cursor < rows.value.rowOrder.length; cursor += 1) {
      const rowIndex = rows.value.rowOrder[cursor];
      const rowItems = rows.value.rowMap.get(rowIndex);
      if (!rowItems) {
        continue;
      }

      const candidate = findFirstEnabledInRow(rowItems, isDisabled);
      if (candidate !== null) {
        return candidate;
      }
    }

    return null;
  };

  const getKeyForSearch = (search: string, fromKey?: Key): Key | null => {
    const activeCollator =
      collator.value ??
      new Intl.Collator(undefined, { usage: "search", sensitivity: "base" });

    if (rows.value.orderedItems.length === 0) {
      return null;
    }

    const startIndex =
      fromKey === undefined
        ? 0
        : rows.value.orderedItems.findIndex((item) => item.key === fromKey) + 1;

    const normalizedStartIndex = startIndex < 0 ? 0 : startIndex;

    for (let offset = 0; offset < rows.value.orderedItems.length; offset += 1) {
      const index = (normalizedStartIndex + offset) % rows.value.orderedItems.length;
      const item = rows.value.orderedItems[index];
      if (isDisabled(item)) {
        continue;
      }

      const textValue = item.textValue ?? "";
      if (textValue.length === 0) {
        continue;
      }

      const substring = textValue.slice(0, search.length);
      if (activeCollator.compare(substring, search) === 0) {
        return item.key;
      }
    }

    return null;
  };

  return {
    getKeyAbove,
    getKeyBelow,
    getKeyLeftOf,
    getKeyRightOf,
    getFirstKey,
    getLastKey,
    getKeyForSearch,
  };
}
