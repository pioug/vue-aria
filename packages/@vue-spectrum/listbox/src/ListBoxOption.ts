import { FocusRing } from "@vue-aria/focus";
import { isFocusVisible, useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useOption } from "@vue-aria/listbox";
import { computed, defineComponent, h, ref } from "vue";
import { useListBoxContext } from "./context";
import type { ListBoxCollectionNode } from "./types";

/** @private */
export const ListBoxOption = defineComponent({
  name: "SpectrumListBoxOption",
  inheritAttrs: false,
  props: {
    item: {
      type: Object as () => ListBoxCollectionNode,
      required: true,
    },
  },
  setup(props) {
    const context = useListBoxContext();
    if (!context) {
      throw new Error("ListBoxOption must be used within ListBox.");
    }

    const optionRef = ref<HTMLElement | null>(null);
    const refObject = {
      get current() {
        return optionRef.value;
      },
      set current(value: HTMLElement | null) {
        optionRef.value = value;
      },
    };

    const optionAria = useOption(
      {
        "aria-label": props.item["aria-label"],
        key: props.item.key,
        isVirtualized: true,
        shouldFocusOnHover: context.shouldFocusOnHover,
        shouldUseVirtualFocus: context.shouldUseVirtualFocus,
      },
      context.state as any,
      refObject
    );

    const { hoverProps, isHovered } = useHover({
      isDisabled: optionAria.isDisabled,
    });

    const isSelected = computed(() => context.state.selectionManager.isSelected(props.item.key));

    return () => {
      const ElementType = ((props.item.props as Record<string, unknown>).href ? "a" : "div") as "a" | "div";
      const rendered = props.item.rendered;
      const isKeyboardModality = isFocusVisible();

      const content = typeof rendered === "string" || typeof rendered === "number"
        ? [
            h(
              "span",
              {
                ...optionAria.labelProps,
                class: "spectrum-Menu-itemLabel",
              },
              String(rendered)
            ),
          ]
        : Array.isArray(rendered)
          ? rendered
          : rendered != null
            ? [rendered as any]
            : [];

      const description = (props.item.props as Record<string, unknown>).description as string | undefined;
      if (description) {
        content.push(
          h(
            "span",
            {
              ...optionAria.descriptionProps,
              class: "spectrum-Menu-description",
            },
            description
          )
        );
      }

      if (isSelected.value) {
        content.push(
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

      return h(
        FocusRing,
        {
          focusRingClass: "focus-ring",
        },
        {
          default: () => {
            const mergedProps = mergeProps(optionAria.optionProps, context.shouldFocusOnHover ? {} : hoverProps, {
              "aria-selected":
                context.state.selectionManager.selectionMode !== "none"
                  ? isSelected.value
                  : undefined,
              "aria-disabled": optionAria.isDisabled || undefined,
            });

            return h(ElementType, {
              ...(mergedProps as any),
              ref: optionRef,
              class: [
                "spectrum-Menu-item",
                {
                  "is-focused": context.shouldUseVirtualFocus && optionAria.isFocused && isKeyboardModality,
                  "is-disabled": optionAria.isDisabled,
                  "is-selected": isSelected.value,
                  "is-selectable": context.state.selectionManager.selectionMode !== "none",
                  "is-hovered": (isHovered && !context.shouldFocusOnHover) || (optionAria.isFocused && !isKeyboardModality),
                },
              ],
            } as any, [
              h(
                "div",
                {
                  class: "spectrum-Menu-itemGrid",
                },
                content as any
              ),
            ]);
          },
        }
      );
    };
  },
});
