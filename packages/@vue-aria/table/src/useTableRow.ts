import { computed, ref, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { TableRowNode, UseTableStateResult } from "@vue-aria/table-state";
import { getRowElementMap, getRowId, getRowLabelledBy, tableData } from "./utils";

const FOCUSABLE_ROW_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"]):not([disabled])",
  "[contenteditable=\"true\"]",
].join(",");

export interface UseTableRowOptions<T = unknown> {
  row: TableRowNode<T>;
  rowIndex: number;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  onAction?: (key: Key) => void;
}

export interface UseTableRowResult {
  rowProps: ReadonlyRef<Record<string, unknown>>;
  isSelected: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useTableRow<T>(
  options: UseTableRowOptions<T>,
  state: UseTableStateResult<T>,
  rowRef: MaybeReactive<HTMLElement | null | undefined>
): UseTableRowResult {
  const fallbackRowId = useId(undefined, "v-aria-table-row");
  const isPressed = ref(false);

  const data = computed(() => tableData.get(state as object));
  const rowId = computed(() => {
    if (!data.value?.id) {
      return fallbackRowId.value;
    }

    return getRowId(state, options.row.key);
  });

  const isVirtualized = computed(() =>
    options.isVirtualized !== undefined
      ? resolveBoolean(options.isVirtualized)
      : Boolean(data.value?.isVirtualized)
  );

  const shouldUseVirtualFocus = computed(() => Boolean(data.value?.shouldUseVirtualFocus));

  const isDisabled = computed(() => state.selectionManager.isDisabled(options.row.key));
  const isSelected = computed(() => state.selectionManager.isSelected(options.row.key));
  const isFocused = computed(
    () =>
      state.selectionManager.isFocused.value &&
      state.selectionManager.focusedKey.value === options.row.key
  );
  const isFocusVisible = computed(() => isFocused.value);

  const rowLabelledBy = computed(() => {
    try {
      return getRowLabelledBy(state, options.row.key);
    } catch {
      return undefined;
    }
  });

  const selectRow = (): void => {
    if (isDisabled.value) {
      return;
    }

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey(options.row.key);

    if (state.selectionManager.selectionMode.value !== "none") {
      const behavior =
        state.selectionManager.selectionMode.value === "multiple"
          ? (data.value?.selectionBehavior ?? "toggle")
          : "replace";
      state.selectionManager.select(options.row.key, behavior);
    }
  };

  const triggerAction = (): void => {
    if (isDisabled.value) {
      return;
    }

    options.onAction?.(options.row.key);
    data.value?.onAction?.(options.row.key);
  };

  watchEffect((onCleanup) => {
    const element = toValue(rowRef);
    if (!element) {
      return;
    }

    const rowElements = getRowElementMap(state);
    rowElements.set(options.row.key, element);

    onCleanup(() => {
      if (rowElements.get(options.row.key) === element) {
        rowElements.delete(options.row.key);
      }
    });
  });

  const rowProps = computed<Record<string, unknown>>(() => ({
    id: rowId.value,
    role: "row",
    tabIndex: shouldUseVirtualFocus.value ? -1 : isFocused.value ? 0 : -1,
    "aria-disabled": isDisabled.value || undefined,
    "aria-selected":
      state.selectionManager.selectionMode.value === "none" ? undefined : isSelected.value,
    "aria-rowindex": options.rowIndex + 2,
    "aria-labelledby":
      rowLabelledBy.value && rowLabelledBy.value.length > 0
        ? rowLabelledBy.value
        : undefined,
    onFocus: () => {
      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(options.row.key);
    },
    onMouseEnter: () => {
      if (isDisabled.value || shouldUseVirtualFocus.value) {
        return;
      }

      state.selectionManager.setFocused(true);
      state.selectionManager.setFocusedKey(options.row.key);
    },
    onMouseDown: (event: MouseEvent) => {
      if (isDisabled.value) {
        event.preventDefault();
        return;
      }

      isPressed.value = true;
    },
    onMouseUp: () => {
      isPressed.value = false;
    },
    onMouseLeave: () => {
      isPressed.value = false;
    },
    onClick: (event: MouseEvent) => {
      isPressed.value = false;
      const rowElement = toValue(rowRef);
      if (rowElement) {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const focusableTarget = target.closest<HTMLElement>(FOCUSABLE_ROW_SELECTOR);
          if (
            focusableTarget &&
            focusableTarget !== rowElement &&
            rowElement.contains(focusableTarget)
          ) {
            return;
          }
        }
      }

      selectRow();
    },
    onDblclick: () => {
      triggerAction();
    },
    onKeydown: (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        selectRow();
      }

      if (event.key === "Enter") {
        event.preventDefault();
        triggerAction();
      }
    },
  }));

  return {
    rowProps,
    isSelected,
    isDisabled,
    isFocused,
    isFocusVisible,
    isPressed,
  };
}
