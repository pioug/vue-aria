import { FocusRing } from "@vue-aria/focus";
import { useLocale, useLocalizedStringFormatter } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import { useMenuItem } from "@vue-aria/menu";
import { computed, defineComponent, h, ref, type PropType } from "vue";
import { intlMessages } from "./intlMessages";
import type { MenuCollectionNode } from "./types";
import type { ListState } from "@vue-aria/list-state";

/** @private */
export const MenuItem = defineComponent({
  name: "SpectrumMenuItem",
  inheritAttrs: false,
  props: {
    item: {
      type: Object as () => MenuCollectionNode,
      required: true,
    },
    state: {
      type: Object as () => ListState<object>,
      required: true,
    },
    closeOnSelect: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    isVirtualized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    submenuTriggerProps: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
      default: undefined,
    },
    submenuTriggerRef: {
      type: Object as () => { current: HTMLElement | null } | undefined,
      required: false,
      default: undefined,
    },
    isUnavailable: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const stringFormatter = useLocalizedStringFormatter(intlMessages, "@vue-spectrum/menu");
    const locale = useLocale();
    const itemRef = ref<HTMLElement | null>(null);
    const refObject = {
      get current() {
        return itemRef.value;
      },
      set current(value: HTMLElement | null) {
        itemRef.value = value;
      },
    };

    const menuItemAria = useMenuItem(
      {
        key: props.item.key,
        isDisabled:
          Boolean((props.item.props as Record<string, unknown>).isDisabled)
          || props.state.disabledKeys.has(props.item.key),
        isVirtualized: props.isVirtualized,
        "aria-label": props.item["aria-label"],
        closeOnSelect: props.closeOnSelect,
        onClose: props.onClose,
      },
      props.state as any,
      props.submenuTriggerRef ?? refObject
    );

    const isSubmenuTrigger = computed(() => Boolean(props.submenuTriggerProps));
    const isDisabled = computed(
      () =>
        Boolean((props.item.props as Record<string, unknown>).isDisabled)
        || props.state.disabledKeys.has(props.item.key)
    );
    const isContextualHelpTrigger = computed(
      () => isSubmenuTrigger.value && props.isUnavailable !== undefined
    );
    const isSelectable = computed(
      () =>
        (isContextualHelpTrigger.value ? !props.isUnavailable : !isSubmenuTrigger.value)
        && props.state.selectionManager.selectionMode !== "none"
    );
    const isSelected = computed(
      () => isSelectable.value && props.state.selectionManager.isSelected(props.item.key)
    );

    const role = computed(() => {
      if (isSubmenuTrigger.value) {
        return "menuitem";
      }

      if (props.state.selectionManager.selectionMode === "single") {
        return "menuitemradio";
      }

      if (props.state.selectionManager.selectionMode === "multiple") {
        return "menuitemcheckbox";
      }

      return "menuitem";
    });

    const renderContents = () => {
      const rendered = props.item.rendered;
      const nodes = [] as any[];

      if (typeof rendered === "string" || typeof rendered === "number") {
        nodes.push(
          h(
            "span",
            {
              ...menuItemAria.labelProps,
              class: "spectrum-Menu-itemLabel",
            },
            String(rendered)
          )
        );
      } else if (Array.isArray(rendered)) {
        nodes.push(...rendered);
      } else if (rendered != null) {
        nodes.push(rendered);
      }

      const description = (props.item.props as Record<string, unknown>).description as string | undefined;
      if (description) {
        nodes.push(
          h(
            "span",
            {
              ...menuItemAria.descriptionProps,
              class: "spectrum-Menu-description",
            },
            description
          )
        );
      }

      const keyboard = (props.item.props as Record<string, unknown>).keyboardShortcut as string | undefined;
      if (keyboard) {
        nodes.push(
          h(
            "kbd",
            {
              ...menuItemAria.keyboardShortcutProps,
              class: "spectrum-Menu-keyboard",
            },
            keyboard
          )
        );
      }

      if (isSelected.value) {
        nodes.push(
          h(
            "span",
            {
              class: "spectrum-Menu-checkmark",
              role: "img",
              "aria-hidden": "true",
            },
            "✓"
          )
        );
      }

      if (props.isUnavailable) {
        nodes.push(
          h(
            "span",
            {
              class: "spectrum-Menu-end",
              role: "img",
              "aria-label": stringFormatter.format("unavailable"),
            },
            "ⓘ"
          )
        );
      }

      if (props.isUnavailable == null && isSubmenuTrigger.value) {
        nodes.push(
          h(
            "span",
            {
              class: "spectrum-Menu-chevron",
              "aria-hidden": "true",
            },
            locale.value.direction === "rtl" ? "‹" : "›"
          )
        );
      }

      return nodes;
    };

    return () => {
      const ElementType = ((props.item.props as Record<string, unknown>).href ? "a" : "div") as "a" | "div";
      const submenuProps = props.submenuTriggerProps ?? {};
      const submenuKeyDown = submenuProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined;
      const setItemRef = (value: HTMLElement | null) => {
        itemRef.value = value;
        if (props.submenuTriggerRef) {
          props.submenuTriggerRef.current = value;
        }
      };

      const mergedProps = mergeProps(
        menuItemAria.menuItemProps,
        submenuProps,
        submenuKeyDown
          ? {
              onKeydown: submenuKeyDown,
              onKeyDown: submenuKeyDown,
            }
          : undefined,
        {
          role: role.value,
          "aria-checked": isSelectable.value ? isSelected.value : undefined,
          "aria-expanded": submenuProps["aria-expanded"] as boolean | "true" | "false" | undefined,
          "aria-controls": submenuProps["aria-controls"] as string | undefined,
          "aria-haspopup": submenuProps["aria-haspopup"] as string | undefined,
        }
      );

      return h(
        FocusRing,
        { focusRingClass: "focus-ring" },
        {
          default: () =>
            h(ElementType, {
              ...((mergedProps as any) ?? {}),
              ref: setItemRef as any,
              class: [
                "spectrum-Menu-item",
                {
                  "is-disabled": isDisabled.value,
                  "is-selected": isSelected.value,
                  "is-selectable": isSelectable.value,
                  "is-open": Boolean(submenuProps.isOpen),
                },
              ],
            } as any, [
              h(
                "div",
                {
                  class: "spectrum-Menu-itemGrid",
                },
                renderContents()
              ),
            ]),
        }
      );
    };
  },
});
