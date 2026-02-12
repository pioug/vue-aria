import { computed, defineComponent, h, type PropType } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type {
  MenuKey,
  SpectrumMenuItemData,
  SpectrumMenuSelectionMode,
} from "./types";

const MENU_ITEM_INTL_MESSAGES = {
  "en-US": {
    unavailable: "Unavailable, expand for details",
  },
  "fr-FR": {
    unavailable: "Indisponible, developper pour plus de details",
  },
} as const;

export interface SpectrumMenuItemProps {
  item?: SpectrumMenuItemData | undefined;
  id?: MenuKey | undefined;
  selectionMode?: SpectrumMenuSelectionMode | undefined;
  isSelected?: boolean | undefined;
  isFocused?: boolean | undefined;
  isDisabled?: boolean | undefined;
  tabIndex?: number | undefined;
  onFocus?: (() => void) | undefined;
  onHover?: (() => void) | undefined;
  onAction?: ((key: MenuKey) => void) | undefined;
  ariaHaspopup?: "dialog" | "menu" | true | undefined;
  showUnavailableIndicator?: boolean | undefined;
  unavailableIndicatorLabel?: string | undefined;
  UNSAFE_className?: string | undefined;
}

export const MenuItem = defineComponent({
  name: "MenuItem",
  props: {
    item: {
      type: Object as PropType<SpectrumMenuItemData | undefined>,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<MenuKey | undefined>,
      default: undefined,
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
    ariaHaspopup: {
      type: [String, Boolean] as PropType<"dialog" | "menu" | true | undefined>,
      default: undefined,
    },
    showUnavailableIndicator: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    unavailableIndicatorLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const stringFormatter = useLocalizedStringFormatter(
      MENU_ITEM_INTL_MESSAGES,
      "@vue-spectrum/menu"
    );
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
      if (!props.item) {
        return h(
          "li",
          {
            role: "presentation",
            class: classNames(
              "spectrum-Menu-item",
              props.UNSAFE_className as ClassValue | undefined
            ),
          },
          slots.default?.()
        );
      }

      const item = props.item;
      const disabled = Boolean(props.isDisabled || item.isDisabled);
      const selected = Boolean(props.isSelected);
      const focused = Boolean(props.isFocused);

      return h(
        "li",
        {
          role: role.value,
          tabIndex: props.tabIndex ?? -1,
          "aria-label": item["aria-label"],
          "aria-haspopup": props.ariaHaspopup,
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
              props.onAction?.(item.key);
            }
          },
        },
        [
          h(
            "span",
            {
              class: classNames("spectrum-Menu-itemLabel"),
            },
            slots.default?.() ?? item.label
          ),
          props.showUnavailableIndicator
            ? h(
                "span",
                {
                  role: "img",
                  class: classNames("spectrum-Menu-unavailableIcon"),
                  "aria-label":
                    props.unavailableIndicatorLabel ??
                    stringFormatter.value.format("unavailable"),
                },
                "ℹ"
              )
            : null,
        ]
      );
    };
  },
});
