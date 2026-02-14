import { useBreadcrumbs } from "@vue-aria/breadcrumbs";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, ref, type PropType, type VNode } from "vue";
import { BreadcrumbItem } from "./BreadcrumbItem";
import type { SpectrumBreadcrumbsProps, SpectrumItemProps } from "./types";

/**
 * Breadcrumbs show hierarchy and navigational context.
 */
export const Breadcrumbs = defineComponent({
  name: "SpectrumBreadcrumbs",
  inheritAttrs: false,
  props: {
    size: {
      type: String as () => SpectrumBreadcrumbsProps["size"],
      required: false,
      default: "L",
    },
    isMultiline: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    showRoot: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocusCurrent: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: string | number) => void) | undefined>,
      required: false,
    },
    id: {
      type: String,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumBreadcrumbsProps & Record<string, unknown>;
    const { navProps } = useBreadcrumbs(merged);
    const { styleProps } = useStyleProps(merged);

    const childArray = computed(() => {
      const nodes = slots.default?.() ?? [];
      const valid = nodes.filter((child): child is VNode => typeof child.type !== "symbol");
      return valid;
    });

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () => {
      const lastIndex = childArray.value.length - 1;

      return h(
        "nav",
        {
          ...styleProps.value,
          ...navProps,
          ref: domRef,
        },
        [
          h(
            "ul",
            {
              class: [
                "spectrum-Breadcrumbs",
                {
                  "spectrum-Breadcrumbs--small": merged.size === "S",
                  "spectrum-Breadcrumbs--medium": merged.size === "M",
                  "spectrum-Breadcrumbs--multiline": Boolean(merged.isMultiline),
                  "spectrum-Breadcrumbs--showRoot": Boolean(merged.showRoot),
                  "is-disabled": Boolean(merged.isDisabled),
                },
                merged.UNSAFE_className,
                styleProps.value.class,
              ],
            },
            childArray.value.map((child, index) => {
              const itemProps = (child.props ?? {}) as SpectrumItemProps & Record<string, unknown>;
              const childContent =
                typeof child.children === "object" && child.children && "default" in child.children
                  ? (child.children as { default?: () => unknown }).default?.()
                  : child.children;
              const key = child.key ?? index;
              const isCurrent = index === lastIndex;
              const onPress = () => merged.onAction?.(key as string | number);
              return h(
                "li",
                {
                  key: String(key),
                  class: "spectrum-Breadcrumbs-item",
                },
                [
                  h(
                    BreadcrumbItem as any,
                    {
                      ...itemProps,
                      key,
                      isCurrent,
                      isDisabled: merged.isDisabled,
                      onPress,
                      autoFocus: isCurrent && Boolean(merged.autoFocusCurrent),
                    },
                    {
                      default: () => childContent,
                    }
                  ),
                ]
              );
            })
          ),
        ]
      );
    };
  },
});
