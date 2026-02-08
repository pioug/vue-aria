import { onScopeDispose, ref } from "vue";
import { nodeContains } from "@vue-aria/utils";
import type { Key, ReadonlyRef } from "@vue-aria/types";
import type { KeyboardDelegate } from "./types";

const TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000;

export interface UseTypeSelectOptions {
  keyboardDelegate: KeyboardDelegate;
  focusedKey: ReadonlyRef<Key | null>;
  setFocusedKey: (key: Key) => void;
  onTypeSelect?: (key: Key) => void;
}

export interface UseTypeSelectResult {
  typeSelectProps: {
    onKeydownCapture?: (event: KeyboardEvent) => void;
  };
}

function getStringForKey(key: string): string {
  if (key.length === 1 || !/^[A-Z]/i.test(key)) {
    return key;
  }

  return "";
}

export function useTypeSelect(options: UseTypeSelectOptions): UseTypeSelectResult {
  const search = ref("");
  const timeoutId = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onKeydownCapture = (event: KeyboardEvent) => {
    const character = getStringForKey(event.key);
    if (
      !character ||
      event.ctrlKey ||
      event.metaKey ||
      !nodeContains(event.currentTarget as Element | null, event.target) ||
      (search.value.length === 0 && character === " ")
    ) {
      return;
    }

    if (character === " " && search.value.trim().length > 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    search.value += character;

    const { keyboardDelegate, focusedKey } = options;
    if (keyboardDelegate.getKeyForSearch) {
      let key = keyboardDelegate.getKeyForSearch(search.value, focusedKey.value ?? undefined);
      if (key === null) {
        key = keyboardDelegate.getKeyForSearch(search.value);
      }

      if (key !== null) {
        options.setFocusedKey(key);
        options.onTypeSelect?.(key);
      }
    }

    if (timeoutId.value !== undefined) {
      clearTimeout(timeoutId.value);
    }

    timeoutId.value = setTimeout(() => {
      search.value = "";
      timeoutId.value = undefined;
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  onScopeDispose(() => {
    if (timeoutId.value !== undefined) {
      clearTimeout(timeoutId.value);
    }
  });

  return {
    typeSelectProps: {
      onKeydownCapture:
        options.keyboardDelegate.getKeyForSearch === undefined
          ? undefined
          : onKeydownCapture,
    },
  };
}
