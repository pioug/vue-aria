import { useBreadcrumbItem } from "@vue-aria/breadcrumbs";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";
import { computed, defineComponent, h, ref, type PropType } from "vue";
import type { SpectrumBreadcrumbItemProps } from "./types";

/**
 * Internal breadcrumb item renderer.
 */
export const BreadcrumbItem = defineComponent({
  name: "SpectrumBreadcrumbItem",
  inheritAttrs: false,
  props: {
    href: {
      type: String,
      required: false,
    },
    target: {
      type: String,
      required: false,
    },
    rel: {
      type: String,
      required: false,
    },
    isCurrent: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isMenu: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: unknown) => void) | undefined>,
      required: false,
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const direction = useLocale();
    const domRef = ref<HTMLElement | null>(null);
    const elementType = computed<"a" | "span">(() => (props.href ? "a" : "span"));
    const merged = {
      ...props,
      ...attrs,
      elementType: elementType.value,
    } as SpectrumBreadcrumbItemProps & Record<string, unknown>;
    const { itemProps } = useBreadcrumbItem(merged, {
      get current() {
        return domRef.value;
      },
      set current(value: Element | null) {
        domRef.value = value as HTMLElement | null;
      },
    });
    const { hoverProps, isHovered } = useHover(merged);

    return () => {
      const ElementType = elementType.value;
      const finalItemProps = props.isMenu ? {} : itemProps;

      return [
        h(
          FocusRing as any,
          {
            focusRingClass: "focus-ring",
          },
          {
            default: () =>
              h(
                ElementType,
                {
                  ...mergeProps(finalItemProps, hoverProps),
                  ref: domRef,
                  class: [
                    {
                      "spectrum-Breadcrumbs-itemLink": !props.isMenu,
                      "is-disabled": !props.isCurrent && props.isDisabled,
                      "is-hovered": isHovered,
                    },
                  ],
                },
                slots.default?.()
              ),
          }
        ),
        h(
          "span",
          {
            class: [
              "spectrum-Breadcrumbs-itemSeparator",
              {
                "is-reversed": direction.value.direction === "rtl",
              },
            ],
            "aria-hidden": "true",
          },
          "›"
        ),
      ];
    };
  },
});
