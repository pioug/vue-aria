import { computed, ref, toValue, watchEffect } from "vue";
import { useId } from "@vue-aria/ssr";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { TreeCollectionNode, UseTreeStateResult } from "@vue-aria/tree-state";
import { getRowElementMap, getTreeCellId, getTreeRowId, treeData } from "./utils";

export interface UseTreeItemOptions<T = unknown> {
  node: TreeCollectionNode<T>;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isSelected?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  onAction?: (key: Key) => void;
}

export interface UseTreeItemResult {
  rowProps: ReadonlyRef<Record<string, unknown>>;
  gridCellProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  expandButtonProps: ReadonlyRef<Record<string, unknown>>;
  isExpanded: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useTreeItem<T>(
  options: UseTreeItemOptions<T>,
  state: UseTreeStateResult<T>,
  rowRef: MaybeReactive<HTMLElement | null | undefined>
): UseTreeItemResult {
  const descriptionId = useId(undefined, "v-aria-tree-description");
  const fallbackRowId = useId(undefined, "v-aria-tree-row");
  const fallbackCellId = useId(undefined, "v-aria-tree-cell");
  const isPressed = ref(false);

  const data = computed(() => treeData.get(state as object));

  const rowId = computed<string>(() => {
    if (!data.value?.id) {
      return fallbackRowId.value;
    }

    return getTreeRowId(state, options.node.key);
  });

  const cellId = computed<string>(() => {
    if (!data.value?.id) {
      return fallbackCellId.value;
    }

    return getTreeCellId(state, options.node.key);
  });

  const isDisabled = computed(() => {
    if (options.isDisabled !== undefined) {
      return resolveBoolean(options.isDisabled);
    }

    return state.selectionManager.isDisabled(options.node.key);
  });

  const isSelected = computed(() => {
    if (options.isSelected !== undefined) {
      return resolveBoolean(options.isSelected);
    }

    return state.selectionManager.isSelected(options.node.key);
  });

  const isExpanded = computed(() => {
    if (!options.node.hasChildNodes) {
      return false;
    }

    if (options.node.type === "section") {
      return true;
    }

    return state.expandedKeys.value.has(options.node.key);
  });

  const isVirtualized = computed(() =>
    options.isVirtualized !== undefined
      ? resolveBoolean(options.isVirtualized)
      : Boolean(data.value?.isVirtualized)
  );

  const shouldUseVirtualFocus = computed(() => Boolean(data.value?.shouldUseVirtualFocus));
  const isFocused = computed(
    () =>
      state.selectionManager.isFocused.value &&
      state.selectionManager.focusedKey.value === options.node.key
  );
  const isFocusVisible = computed(() => isFocused.value);

  const siblingMetadata = computed(() => {
    const siblings =
      options.node.parentKey === null
        ? state.collection.value.getChildren(null)
        : state.collection.value.getChildren(options.node.parentKey);

    const index = siblings.findIndex((node) => node.key === options.node.key);

    return {
      index,
      size: siblings.length,
    };
  });

  const performAction = (): void => {
    if (isDisabled.value) {
      return;
    }

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey(options.node.key);

    if (state.selectionManager.selectionMode.value !== "none") {
      const behavior =
        state.selectionManager.selectionMode.value === "multiple"
          ? (data.value?.selectionBehavior ?? "toggle")
          : "replace";
      state.selectionManager.select(options.node.key, behavior);
    }

    options.onAction?.(options.node.key);
    data.value?.onAction?.(options.node.key);
  };

  const toggleExpand = (): void => {
    if (
      !options.node.hasChildNodes ||
      options.node.type === "section" ||
      isDisabled.value
    ) {
      return;
    }

    state.toggleKey(options.node.key);
    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey(options.node.key);
  };

  watchEffect((onCleanup) => {
    const element = toValue(rowRef);
    if (!element) {
      return;
    }

    const rowElements = getRowElementMap(state);
    rowElements.set(options.node.key, element);

    onCleanup(() => {
      if (rowElements.get(options.node.key) === element) {
        rowElements.delete(options.node.key);
      }
    });
  });

  const rowProps = computed<Record<string, unknown>>(() => {
    const props: Record<string, unknown> = {
      id: rowId.value,
      role: "row",
      tabIndex: shouldUseVirtualFocus.value ? -1 : isFocused.value ? 0 : -1,
      "aria-label":
        options["aria-label"] === undefined ? undefined : toValue(options["aria-label"]),
      "aria-selected":
        state.selectionManager.selectionMode.value === "none" ? undefined : isSelected.value,
      "aria-disabled": isDisabled.value || undefined,
      "aria-expanded":
        options.node.hasChildNodes && options.node.type !== "section"
          ? isExpanded.value
          : undefined,
      "aria-level": options.node.level,
      "aria-describedby": descriptionId.value,
      onFocus: () => {
        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(options.node.key);
      },
      onMouseEnter: () => {
        if (isDisabled.value || shouldUseVirtualFocus.value) {
          return;
        }

        state.selectionManager.setFocused(true);
        state.selectionManager.setFocusedKey(options.node.key);
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
      onClick: () => {
        isPressed.value = false;
        performAction();
      },
    };

    if (isVirtualized.value) {
      props["aria-posinset"] =
        siblingMetadata.value.index >= 0 ? siblingMetadata.value.index + 1 : undefined;
      props["aria-setsize"] =
        siblingMetadata.value.size > 0 ? siblingMetadata.value.size : undefined;
    }

    return props;
  });

  const gridCellProps = computed<Record<string, unknown>>(() => ({
    id: cellId.value,
    role: "gridcell",
    "aria-colindex": 1,
  }));

  const descriptionProps = computed<Record<string, unknown>>(() => ({
    id: descriptionId.value,
  }));

  const expandButtonProps = computed<Record<string, unknown>>(() => ({
    onPress: toggleExpand,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      toggleExpand();
    },
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    "data-react-aria-prevent-focus": true,
    "aria-label": isExpanded.value ? "Collapse" : "Expand",
    "aria-labelledby": rowId.value,
    "aria-disabled":
      !options.node.hasChildNodes || options.node.type === "section" || isDisabled.value
        ? "true"
        : undefined,
  }));

  return {
    rowProps,
    gridCellProps,
    descriptionProps,
    expandButtonProps,
    isExpanded,
    isSelected,
    isFocused,
    isFocusVisible,
    isDisabled,
    isPressed,
  };
}
