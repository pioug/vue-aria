import { useDescription } from "@vue-aria/utils";
import { useId } from "@vue-aria/utils";
import { useSelectableItem } from "@vue-aria/selection";
import { mergeProps } from "@vue-aria/utils";
import type { Node, Key } from "@vue-aria/collections";
import { hookData as tagGroupData } from "./useTagGroup";

export interface AriaTagProps<T> {
  item: Node<T>;
}

export interface TagAria {
  rowProps: Record<string, unknown>;
  gridCellProps: Record<string, unknown>;
  removeButtonProps: Record<string, unknown>;
  stepProps?: Record<string, unknown>;
  allowsRemoving: boolean;
  isDisabled?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
}

interface TagState<T> {
  disabledKeys?: Set<Key>;
  selectionManager?: {
    isSelected?: (key: Key) => boolean;
    selectedKeys?: Iterable<Key>;
    focusedKey?: Key;
  };
  [key: string]: unknown;
}

export function useTag<T>(
  props: AriaTagProps<T>,
  state: TagState<T>,
  ref: { current: HTMLElement | null }
): TagAria {
  const { item } = props;
  const key = item.key as Key;
  const nodeProps = (item as unknown as { props?: Record<string, unknown> }).props ?? {};
  const isDisabled = Boolean(state?.disabledKeys?.has(key)) || Boolean(nodeProps.isDisabled);

  const { itemProps } = useSelectableItem({
    isDisabled,
    key,
    ref,
    selectionManager: state.selectionManager as never,
  });

  const isSelected = state.selectionManager?.isSelected?.(key) ?? false;
  const { onRemove } = tagGroupData.get(state as unknown as object) || {};
  const removeButtonId = useId();
  const { descriptionProps } = useDescription(onRemove ? "Remove item" : undefined);

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.key === "Delete" || event.key === "Backspace") && onRemove && !isDisabled) {
      event.preventDefault();
      onRemove(
        isSelected
          ? new Set(state.selectionManager?.selectedKeys ? [...state.selectionManager.selectedKeys] : [key])
          : new Set([key])
      );
    }

    itemProps.onKeyDown?.(event);
  };

  return {
    rowProps: mergeProps(itemProps as Record<string, unknown>, {
      onKeyDown,
      role: "row",
      "aria-disabled": isDisabled ? true : undefined,
      "aria-current": isSelected ? "step" : undefined,
      tabIndex: isDisabled ? undefined : 0,
    }),
    gridCellProps: {
      ...descriptionProps.value,
      role: "gridcell",
      "aria-label": nodeProps["aria-label"] as string | undefined,
    },
    removeButtonProps: onRemove
      ? {
          "aria-label": "Remove tag",
          id: removeButtonId,
          onPress: () => onRemove(new Set([key])),
          onPressStart: () => {
            ref.current?.focus();
          },
          isDisabled,
        }
      : {},
    stepProps: undefined,
    allowsRemoving: !!onRemove,
    isDisabled,
    isFocused: state.selectionManager?.focusedKey === key,
    isSelected,
  };
}
