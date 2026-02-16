import { ref, watch } from "vue";
import type { KeyboardDelegate } from "@vue-aria/selection";
import type { Key } from "@vue-aria/collections";
import { ListKeyboardDelegate } from "@vue-aria/selection";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useField } from "@vue-aria/label";
import { useFocusWithin } from "@vue-aria/interactions";
import { useGridList, type AriaGridListProps } from "@vue-aria/gridlist";
import { useLocale } from "@vue-aria/i18n";
import type { ListState } from "@vue-stately/list";

export interface AriaTagGroupProps<T> extends AriaGridListProps<T> {
  label?: string;
  isReadOnly?: boolean;
  selectionBehavior?: "replace" | "toggle";
  onRemove?: (keys: Set<Key>) => void;
  isVirtualized?: boolean;
  keyboardNavigationBehavior?: "arrow" | "tab";
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface AriaTagGroupOptions<T> extends Omit<AriaTagGroupProps<T>, "children"> {
  keyboardDelegate?: KeyboardDelegate;
}

export interface TagGroupAria {
  gridProps: Record<string, unknown>;
  labelProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  errorMessageProps: Record<string, unknown>;
}

export const hookData = new WeakMap<object, { onRemove?: (keys: Set<Key>) => void }>();

export function useTagGroup<T>(
  props: AriaTagGroupOptions<T>,
  state: ListState<T>,
  refValue: { current: HTMLElement | null }
): TagGroupAria {
  const {
    onRemove,
    label,
    keyboardNavigationBehavior = "arrow",
    keyboardDelegate: providedKeyboardDelegate,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...otherProps
  } = props;

  const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
    ...otherProps,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    labelElementType: "span",
  });

  const { direction } = useLocale().value;
  const keyboardDelegate =
    providedKeyboardDelegate ||
    new ListKeyboardDelegate({
      collection: state.collection,
      ref: refValue,
      orientation: "horizontal",
      direction,
      disabledKeys: state.disabledKeys,
      disabledBehavior: state.selectionManager.disabledBehavior,
    });

  const isFocusWithin = ref(false);
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (focused) => {
      isFocusWithin.value = focused;
      state.selectionManager.setFocused(focused);
    },
  });

  const { gridProps } = useGridList(
      {
        ...otherProps,
        ...fieldProps,
        keyboardDelegate,
        shouldFocusWrap: true,
        linkBehavior: "override",
        keyboardNavigationBehavior: "tab",
      },
    state,
    refValue
  );

  const prevCount = ref(state.collection.size);
  watch(
    [() => state.collection.size, isFocusWithin],
    ([size]) => {
      if (refValue.current && prevCount.value > 0 && size === 0 && isFocusWithin.value) {
        refValue.current.focus();
      }
      prevCount.value = size;
    },
    { flush: "post" }
  );

  hookData.set(state as object, { onRemove });

  return {
    gridProps: mergeProps(gridProps, filterDOMProps(props, { labelable: true }), {
      role: state.collection.size ? "grid" : "group",
      "aria-atomic": false,
      "aria-relevant": "additions",
      "aria-live": isFocusWithin.value ? "polite" : "off",
      ...focusWithinProps,
      ...fieldProps,
    }),
    labelProps,
    descriptionProps,
    errorMessageProps,
  };
}
