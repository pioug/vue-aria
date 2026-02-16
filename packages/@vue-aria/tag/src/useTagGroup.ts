import type { Key } from "@vue-aria/collections";
import { filterDOMProps, mergeProps, useId } from "@vue-aria/utils";
import { useGridList, type AriaGridListProps } from "@vue-aria/gridlist";
import { useLabel } from "@vue-aria/label";
import { useFocusWithin } from "@vue-aria/interactions";
import { useState } from "vue";

export interface AriaTagGroupProps<T> extends AriaGridListProps<T> {
  label?: string;
  isReadOnly?: boolean;
  selectionBehavior?: "replace" | "toggle" | "replace";
  onRemove?: (keys: Set<Key>) => void;
  isVirtualized?: boolean;
  keyboardNavigationBehavior?: "arrow" | "tab";
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaTagGroupOptions<T> extends Omit<AriaTagGroupProps<T>, "children"> {
  keyboardDelegate?: unknown;
}

export interface TagGroupAria {
  gridProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export const hookData = new WeakMap<object, { onRemove?: (keys: Set<Key>) => void }>();

export interface TagGroupState {
  selectionManager: {
    selectionMode?: string;
    isFocused?: boolean;
    focusedKey?: Key;
    setSelectionMode?: (mode: string) => void;
  };
  collection?: { size: number };
  disabledKeys?: Set<Key>;
  selectedKey?: Key | null;
  [key: string]: unknown;
}

export function useTagGroup<T>(
  props: AriaTagGroupOptions<T>,
  state: TagGroupState,
  ref: { current: HTMLElement | null }
): TagGroupAria {
  const {
    onRemove,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...otherProps
  } = props;

  const { labelProps, fieldProps } = useLabel({
    label,
    "aria-label": ariaLabel as string | undefined,
    "aria-labelledby": ariaLabelledBy as string | undefined,
    labelElementType: "span",
  });

  const [isFocusWithin, setFocusWithin] = useState(false);
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: setFocusWithin,
  });

  const { gridProps } = useGridList(
    {
      ...otherProps,
      ...state,
      shouldFocusWrap: true,
      linkBehavior: "override",
      keyboardNavigationBehavior: "tab",
      ref,
    } as AriaGridListProps<T>,
    state as any,
    ref
  );

  const descriptionId = useId();
  const role = ((state.collection?.size ?? 0) > 0 ? "grid" : "group") as string;

  hookData.set(state as object, { onRemove });

  const domProps = filterDOMProps(props, { labelable: true });

  return {
    gridProps: mergeProps(gridProps, domProps, {
      ...focusWithinProps,
      role,
      "aria-atomic": false,
      "aria-relevant": "additions",
      "aria-live": isFocusWithin ? "polite" : "off",
      ...fieldProps,
    }),
    labelProps,
    descriptionProps: { id: descriptionId },
    errorMessageProps: {},
  };
}
