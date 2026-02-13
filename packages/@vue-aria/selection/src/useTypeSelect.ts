import { onScopeDispose } from "vue";
import { nodeContains } from "@vue-aria/utils";
import type { AriaTypeSelectOptions, TypeSelectAria } from "./types";

const TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000;

export function useTypeSelect(options: AriaTypeSelectOptions): TypeSelectAria {
  const { keyboardDelegate, selectionManager, onTypeSelect } = options;
  const state: {
    search: string;
    timeout: ReturnType<typeof setTimeout> | undefined;
  } = {
    search: "",
    timeout: undefined,
  };

  const onKeydownCapture = (event: KeyboardEvent) => {
    const character = getStringForKey(event.key);
    if (
      !character ||
      event.ctrlKey ||
      event.metaKey ||
      !nodeContains(event.currentTarget as Node | null, event.target as Node | null) ||
      (state.search.length === 0 && character === " ")
    ) {
      return;
    }

    if (character === " " && state.search.trim().length > 0) {
      event.preventDefault();
      event.stopPropagation();
    }

    state.search += character;

    if (keyboardDelegate.getKeyForSearch != null) {
      let key = keyboardDelegate.getKeyForSearch(state.search, selectionManager.focusedKey ?? undefined);
      if (key == null) {
        key = keyboardDelegate.getKeyForSearch(state.search);
      }

      if (key != null) {
        selectionManager.setFocusedKey(key);
        onTypeSelect?.(key);
      }
    }

    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      state.search = "";
    }, TYPEAHEAD_DEBOUNCE_WAIT_MS);
  };

  onScopeDispose(() => {
    clearTimeout(state.timeout);
    state.search = "";
  });

  return {
    typeSelectProps: {
      onKeydownCapture: keyboardDelegate.getKeyForSearch ? onKeydownCapture : undefined,
    },
  };
}

function getStringForKey(key: string): string {
  if (key.length === 1 || !/^[A-Z]/i.test(key)) {
    return key;
  }

  return "";
}
