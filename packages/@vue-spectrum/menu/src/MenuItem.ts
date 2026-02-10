import { computed, defineComponent, h, type PropType } from "vue";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type {
  MenuKey,
  SpectrumMenuItemData,
  SpectrumMenuSelectionMode,
} from "./types";

export interface SpectrumMenuItemProps {
  item: SpectrumMenuItemData;
  selectionMode?: SpectrumMenuSelectionMode | undefined;
  isSelected?: boolean | undefined;
  isFocused?: boolean | undefined;
  isDisabled?: boolean | undefined;
  tabIndex?: number | undefined;
  onFocus?: (() => void) | undefined;
  onHover?: (() => void) | undefined;
  onAction?: ((key: MenuKey) => void) | undefined;
  UNSAFE_className?: string | undefined;
}

export const MenuItem = defineComponent({
  name: "MenuItem",
  props: {
    item: {
      type: Object as PropType<SpectrumMenuItemData>,
      required: true,
    },
    selectionMode: {
      type: String as PropType<SpectrumMenuSelectionMode | undefined>,
      default: undefined,
    },
    isSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isFocused: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    tabIndex: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onHover: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: MenuKey) => void) | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const role = computed(() => {
      if (props.selectionMode === "single") {
        return "menuitemradio";
      }

      if (props.selectionMode === "multiple") {
        return "menuitemcheckbox";
      }

      return "menuitem";
    });

    return () => {
      const disabled = Boolean(props.isDisabled || props.item.isDisabled);
      const selected = Boolean(props.isSelected);
      const focused = Boolean(props.isFocused);

      return h(
        "li",
        {
          role: role.value,
          tabIndex: props.tabIndex ?? -1,
          "aria-disabled": disabled ? "true" : undefined,
          "aria-checked":
            props.selectionMode === "none" ? undefined : String(selected),
          class: classNames(
            "spectrum-Menu-item",
            {
              "is-focused": focused,
              "is-selected": selected,
              "is-disabled": disabled,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          onFocus: () => {
            props.onFocus?.();
          },
          onMouseenter: () => {
            if (!disabled) {
              props.onHover?.();
            }
          },
          onClick: () => {
            if (!disabled) {
              props.onAction?.(props.item.key);
            }
          },
        },
        [
          h(
            "span",
            {
              class: classNames("spectrum-Menu-itemLabel"),
              "aria-label": props.item["aria-label"],
            },
            props.item.label
          ),
        ]
      );
    };
  },
});
