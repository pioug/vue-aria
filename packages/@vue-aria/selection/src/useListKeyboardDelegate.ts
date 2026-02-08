import { computed, toValue } from "vue";
import type { Key, MaybeReactive } from "@vue-aria/types";
import type { KeyboardDelegate } from "./types";

export interface KeyboardCollectionItem {
  key: Key;
  textValue?: string;
  isDisabled?: boolean;
}

type Orientation = "vertical" | "horizontal";
type Direction = "ltr" | "rtl";

export interface UseListKeyboardDelegateOptions<
  T extends KeyboardCollectionItem = KeyboardCollectionItem,
> {
  collection: MaybeReactive<Iterable<T> | undefined>;
  disabledKeys?: MaybeReactive<Iterable<Key> | undefined>;
  orientation?: MaybeReactive<Orientation | undefined>;
  direction?: MaybeReactive<Direction | undefined>;
  collator?: MaybeReactive<Intl.Collator | undefined>;
}

function resolveOrientation(
  value: MaybeReactive<Orientation | undefined> | undefined
): Orientation {
  if (value === undefined) {
    return "vertical";
  }

  return toValue(value) ?? "vertical";
}

function resolveDirection(
  value: MaybeReactive<Direction | undefined> | undefined
): Direction {
  if (value === undefined) {
    return "ltr";
  }

  return toValue(value) ?? "ltr";
}

function toCollectionArray<T extends KeyboardCollectionItem>(
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

export function useListKeyboardDelegate<T extends KeyboardCollectionItem>(
  options: UseListKeyboardDelegateOptions<T>
): KeyboardDelegate {
  const collection = computed<T[]>(() => toCollectionArray(toValue(options.collection)));
  const disabledKeys = computed<Set<Key>>(() =>
    toDisabledSet(
      options.disabledKeys === undefined ? undefined : toValue(options.disabledKeys)
    )
  );
  const orientation = computed(() => resolveOrientation(options.orientation));
  const direction = computed(() => resolveDirection(options.direction));
  const collator = computed(
    () => options.collator === undefined ? undefined : toValue(options.collator)
  );

  const getItem = (key: Key): T | undefined =>
    collection.value.find((item) => item.key === key);
  const isDisabled = (key: Key): boolean => {
    const item = getItem(key);
    return disabledKeys.value.has(key) || Boolean(item?.isDisabled);
  };
  const getFirstKey = (): Key | null => collection.value[0]?.key ?? null;
  const getLastKey = (): Key | null =>
    collection.value[collection.value.length - 1]?.key ?? null;
  const getKeyAfter = (key: Key): Key | null => {
    const index = collection.value.findIndex((item) => item.key === key);
    if (index < 0 || index + 1 >= collection.value.length) {
      return null;
    }

    return collection.value[index + 1]?.key ?? null;
  };
  const getKeyBefore = (key: Key): Key | null => {
    const index = collection.value.findIndex((item) => item.key === key);
    if (index <= 0) {
      return null;
    }

    return collection.value[index - 1]?.key ?? null;
  };

  const findNextNonDisabled = (
    key: Key | null,
    getNext: (current: Key) => Key | null
  ): Key | null => {
    let nextKey = key;
    while (nextKey !== null) {
      if (!isDisabled(nextKey)) {
        return nextKey;
      }

      nextKey = getNext(nextKey);
    }

    return null;
  };

  const getNextKey = (key: Key): Key | null =>
    findNextNonDisabled(
      getKeyAfter(key),
      (currentKey) => getKeyAfter(currentKey)
    );
  const getPreviousKey = (key: Key): Key | null =>
    findNextNonDisabled(
      getKeyBefore(key),
      (currentKey) => getKeyBefore(currentKey)
    );

  const getKeyAbove = (key: Key): Key | null => {
    if (orientation.value === "horizontal") {
      return null;
    }

    return getPreviousKey(key);
  };

  const getKeyBelow = (key: Key): Key | null => {
    if (orientation.value === "horizontal") {
      return null;
    }

    return getNextKey(key);
  };

  const getKeyRightOf = (key: Key): Key | null => {
    if (orientation.value === "vertical") {
      return null;
    }

    return direction.value === "rtl" ? getPreviousKey(key) : getNextKey(key);
  };

  const getKeyLeftOf = (key: Key): Key | null => {
    if (orientation.value === "vertical") {
      return null;
    }

    return direction.value === "rtl" ? getNextKey(key) : getPreviousKey(key);
  };

  const getKeyForSearch = (search: string, fromKey?: Key): Key | null => {
    const activeCollator =
      collator.value ??
      new Intl.Collator(undefined, { usage: "search", sensitivity: "base" });

    let key = fromKey ?? getFirstKey();
    while (key !== null) {
      const item = getItem(key);
      if (!item) {
        return null;
      }

      const textValue = item.textValue ?? "";
      if (textValue.length > 0 && !isDisabled(key)) {
        const substring = textValue.slice(0, search.length);
        if (activeCollator.compare(substring, search) === 0) {
          return key;
        }
      }

      key = getNextKey(key);
    }

    return null;
  };

  return {
    getKeyAbove,
    getKeyBelow,
    getKeyLeftOf,
    getKeyRightOf,
    getFirstKey: () =>
      findNextNonDisabled(getFirstKey(), (currentKey) => getKeyAfter(currentKey)),
    getLastKey: () =>
      findNextNonDisabled(getLastKey(), (currentKey) => getKeyBefore(currentKey)),
    getKeyForSearch,
  };
}
