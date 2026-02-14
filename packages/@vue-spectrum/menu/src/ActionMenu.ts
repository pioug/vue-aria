import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import { defineComponent, h, type PropType } from "vue";
import { intlMessages } from "./intlMessages";
import { Menu } from "./Menu";
import { MenuTrigger } from "./MenuTrigger";
import type { SpectrumActionMenuProps, SpectrumMenuNodeData } from "./types";

/**
 * ActionMenu combines an ActionButton with a Menu for common overflow actions.
 */
export const ActionMenu = defineComponent({
  name: "SpectrumActionMenu",
  inheritAttrs: false,
  props: {
    isOpen: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      required: false,
    },
    align: {
      type: String as () => SpectrumActionMenuProps<object>["align"],
      required: false,
      default: undefined,
    },
    direction: {
      type: String as () => SpectrumActionMenuProps<object>["direction"],
      required: false,
      default: undefined,
    },
    shouldFlip: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    trigger: {
      type: String as () => SpectrumActionMenuProps<object>["trigger"],
      required: false,
      default: undefined,
    },
    closeOnSelect: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    items: {
      type: Array as PropType<Array<SpectrumMenuNodeData>>,
      required: false,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<Iterable<string | number> | undefined>,
      required: false,
      default: undefined,
    },
    selectionMode: {
      type: String as () => SpectrumActionMenuProps<object>["selectionMode"],
      required: false,
      default: undefined,
    },
    selectedKeys: {
      type: Object as PropType<SpectrumActionMenuProps<object>["selectedKeys"]>,
      required: false,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: Object as PropType<SpectrumActionMenuProps<object>["defaultSelectedKeys"]>,
      required: false,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumActionMenuProps<object>["onSelectionChange"]>,
      required: false,
    },
    onAction: {
      type: Function as PropType<SpectrumActionMenuProps<object>["onAction"]>,
      required: false,
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
  },
  setup(props, { attrs, slots }) {
    const stringFormatter = useLocalizedStringFormatter(intlMessages, "@vue-spectrum/menu");

    return () => {
      const buttonProps = filterDOMProps(
        {
          ...(attrs as Record<string, unknown>),
          "aria-label": props.ariaLabel,
        },
        { labelable: true }
      );

      if (buttonProps["aria-label"] == null) {
        buttonProps["aria-label"] = stringFormatter.format("moreActions");
      }

      return h(
        MenuTrigger as any,
        {
          isOpen: props.isOpen,
          defaultOpen: props.defaultOpen,
          onOpenChange: props.onOpenChange,
          align: props.align,
          direction: props.direction,
          shouldFlip: props.shouldFlip,
          trigger: props.trigger,
          closeOnSelect: props.closeOnSelect,
        },
        {
          default: () => [
            h(
              ActionButton as any,
              {
                ...buttonProps,
                isDisabled: props.isDisabled,
                autoFocus: props.autoFocus,
              },
              {
                default: () => [h("span", { "aria-hidden": "true" }, "⋯")],
              }
            ),
            h(
              Menu as any,
              {
                items: props.items,
                disabledKeys: props.disabledKeys,
                selectionMode: props.selectionMode,
                selectedKeys: props.selectedKeys,
                defaultSelectedKeys: props.defaultSelectedKeys,
                onSelectionChange: props.onSelectionChange,
                onAction: props.onAction,
              },
              {
                default: () => slots.default?.() ?? [],
              }
            ),
          ],
        }
      );
    };
  },
});
