import { computed, defineComponent, h, ref, type PropType, type VNodeChild } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { BaseLayout } from "./BaseLayout";
import { provideCardViewContext } from "./CardViewContext";

export type SpectrumCardSelectionMode = "none" | "single" | "multiple";

export interface SpectrumCardViewProps<T = unknown> {
  items?: T[] | undefined;
  layout?: BaseLayout | undefined;
  selectionMode?: SpectrumCardSelectionMode | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeRenderable(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeRenderable(item));
  }

  return [value];
}

export const CardView = defineComponent({
  name: "CardView",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<unknown[] | undefined>,
      default: undefined,
    },
    layout: {
      type: Object as PropType<BaseLayout | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumCardSelectionMode | undefined>,
      default: undefined,
    },
    width: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
    height: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);
    const context = computed(() => ({
      inCardView: true,
      layout: props.layout?.type ?? null,
    }));

    provideCardViewContext(context);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>);
      const items = props.items;
      const rows = items
        ? items.map((item, index) =>
            h(
              "div",
              {
                key: index,
                role: "row",
                "aria-rowindex": String(index + 1),
                class: classNames("spectrum-CardView-row"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    class: classNames("spectrum-CardView-cell"),
                  },
                  normalizeRenderable(
                    slots.default?.({ item, index }) as VNodeChild[] | undefined
                  )
                ),
              ]
            )
          )
        : normalizeRenderable(slots.default?.()).map((child, index) =>
            h(
              "div",
              {
                key: index,
                role: "row",
                "aria-rowindex": String(index + 1),
                class: classNames("spectrum-CardView-row"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    class: classNames("spectrum-CardView-cell"),
                  },
                  [child]
                ),
              ]
            )
          );

      const className = classNames(
        "spectrum-CardView",
        {
          "spectrum-CardView--grid": props.layout?.type === "grid",
          "spectrum-CardView--gallery": props.layout?.type === "gallery",
          "spectrum-CardView--waterfall": props.layout?.type === "waterfall",
        },
        props.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      return h(
        "div",
        mergeProps(domProps, {
          ref: elementRef,
          role: "grid",
          "aria-label":
            props.ariaLabel ??
            ((attrs as Record<string, unknown>)["aria-label"] as string | undefined),
          "aria-labelledby":
            props.ariaLabelledby ??
            ((attrs as Record<string, unknown>)["aria-labelledby"] as string | undefined),
          "aria-rowcount": String(rows.length),
          "aria-colcount": "1",
          class: className,
          style: {
            ...(typeof domProps.style === "object" && domProps.style !== null
              ? (domProps.style as Record<string, unknown>)
              : {}),
            ...(props.width !== undefined ? { width: String(props.width) } : {}),
            ...(props.height !== undefined ? { height: String(props.height) } : {}),
            ...(props.UNSAFE_style ?? {}),
          },
        }),
        rows
      );
    };
  },
});
