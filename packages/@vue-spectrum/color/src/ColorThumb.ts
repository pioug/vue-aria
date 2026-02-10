import { computed, defineComponent, h } from "vue";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { colorThumbPropOptions } from "./types";

export const ColorThumb = defineComponent({
  name: "ColorThumb",
  inheritAttrs: false,
  props: {
    ...colorThumbPropOptions,
  },
  setup(props, { attrs }) {
    const size = computed(() => props.size ?? 12);

    return () => {
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return h("span", {
        ...(attrs as Record<string, unknown>),
        role: "presentation",
        "aria-label": props["aria-label"],
        class: classNames(
          "react-spectrum-ColorThumb",
          styleProps.class as ClassValue | undefined,
          (attrs as Record<string, unknown>).class as ClassValue | undefined
        ),
        style: {
          position: "absolute",
          left: `${props.x ?? 50}%`,
          top: `${props.y ?? 50}%`,
          width: `${size.value}px`,
          height: `${size.value}px`,
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
          backgroundColor: props.color,
          transform: "translate(-50%, -50%)",
          ...(styleProps.style as Record<string, unknown> | undefined),
        },
        hidden: styleProps.hidden,
      });
    };
  },
});
