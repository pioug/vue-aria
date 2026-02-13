import type { GridNode } from "@vue-aria/grid-state";
import type { ColumnSize, Key, TableColumnResizeState } from "@vue-aria/table-state";
import { focusSafely, useInteractionModality, useKeyboard, useMove, usePress } from "@vue-aria/interactions";
import { mergeProps, useDescription, useEffectEvent, useId } from "@vue-aria/utils";
import { useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useVisuallyHidden } from "@vue-aria/visually-hidden";
import { ref, watchEffect } from "vue";
import { intlMessages } from "./intlMessages";
import { getColumnHeaderId } from "./utils";

export interface TableColumnResizeAria {
  inputProps: Record<string, unknown>;
  resizerProps: Record<string, unknown>;
  isResizing: boolean;
}

export interface AriaTableColumnResizeProps<T> {
  column: GridNode<T>;
  "aria-label": string;
  triggerRef?: { current: HTMLElement | null };
  isDisabled?: boolean;
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}

export function useTableColumnResize<T>(
  props: AriaTableColumnResizeProps<T>,
  state: TableColumnResizeState<T>,
  inputRef: { current: HTMLInputElement | null }
): TableColumnResizeAria {
  const {
    column: item,
    triggerRef,
    isDisabled,
    onResizeStart,
    onResize,
    onResizeEnd,
    "aria-label": ariaLabel,
  } = props;

  const stringFormatter = useLocalizedStringFormatter(
    intlMessages as any,
    "@react-aria/table"
  );
  const id = useId();
  const isResizing = state.resizingColumn === item.key;
  const isResizingRef = ref(isResizing);
  const lastSize = ref<Map<Key, ColumnSize> | null>(null);
  const wasFocusedOnResizeStart = ref(false);

  const { direction } = useLocale().value;

  const startResize = (column: GridNode<T>) => {
    if (!isResizingRef.value) {
      const sizes = state.updateResizedColumns(
        column.key,
        state.getColumnWidth(column.key)
      );
      lastSize.value = sizes;
      state.startResize(column.key);
      state.tableState.setKeyboardNavigationDisabled(true);
      onResizeStart?.(sizes);
    }
    isResizingRef.value = true;
  };

  const resize = (column: GridNode<T>, newWidth: number) => {
    const sizes = state.updateResizedColumns(column.key, newWidth);
    onResize?.(sizes);
    lastSize.value = sizes;
  };

  const endResize = (column: GridNode<T>) => {
    if (isResizingRef.value) {
      const sizes =
        lastSize.value
        ?? state.updateResizedColumns(
          column.key,
          state.getColumnWidth(column.key)
        );
      lastSize.value = sizes;

      state.endResize();
      state.tableState.setKeyboardNavigationDisabled(false);
      onResizeEnd?.(sizes);
      isResizingRef.value = false;

      if (triggerRef?.current && !wasFocusedOnResizeStart.value) {
        focusSafely(triggerRef.current);
      }
    }

    lastSize.value = null;
  };

  const { keyboardProps } = useKeyboard({
    onKeyDown: (e) => {
      const key = (e as unknown as KeyboardEvent).key;
      const editModeEnabled = state.tableState.isKeyboardNavigationDisabled;
      if (editModeEnabled) {
        if (
          key === "Escape"
          || key === "Enter"
          || key === " "
          || key === "Tab"
        ) {
          e.preventDefault();
          endResize(item);
        }
      } else {
        e.continuePropagation();
        if (key === "Enter") {
          startResize(item);
        }
      }
    },
  });

  const columnResizeWidthRef = ref(0);
  const { moveProps } = useMove({
    onMoveStart() {
      columnResizeWidthRef.value = state.getColumnWidth(item.key);
      startResize(item);
    },
    onMove(e) {
      let { deltaX, deltaY, pointerType } = e;
      if (direction === "rtl") {
        deltaX *= -1;
      }

      if (pointerType === "keyboard") {
        if (deltaY !== 0 && deltaX === 0) {
          deltaX = deltaY * -1;
        }
        deltaX *= 10;
      }

      if (deltaX !== 0) {
        columnResizeWidthRef.value += deltaX;
        resize(item, columnResizeWidthRef.value);
      }
    },
    onMoveEnd(e) {
      columnResizeWidthRef.value = 0;
      if (
        e.pointerType === "mouse"
        || (e.pointerType === "touch" && wasFocusedOnResizeStart.value)
      ) {
        endResize(item);
      }
    },
  });

  const onResizerKeydown = (event: KeyboardEvent) => {
    (keyboardProps.onKeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
    if (state.tableState.isKeyboardNavigationDisabled) {
      (moveProps.onKeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
    }
  };

  const min = Math.floor(state.getColumnMinWidth(item.key));
  let max = Math.floor(state.getColumnMaxWidth(item.key));
  if (max === Infinity) {
    max = Number.MAX_SAFE_INTEGER;
  }
  const value = Math.floor(state.getColumnWidth(item.key));

  const modality = useInteractionModality();
  const isVirtualTouchModality =
    modality === "virtual"
    && typeof window !== "undefined"
    && "ontouchstart" in window;
  const description =
    triggerRef?.current == null
    && (modality === "keyboard" || (modality === "virtual" && !isVirtualTouchModality))
    && !isResizing
      ? stringFormatter.format("resizerDescription")
      : undefined;
  const { descriptionProps } = useDescription(description);

  const ariaProps: Record<string, unknown> = {
    "aria-label": ariaLabel,
    "aria-orientation": "horizontal",
    "aria-labelledby": `${id} ${getColumnHeaderId(state.tableState, item.key)}`,
    "aria-valuetext": stringFormatter.format("columnSize", { value }),
    type: "range",
    min,
    max,
    value,
    ...descriptionProps.value,
  };

  const focusInput = () => {
    if (inputRef.current) {
      focusSafely(inputRef.current);
    }
  };

  const prevResizingColumn = ref<Key | null>(null);
  const startResizeEvent = useEffectEvent(startResize);
  watchEffect((onCleanup) => {
    const resizingColumn = state.resizingColumn;
    if (
      prevResizingColumn.value !== resizingColumn
      && resizingColumn != null
      && resizingColumn === item.key
    ) {
      wasFocusedOnResizeStart.value = document.activeElement === inputRef.current;
      startResizeEvent(item);

      const timeout = setTimeout(() => focusInput(), 0);
      const voTimeout = setTimeout(focusInput, 400);
      onCleanup(() => {
        clearTimeout(timeout);
        clearTimeout(voTimeout);
      });
    }

    prevResizingColumn.value = resizingColumn;
  });

  const onChange = (event: Event) => {
    const currentWidth = state.getColumnWidth(item.key);
    const target = event.target as HTMLInputElement | null;
    let nextValue = Number.parseFloat(target?.value ?? "");
    if (nextValue > currentWidth) {
      nextValue = currentWidth + 10;
    } else {
      nextValue = currentWidth - 10;
    }
    resize(item, nextValue);
  };

  const { pressProps } = usePress({
    preventFocusOnPress: true,
    onPressStart: (e) => {
      if (
        e.ctrlKey
        || e.altKey
        || e.metaKey
        || e.shiftKey
        || e.pointerType === "keyboard"
      ) {
        return;
      }

      if (e.pointerType === "virtual" && state.resizingColumn != null) {
        endResize(item);
        return;
      }

      focusInput();

      if (e.pointerType !== "virtual") {
        startResize(item);
      }
    },
    onPress: (e) => {
      if (
        ((e.pointerType === "touch" && wasFocusedOnResizeStart.value)
          || e.pointerType === "mouse")
        && state.resizingColumn != null
      ) {
        endResize(item);
      }
    },
  });

  const { visuallyHiddenProps } = useVisuallyHidden();

  return {
    resizerProps: mergeProps(
      moveProps,
      pressProps,
      {
        onKeydown: onResizerKeydown,
        style: { touchAction: "none" },
      }
    ),
    inputProps: mergeProps(
      visuallyHiddenProps,
      {
        id,
        onBlur: () => {
          endResize(item);
        },
        onChange,
        disabled: isDisabled,
      },
      ariaProps
    ),
    isResizing,
  };
}
