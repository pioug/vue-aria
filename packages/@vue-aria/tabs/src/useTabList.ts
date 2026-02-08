import { computed, toValue, watchEffect } from "vue";
import { useLocale } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { TabListItem, UseTabListStateResult } from "./useTabListState";
import { setTabsId } from "./utils";

type Orientation = "horizontal" | "vertical";
type KeyboardActivation = "automatic" | "manual";

export interface UseTabListOptions {
  orientation?: MaybeReactive<Orientation | undefined>;
  keyboardActivation?: MaybeReactive<KeyboardActivation | undefined>;
  id?: MaybeReactive<string | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
}

export interface UseTabListResult {
  tabListProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveOrientation(
  value: MaybeReactive<Orientation | undefined> | undefined
): Orientation {
  if (value === undefined) {
    return "horizontal";
  }

  return toValue(value) ?? "horizontal";
}

function resolveKeyboardActivation(
  value: MaybeReactive<KeyboardActivation | undefined> | undefined
): KeyboardActivation {
  if (value === undefined) {
    return "automatic";
  }

  return toValue(value) ?? "automatic";
}

function findKeyFromEventTarget<T extends TabListItem>(
  target: EventTarget | null,
  state: UseTabListStateResult<T>
): Key | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const tabElement = target.closest<HTMLElement>("[data-v-aria-tab-key]");
  if (!tabElement) {
    return null;
  }

  const keyAttribute = tabElement.getAttribute("data-v-aria-tab-key");
  if (!keyAttribute) {
    return null;
  }

  const matched = state.collection.value.find(
    (item) => String(item.key) === keyAttribute
  );
  return matched?.key ?? null;
}

function getNextEnabledKey<T extends TabListItem>(
  state: UseTabListStateResult<T>,
  startKey: Key
): Key | null {
  const totalItems = state.collection.value.length;
  if (totalItems === 0) {
    return null;
  }

  let key: Key = startKey;
  for (let index = 0; index < totalItems; index += 1) {
    const nextKey = state.getKeyAfter(key) ?? state.getFirstKey();
    if (nextKey === null) {
      return null;
    }

    if (!state.isKeyDisabled(nextKey)) {
      return nextKey;
    }

    key = nextKey;
  }

  return null;
}

function getPreviousEnabledKey<T extends TabListItem>(
  state: UseTabListStateResult<T>,
  startKey: Key
): Key | null {
  const totalItems = state.collection.value.length;
  if (totalItems === 0) {
    return null;
  }

  let key: Key = startKey;
  for (let index = 0; index < totalItems; index += 1) {
    const previousKey = state.getKeyBefore(key) ?? state.getLastKey();
    if (previousKey === null) {
      return null;
    }

    if (!state.isKeyDisabled(previousKey)) {
      return previousKey;
    }

    key = previousKey;
  }

  return null;
}

function getFirstEnabledKey<T extends TabListItem>(
  state: UseTabListStateResult<T>
): Key | null {
  const firstKey = state.getFirstKey();
  if (firstKey === null) {
    return null;
  }

  if (!state.isKeyDisabled(firstKey)) {
    return firstKey;
  }

  return getNextEnabledKey(state, firstKey);
}

function getLastEnabledKey<T extends TabListItem>(
  state: UseTabListStateResult<T>
): Key | null {
  const lastKey = state.getLastKey();
  if (lastKey === null) {
    return null;
  }

  if (!state.isKeyDisabled(lastKey)) {
    return lastKey;
  }

  return getPreviousEnabledKey(state, lastKey);
}

function focusTab<T extends TabListItem>(
  state: UseTabListStateResult<T>,
  key: Key | null
): void {
  if (key === null) {
    return;
  }

  state.getTabElement(key)?.focus();
}

export function useTabList<T extends TabListItem>(
  options: UseTabListOptions,
  state: UseTabListStateResult<T>
): UseTabListResult {
  const locale = useLocale();
  const orientation = computed(() => resolveOrientation(options.orientation));
  const keyboardActivation = computed(() =>
    resolveKeyboardActivation(options.keyboardActivation)
  );

  const tabsId = useId(options.id, "v-aria-tabs");
  watchEffect(() => {
    setTabsId(state, tabsId.value);
  });

  const onKeydown = (event: KeyboardEvent) => {
    if (state.isDisabled.value) {
      return;
    }

    const currentKey = findKeyFromEventTarget(event.target, state);
    if (currentKey === null) {
      return;
    }

    const isRTLHorizontal =
      locale.value.direction === "rtl" && orientation.value === "horizontal";

    let nextKey: Key | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextKey = isRTLHorizontal
          ? getPreviousEnabledKey(state, currentKey)
          : getNextEnabledKey(state, currentKey);
        break;
      case "ArrowLeft":
        nextKey = isRTLHorizontal
          ? getNextEnabledKey(state, currentKey)
          : getPreviousEnabledKey(state, currentKey);
        break;
      case "ArrowDown":
        nextKey =
          orientation.value === "vertical"
            ? getNextEnabledKey(state, currentKey)
            : null;
        break;
      case "ArrowUp":
        nextKey =
          orientation.value === "vertical"
            ? getPreviousEnabledKey(state, currentKey)
            : null;
        break;
      case "Home":
        nextKey = getFirstEnabledKey(state);
        break;
      case "End":
        nextKey = getLastEnabledKey(state);
        break;
      case "Enter":
      case " ":
        if (keyboardActivation.value === "manual") {
          event.preventDefault();
          state.setSelectedKey(currentKey);
        }
        return;
      default:
        return;
    }

    if (nextKey === null) {
      return;
    }

    event.preventDefault();
    state.setFocusedKey(nextKey);
    focusTab(state, nextKey);

    if (keyboardActivation.value === "automatic") {
      state.setSelectedKey(nextKey);
    }
  };

  const tabListProps = computed<Record<string, unknown>>(() => ({
    id: tabsId.value,
    role: "tablist",
    "aria-orientation": orientation.value,
    "aria-label":
      options["aria-label"] === undefined
        ? undefined
        : toValue(options["aria-label"]),
    "aria-labelledby":
      options["aria-labelledby"] === undefined
        ? undefined
        : toValue(options["aria-labelledby"]),
    onKeydown,
  }));

  return {
    tabListProps,
  };
}
