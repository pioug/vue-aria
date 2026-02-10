import { computed, defineComponent, h, ref, watch } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorThumb } from "./ColorThumb";
import { colorWheelPropOptions } from "./types";
import { hexToHsl, hslToHex, tryParseColor } from "./utils";

export const ColorWheel = defineComponent({
  name: "ColorWheel",
  inheritAttrs: false,
  props: {
    ...colorWheelPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);

    const normalizeColor = (value: string | null | undefined): string => {
      const parsed = tryParseColor(value ?? "");
      return parsed ?? "#FF0000";
    };

    const isControlled = computed(() => props.value !== undefined);
    const uncontrolledColor = ref<string>(normalizeColor(props.defaultValue));

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isControlled.value) {
          uncontrolledColor.value = normalizeColor(nextValue);
        }
      }
    );

    const currentColor = computed(() =>
      isControlled.value
        ? normalizeColor(props.value)
        : normalizeColor(uncontrolledColor.value)
    );
    const hueValue = computed(() => hexToHsl(currentColor.value).hue);

    const setHue = (hue: number) => {
      const nextColor = hslToHex(hue, 100, 50);
      if (!isControlled.value) {
        uncontrolledColor.value = nextColor;
      }

      props.onChange?.(nextColor);
    };

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        rootRef.value?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ColorWheel",
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            display: "grid",
            gap: "8px",
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
        }),
        [
          h("div", {
            class: classNames("react-spectrum-ColorWheel-ring"),
            style: {
              position: "relative",
              width: "120px",
              height: "120px",
              borderRadius: "999px",
              border: "8px solid transparent",
              background:
                "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            },
          }, [
            h(ColorThumb as any, {
              color: currentColor.value,
              x: ((hueValue.value % 360) / 360) * 100,
              y: 50,
              size: 10,
              "aria-label": "Hue thumb",
            }),
          ]),
          h("input", {
            type: "range",
            min: 0,
            max: 360,
            step: 1,
            value: hueValue.value,
            disabled: props.isDisabled,
            "aria-label": props["aria-label"] ?? props.ariaLabel ?? props.label ?? "Hue",
            "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
            "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
            class: classNames("react-spectrum-ColorWheel-input"),
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null;
              setHue(Number(target?.value ?? 0));
            },
          }),
        ]
      );
    };
  },
});
