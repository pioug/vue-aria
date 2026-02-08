import { computed, toValue } from "vue";
import { useOption, type ListBoxItem, type UseListBoxStateResult } from "@vue-aria/listbox";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseGridListItemOptions<T extends ListBoxItem = ListBoxItem> {
  node: T;
  isDisabled?: MaybeReactive<boolean | undefined>;
  isSelected?: MaybeReactive<boolean | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  isVirtualized?: MaybeReactive<boolean | undefined>;
  shouldSelectOnPressUp?: MaybeReactive<boolean | undefined>;
  onAction?: (key: Key) => void;
}

export interface UseGridListItemResult {
  rowProps: ReadonlyRef<Record<string, unknown>>;
  gridCellProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  isFocused: ReadonlyRef<boolean>;
  isFocusVisible: ReadonlyRef<boolean>;
  isSelected: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
  isPressed: ReadonlyRef<boolean>;
  allowsSelection: ReadonlyRef<boolean>;
  hasAction: ReadonlyRef<boolean>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

export function useGridListItem<T extends ListBoxItem>(
  options: UseGridListItemOptions<T>,
  state: UseListBoxStateResult<T>,
  rowRef: MaybeReactive<HTMLElement | null | undefined>
): UseGridListItemResult {
  const option = useOption(
    {
      key: options.node.key,
      isDisabled: options.isDisabled,
      isSelected: options.isSelected,
      "aria-label": options["aria-label"],
      isVirtualized: options.isVirtualized,
      shouldSelectOnPressUp: options.shouldSelectOnPressUp,
    },
    state,
    rowRef
  );

  const rowProps = computed<Record<string, unknown>>(() => {
    const optionProps = option.optionProps.value;
    const baseClick = optionProps.onClick as (() => void) | undefined;

    return {
      ...optionProps,
      role: "row",
      "aria-rowindex":
        resolveBoolean(options.isVirtualized) && state.getItemIndex(options.node.key) >= 0
          ? state.getItemIndex(options.node.key) + 1
          : undefined,
      onClick: () => {
        baseClick?.();
        if (!option.isDisabled.value) {
          options.onAction?.(options.node.key);
        }
      },
    };
  });

  const gridCellProps = computed<Record<string, unknown>>(() => ({
    role: "gridcell",
    "aria-colindex": 1,
  }));

  return {
    rowProps,
    gridCellProps,
    descriptionProps: option.descriptionProps,
    isFocused: option.isFocused,
    isFocusVisible: option.isFocusVisible,
    isSelected: option.isSelected,
    isDisabled: option.isDisabled,
    isPressed: option.isPressed,
    allowsSelection: option.allowsSelection,
    hasAction: option.hasAction,
  };
}
