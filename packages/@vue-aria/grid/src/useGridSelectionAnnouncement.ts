import { announce } from "@vue-aria/live-announcer";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useUpdateEffect } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";
import type { SelectionValue } from "@vue-aria/selection-state";
import { ref } from "vue";
import { intlMessages } from "./intlMessages";

export interface GridSelectionAnnouncementProps {
  getRowText?: (key: Key) => string;
}

interface GridSelectionState<T> {
  collection: {
    getItem(key: Key): { textValue?: string } | null;
    getTextValue?: (key: Key) => string;
  };
  disabledKeys: Set<Key>;
  selectionManager: {
    rawSelection: SelectionValue;
    selectedKeys: Set<Key>;
    selectionBehavior: "replace" | "toggle";
    selectionMode: "none" | "single" | "multiple";
    isFocused: boolean;
  };
}

export function useGridSelectionAnnouncement<T>(
  props: GridSelectionAnnouncementProps,
  state: GridSelectionState<T>
): void {
  const getRowText =
    props.getRowText
    || ((key: Key) =>
      state.collection.getTextValue?.(key)
      ?? state.collection.getItem(key)?.textValue
      ?? "");
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any);

  const lastSelection = ref<SelectionValue>(state.selectionManager.rawSelection);

  const isSelectAllOrMultiple = (selection: SelectionValue): boolean =>
    selection === "all" || selection.size > 1;

  const announceSelectionChange = () => {
    const selection = state.selectionManager.rawSelection;
    if (!state.selectionManager.isFocused || selection === lastSelection.value) {
      lastSelection.value = selection;
      return;
    }

    const addedKeys = diffSelection(selection, lastSelection.value);
    const removedKeys = diffSelection(lastSelection.value, selection);

    const isReplace = state.selectionManager.selectionBehavior === "replace";
    const messages: string[] = [];

    if (state.selectionManager.selectedKeys.size === 1 && isReplace) {
      const firstKey = state.selectionManager.selectedKeys.keys().next().value;
      if (firstKey != null && state.collection.getItem(firstKey)) {
        const currentSelectionText = getRowText(firstKey);
        if (currentSelectionText) {
          messages.push(
            stringFormatter.format("selectedItem", { item: currentSelectionText } as any)
          );
        }
      }
    } else if (addedKeys.size === 1 && removedKeys.size === 0) {
      const firstKey = addedKeys.keys().next().value;
      if (firstKey != null) {
        const addedText = getRowText(firstKey);
        if (addedText) {
          messages.push(
            stringFormatter.format("selectedItem", { item: addedText } as any)
          );
        }
      }
    } else if (removedKeys.size === 1 && addedKeys.size === 0) {
      const firstKey = removedKeys.keys().next().value;
      if (firstKey != null && state.collection.getItem(firstKey)) {
        const removedText = getRowText(firstKey);
        if (removedText) {
          messages.push(
            stringFormatter.format("deselectedItem", { item: removedText } as any)
          );
        }
      }
    }

    if (state.selectionManager.selectionMode === "multiple") {
      if (
        messages.length === 0
        || isSelectAllOrMultiple(selection)
        || isSelectAllOrMultiple(lastSelection.value)
      ) {
        messages.push(
          selection === "all"
            ? stringFormatter.format("selectedAll")
            : stringFormatter.format("selectedCount", { count: selection.size } as any)
        );
      }
    }

    if (messages.length > 0) {
      announce(messages.join(" "));
    }

    lastSelection.value = selection;
  };

  useUpdateEffect(
    () => {
      if (state.selectionManager.isFocused) {
        announceSelectionChange();
      } else {
        const raf = requestAnimationFrame(announceSelectionChange);
        return () => cancelAnimationFrame(raf);
      }
    },
    [() => state.selectionManager.rawSelection, () => state.selectionManager.isFocused]
  );
}

function diffSelection(a: SelectionValue, b: SelectionValue): Set<Key> {
  const result = new Set<Key>();
  if (a === "all" || b === "all") {
    return result;
  }

  for (const key of a.keys()) {
    if (!b.has(key)) {
      result.add(key);
    }
  }

  return result;
}
