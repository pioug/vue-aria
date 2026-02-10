import { computed, defineComponent, h, ref, watch } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorArea } from "./ColorArea";
import { ColorField } from "./ColorField";
import { ColorSlider } from "./ColorSlider";
import { colorEditorPropOptions } from "./types";
import { hexToHsl, hslToHex, parseColor, tryParseColor } from "./utils";

export const ColorEditor = defineComponent({
  name: "ColorEditor",
  inheritAttrs: false,
  props: {
    ...colorEditorPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);

    const normalizeColor = (value: string | null | undefined) => {
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

    const setColor = (nextColor: string) => {
      const normalized = parseColor(nextColor);
      if (!isControlled.value) {
        uncontrolledColor.value = normalized;
      }

      props.onChange?.(normalized);
    };

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
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

      const hsl = hexToHsl(currentColor.value);

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ColorEditor",
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            display: "grid",
            gap: "12px",
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
        }),
        [
          h(ColorArea as any, {
            value: currentColor.value,
            isDisabled: props.isDisabled,
            isReadOnly: props.isReadOnly,
            onChange: setColor,
            "aria-label": "Color area",
          }),
          h(ColorSlider as any, {
            label: "Hue",
            channel: "hue",
            minValue: 0,
            maxValue: 360,
            value: hsl.hue,
            isDisabled: props.isDisabled,
            onChange: (nextHue: number) => {
              setColor(hslToHex(nextHue, hsl.saturation, hsl.lightness));
            },
          }),
          props.showAlpha
            ? h(ColorSlider as any, {
                label: "Alpha",
                channel: "alpha",
                minValue: 0,
                maxValue: 100,
                defaultValue: 100,
                isDisabled: props.isDisabled,
              })
            : null,
          h(ColorField as any, {
            label: props.label ?? "Hex",
            value: currentColor.value,
            isDisabled: props.isDisabled,
            isReadOnly: props.isReadOnly,
            onChange: (nextColor: string | null) => {
              if (nextColor) {
                setColor(nextColor);
              }
            },
          }),
        ]
      );
    };
  },
});
