import type { Node, Key } from "@vue-aria/collections";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useGridListItem } from "@vue-aria/gridlist";
import { useFocusable, useInteractionModality } from "@vue-aria/interactions";
import { filterDOMProps, mergeProps, useDescription, useId, useSyntheticLinkProps } from "@vue-aria/utils";
import type { SelectableItemStates } from "@vue-aria/selection";
import type { ListState } from "@vue-stately/list";
import { hookData as tagGroupData } from "./useTagGroup";
import { intlMessages } from "./intlMessages";

export interface AriaTagProps<T> {
  item: Node<T>;
}

export interface TagAria extends Omit<SelectableItemStates, "hasAction"> {
  rowProps: Record<string, unknown>;
  gridCellProps: Record<string, unknown>;
  removeButtonProps: Record<string, unknown>;
  allowsRemoving: boolean;
}

export function useTag<T>(
  props: AriaTagProps<T>,
  state: ListState<T>,
  ref: { current: HTMLElement | null }
): TagAria {
  const { item } = props;
  const key = item.key as Key;
  const itemProps = (item.props as Record<string, unknown> | undefined) ?? {};
  const isDisabled = state.disabledKeys.has(key) || Boolean(itemProps.isDisabled);
  const stringFormatter = useLocalizedStringFormatter(intlMessages, "@react-aria/tag");
  const { onRemove } = tagGroupData.get(state as unknown as object) || {};
  const removeButtonId = useId();

  const { rowProps, gridCellProps, descriptionProps, ...itemStates } = useGridListItem(
    {
      node: item,
    },
    state,
    ref
  );

  const { hasAction: _unusedAction, ...stateWithoutDescription } = itemStates as {
    descriptionProps: Record<string, unknown>;
    hasAction: boolean;
    isPressed: boolean;
    isSelected: boolean;
    isFocused: boolean;
    isDisabled: boolean;
    allowsSelection: boolean;
    [key: string]: unknown;
  };

  let modality = useInteractionModality();
  if (modality === "virtual" && typeof window !== "undefined" && "ontouchstart" in window) {
    modality = "pointer";
  }

  const description =
    onRemove && (modality === "keyboard" || modality === "virtual")
      ? stringFormatter.format("removeDescription")
      : "";
  const { descriptionProps: removeDescriptionProps } = useDescription(description);

  const onKeydown = (event: KeyboardEvent) => {
    if ((event.key === "Delete" || event.key === "Backspace") && onRemove && !isDisabled) {
      event.preventDefault();
      onRemove(state.selectionManager.isSelected(key)
        ? new Set(state.selectionManager.selectedKeys)
        : new Set([key]));
    }
  };

  const isItemFocused = key === state.selectionManager.focusedKey;
  const hasFocusedKey = state.selectionManager.focusedKey != null;
  const tabIndex = !isDisabled && (isItemFocused || !hasFocusedKey) ? 0 : -1;

  const domProps = filterDOMProps(itemProps);
  const linkProps = useSyntheticLinkProps(itemProps);
  const { focusableProps } = useFocusable(
    {
      ...itemProps,
      isDisabled,
    },
    ref
  );

  const removeButtonLabelledBy = `${removeButtonId}${rowProps.id ? ` ${String(rowProps.id)}` : ""}`;

  return {
    rowProps: mergeProps(focusableProps, rowProps, domProps, linkProps, {
      tabIndex,
      onKeydown: onRemove ? onKeydown : undefined,
      onKeyDown: onRemove ? onKeydown : undefined,
      "aria-describedby": removeDescriptionProps.value["aria-describedby"],
    }) as Record<string, unknown>,
    gridCellProps: mergeProps(gridCellProps, {
      "aria-errormessage": (props as { "aria-errormessage"?: string })["aria-errormessage"],
      "aria-label": itemProps["aria-label"] as string | undefined,
    }) as Record<string, unknown>,
    removeButtonProps: onRemove
      ? {
          "aria-label": stringFormatter.format("removeButtonLabel"),
          "aria-labelledby": removeButtonLabelledBy,
          id: removeButtonId,
          onPress: () => onRemove(new Set([key])),
          isDisabled,
        }
      : {},
    ...stateWithoutDescription,
    allowsRemoving: !!onRemove,
  };
}
