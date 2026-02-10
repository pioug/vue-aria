import {
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useOption, type UseListBoxStateResult } from "@vue-aria/listbox";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type { NormalizedListBoxItemData } from "./types";

export interface SpectrumListBoxOptionProps {
  item: NormalizedListBoxItemData;
  state: UseListBoxStateResult<NormalizedListBoxItemData>;
  shouldSelectOnPressUp?: boolean | undefined;
  shouldFocusOnHover?: boolean | undefined;
  shouldUseVirtualFocus?: boolean | undefined;
  UNSAFE_className?: string | undefined;
}

export const ListBoxOption = defineComponent({
  name: "ListBoxOption",
  props: {
    item: {
      type: Object as PropType<NormalizedListBoxItemData>,
      required: true,
    },
    state: {
      type: Object as PropType<UseListBoxStateResult<NormalizedListBoxItemData>>,
      required: true,
    },
    shouldSelectOnPressUp: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusOnHover: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldUseVirtualFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const optionRef = ref<HTMLElement | null>(null);

    const optionState = useOption(
      {
        key: props.item.key,
        "aria-label": props.item["aria-label"],
        isDisabled: props.item.isDisabled,
        shouldSelectOnPressUp: props.shouldSelectOnPressUp,
        shouldFocusOnHover: props.shouldFocusOnHover,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
      },
      props.state,
      optionRef
    );

    const toVueOptionProps = (
      optionProps: Record<string, unknown>
    ): Record<string, unknown> => {
      const mappedProps = { ...optionProps };
      if ("onMouseDown" in mappedProps) {
        mappedProps.onMousedown = mappedProps.onMouseDown;
        delete mappedProps.onMouseDown;
      }
      if ("onMouseUp" in mappedProps) {
        mappedProps.onMouseup = mappedProps.onMouseUp;
        delete mappedProps.onMouseUp;
      }
      if ("onMouseEnter" in mappedProps) {
        mappedProps.onMouseenter = mappedProps.onMouseEnter;
        delete mappedProps.onMouseEnter;
      }
      if ("onMouseLeave" in mappedProps) {
        mappedProps.onMouseleave = mappedProps.onMouseLeave;
        delete mappedProps.onMouseLeave;
      }
      return mappedProps;
    };

    return () => {
      const isSelected = optionState.isSelected.value;
      const isDisabled = optionState.isDisabled.value;
      const elementType = props.item.href ? "a" : "div";
      const optionProps = toVueOptionProps(
        optionState.optionProps.value as Record<string, unknown>
      );

      return h(
        elementType,
        mergeProps(optionProps, {
          ref: (value: unknown) => {
            optionRef.value = value as HTMLElement | null;
          },
          href: props.item.href,
          class: classNames(
            "spectrum-Menu-item",
            {
              "is-focused": optionState.isFocused.value,
              "is-disabled": isDisabled,
              "is-selected": isSelected,
              "is-selectable": optionState.allowsSelection.value,
              "is-pressed": optionState.isPressed.value,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
        }),
        [
          h(
            "span",
            mergeProps(optionState.labelProps.value, {
              class: classNames("spectrum-Menu-itemLabel"),
            }),
            props.item.label
          ),
          props.item.description
            ? h(
              "span",
              mergeProps(optionState.descriptionProps.value, {
                class: classNames("spectrum-Menu-description"),
              }),
              props.item.description
            )
            : null,
          isSelected && props.state.selectionMode.value !== "none"
            ? h(
              "span",
              {
                role: "img",
                "aria-hidden": "true",
                class: classNames("spectrum-Menu-checkmark"),
              },
              "✓"
            )
            : null,
        ]
      );
    };
  },
});
