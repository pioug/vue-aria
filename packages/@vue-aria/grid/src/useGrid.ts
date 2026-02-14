import { useHasTabbableChild } from "@vue-aria/focus";
import { useCollator, useLocale } from "@vue-aria/i18n";
import { useSelectableCollection, type KeyboardDelegate } from "@vue-aria/selection";
import { filterDOMProps, mergeProps, nodeContains, useId } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";
import type { GridCollectionType, GridState } from "@vue-aria/grid-state";
import { GridKeyboardDelegate } from "./GridKeyboardDelegate";
import { useGridSelectionAnnouncement } from "./useGridSelectionAnnouncement";
import { useHighlightSelectionDescription } from "./useHighlightSelectionDescription";
import { gridMap } from "./utils";

export interface GridProps {
  id?: string;
  isVirtualized?: boolean;
  disallowTypeAhead?: boolean;
  keyboardDelegate?: KeyboardDelegate;
  focusMode?: "row" | "cell";
  getRowText?: (key: Key) => string;
  scrollRef?: { current: HTMLElement | null };
  onRowAction?: (key: Key) => void;
  onCellAction?: (key: Key) => void;
  escapeKeyBehavior?: "clearSelection" | "none";
  disallowSelectAll?: boolean;
  shouldSelectOnPressUp?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface GridAria {
  gridProps: Record<string, unknown>;
}

export function useGrid<T, C extends GridCollectionType<T>>(
  props: GridProps,
  state: GridState<T, C>,
  ref: { current: HTMLElement | null }
): GridAria {
  const {
    isVirtualized,
    disallowTypeAhead,
    keyboardDelegate,
    focusMode,
    scrollRef,
    getRowText,
    onRowAction,
    onCellAction,
    escapeKeyBehavior = "clearSelection",
    disallowSelectAll,
    shouldSelectOnPressUp,
  } = props;
  const manager = state.selectionManager;

  if (!props["aria-label"] && !props["aria-labelledby"]) {
    console.warn("An aria-label or aria-labelledby prop is required for accessibility.");
  }

  const collator = useCollator({ usage: "search", sensitivity: "base" });
  const locale = useLocale();
  const disabledBehavior = state.selectionManager.disabledBehavior;
  const delegate =
    keyboardDelegate
    || new GridKeyboardDelegate({
      collection: state.collection,
      disabledKeys: state.disabledKeys,
      disabledBehavior,
      ref,
      direction: locale.value.direction,
      collator,
      focusMode,
    });

  const { collectionProps } = useSelectableCollection({
    ref,
    selectionManager: manager,
    keyboardDelegate: delegate,
    isVirtualized,
    scrollRef,
    disallowTypeAhead,
    disallowSelectAll,
    escapeKeyBehavior,
  });

  const id = useId(props.id as string | undefined);
  gridMap.set(state as unknown as GridState<unknown, GridCollectionType<unknown>>, {
    keyboardDelegate: delegate,
    actions: { onRowAction, onCellAction },
    shouldSelectOnPressUp,
  });

  const descriptionProps = useHighlightSelectionDescription({
    selectionManager: manager,
    hasItemActions: !!(onRowAction || onCellAction),
  });

  const domProps = filterDOMProps(props, { labelable: true });

  const onFocus = (event: FocusEvent) => {
    if (manager.isFocused) {
      if (
        !nodeContains(
          event.currentTarget as Node | null,
          event.target as Node | null
        )
      ) {
        manager.setFocused(false);
      }

      return;
    }

    if (
      !nodeContains(
        event.currentTarget as Node | null,
        event.target as Node | null
      )
    ) {
      return;
    }

    manager.setFocused(true);
  };

  const navDisabledHandlers = {
    onBlur: collectionProps.onBlur as ((event: FocusEvent) => void) | undefined,
    onFocus,
  };

  const hasTabbableChild = useHasTabbableChild(ref, {
    isDisabled: state.collection.size !== 0,
  });

  const gridProps = mergeProps(
    domProps,
    {
      role: "grid",
      id,
      "aria-multiselectable":
        manager.selectionMode === "multiple" ? "true" : undefined,
    },
    state.isKeyboardNavigationDisabled ? navDisabledHandlers : collectionProps,
    (state.collection.size === 0 && { tabIndex: hasTabbableChild ? -1 : 0 }) || undefined,
    descriptionProps
  ) as Record<string, unknown>;

  if (isVirtualized) {
    gridProps["aria-rowcount"] = state.collection.size;
    gridProps["aria-colcount"] = state.collection.columnCount;
  }

  useGridSelectionAnnouncement({ getRowText }, state as any);
  return {
    gridProps,
  };
}
