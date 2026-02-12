import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
} from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorThumb } from "./ColorThumb";
import { colorAreaPropOptions } from "./types";
import { hexToHsl, hslToHex, parseColor, tryParseColor } from "./utils";

const COLORAREA_INTL_MESSAGES = {
  "en-US": {
    colorArea: "Color area",
    colorPosition: "Color position",
  },
  "fr-FR": {
    colorArea: "Zone de couleur",
    colorPosition: "Position de la couleur",
  },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveClientPosition(
  event: MouseEvent | PointerEvent,
  element: HTMLElement
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
  return { x, y };
}

export const ColorArea = defineComponent({
  name: "ColorArea",
  inheritAttrs: false,
  props: {
    ...colorAreaPropOptions,
  },
  setup(props, { attrs, expose }) {
    const stringFormatter = useLocalizedStringFormatter(
      COLORAREA_INTL_MESSAGES,
      "@vue-spectrum/color"
    );
    const rootRef = ref<HTMLElement | null>(null);

    const normalizeColor = (value: string | null | undefined) => {
      if (!value) {
        return "#FF0000";
      }

      const parsed = tryParseColor(value);
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

    const hslValue = computed(() => hexToHsl(currentColor.value));
    const thumbX = computed(() => hslValue.value.saturation);
    const thumbY = computed(() => 100 - hslValue.value.lightness);

    const setFromPoint = (x: number, y: number) => {
      const nextColor = hslToHex(hslValue.value.hue, x, 100 - y);
      if (!isControlled.value) {
        uncontrolledColor.value = nextColor;
      }
      props.onChange?.(nextColor);
    };

    const onPointerMove = (event: PointerEvent) => {
      const element = rootRef.value;
      if (!element) {
        return;
      }

      const position = resolveClientPosition(event, element);
      setFromPoint(position.x, position.y);
    };

    const stopDrag = () => {
      if (typeof window === "undefined") {
        return;
      }

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
    };

    const onPointerDown = (event: PointerEvent) => {
      const element = rootRef.value;
      if (!element || props.isDisabled || props.isReadOnly) {
        return;
      }

      const position = resolveClientPosition(event, element);
      setFromPoint(position.x, position.y);

      if (typeof window === "undefined") {
        return;
      }

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDrag);
    };

    onBeforeUnmount(() => {
      stopDrag();
    });

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

      const hueColor = hslToHex(hslValue.value.hue, 100, 50);

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          tabindex: props.isDisabled ? undefined : 0,
          role: "application",
          "aria-label":
            props["aria-label"] ??
            props.ariaLabel ??
            props.label ??
            stringFormatter.value.format("colorArea"),
          "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
          "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
          class: classNames(
            "react-spectrum-ColorArea",
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            position: "relative",
            width: "220px",
            height: "160px",
            borderRadius: "8px",
            border: "1px solid rgba(15, 23, 42, 0.25)",
            backgroundImage: [
              "linear-gradient(to top, #000 0%, transparent 100%)",
              `linear-gradient(to right, #fff 0%, ${hueColor} 100%)`,
            ].join(","),
            cursor: props.isDisabled ? "not-allowed" : "crosshair",
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
          onPointerdown: onPointerDown,
        }),
        [
          h(ColorThumb as any, {
            color: parseColor(currentColor.value),
            x: thumbX.value,
            y: thumbY.value,
            ariaLabel: stringFormatter.value.format("colorPosition"),
          }),
        ]
      );
    };
  },
});
