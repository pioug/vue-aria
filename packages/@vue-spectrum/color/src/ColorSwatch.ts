import { defineComponent, h } from "vue";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { colorSwatchPropOptions } from "./types";
import { parseColor, toColorLabel } from "./utils";

export const ColorSwatch = defineComponent({
  name: "ColorSwatch",
  inheritAttrs: false,
  props: {
    ...colorSwatchPropOptions,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const size = props.size ?? "M";
      const side = size === "S" ? 16 : size === "L" ? 28 : 22;
      const color = props.color ? parseColor(props.color) : "#000000";

      return h(
        "span",
        {
          ...(attrs as Record<string, unknown>),
          role: "img",
          "aria-label": props["aria-label"] ?? props.label ?? toColorLabel(color),
          class: classNames(
            "react-spectrum-ColorSwatch",
            `react-spectrum-ColorSwatch--${size}`,
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            (attrs as Record<string, unknown>).class as ClassValue | undefined
          ),
          style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${side}px`,
            height: `${side}px`,
            borderRadius: "4px",
            border: "1px solid rgba(15, 23, 42, 0.2)",
            backgroundColor: color,
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
        },
        slots.default ? slots.default() : undefined
      );
    };
  },
});
