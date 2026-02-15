import { FocusRing } from "@vue-aria/focus";
import { isFocusVisible, useHover } from "@vue-aria/interactions";
import { mergeProps, useId } from "@vue-aria/utils";
import { useOption } from "@vue-aria/listbox";
import { cloneVNode, computed, defineComponent, h, isVNode, ref } from "vue";
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
    const fallbackId = useId();
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
    const hasAriaLabel = computed(
      () =>
        props.item["aria-label"] != null
        && props.item["aria-label"] !== ""
    );
    const labelId = computed(() => (optionAria.labelProps.id as string | undefined) ?? `${fallbackId}-label`);
    const descriptionId = computed(
      () => (optionAria.descriptionProps.id as string | undefined) ?? `${fallbackId}-description`
    );
    const supportsLabelDescriptionAria = computed(
      () =>
        Object.prototype.hasOwnProperty.call(optionAria.optionProps, "aria-labelledby")
        || Object.prototype.hasOwnProperty.call(optionAria.optionProps, "aria-describedby")
    );

    return () => {
      const ElementType = ((props.item.props as Record<string, unknown>).href ? "a" : "div") as "a" | "div";
      const rendered = props.item.rendered;
      const isKeyboardModality = isFocusVisible();
      let hasLabelNode = false;
      let hasDescriptionNode = false;

      const content = [] as any[];

      if (typeof rendered === "string" || typeof rendered === "number") {
        hasLabelNode = true;
        content.push(
          h(
            "span",
            {
              ...optionAria.labelProps,
              id: labelId.value,
              class: "spectrum-Menu-itemLabel",
            },
            String(rendered)
          )
        );
      } else {
        const nodes = Array.isArray(rendered) ? rendered : rendered != null ? [rendered] : [];
        for (const node of nodes) {
          if (typeof node === "string" || typeof node === "number") {
            if (!hasLabelNode) {
              hasLabelNode = true;
              content.push(
                h(
                  "span",
                  {
                    ...optionAria.labelProps,
                    id: labelId.value,
                    class: "spectrum-Menu-itemLabel",
                  },
                  String(node)
                )
              );
            } else {
              content.push(node);
            }
            continue;
          }

          if (!isVNode(node)) {
            content.push(node as any);
            continue;
          }

          const nodeProps = (node.props ?? {}) as Record<string, unknown>;
          if (nodeProps.slot === "description") {
            hasDescriptionNode = true;
            content.push(
              cloneVNode(node, {
                ...optionAria.descriptionProps,
                id: descriptionId.value,
                class: [nodeProps.class, "spectrum-Menu-description"],
              })
            );
            continue;
          }

          if (!hasLabelNode) {
            hasLabelNode = true;
            content.push(
              cloneVNode(node, {
                ...optionAria.labelProps,
                id: labelId.value,
                class: [nodeProps.class, "spectrum-Menu-itemLabel"],
              })
            );
            continue;
          }

          content.push(node);
        }
      }

      const description = (props.item.props as Record<string, unknown>).description as string | undefined;
      if (description) {
        hasDescriptionNode = true;
        content.push(
          h(
            "span",
            {
              ...optionAria.descriptionProps,
              id: descriptionId.value,
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
              "aria-labelledby":
                supportsLabelDescriptionAria.value && !hasAriaLabel.value && hasLabelNode
                  ? labelId.value
                  : undefined,
              "aria-describedby":
                supportsLabelDescriptionAria.value && hasDescriptionNode
                  ? descriptionId.value
                  : undefined,
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
