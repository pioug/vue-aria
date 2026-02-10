import { computed, defineComponent, h, ref, watch } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { colorSliderPropOptions } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const ColorSlider = defineComponent({
  name: "ColorSlider",
  inheritAttrs: false,
  props: {
    ...colorSliderPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const minValue = computed(() => props.minValue ?? 0);
    const maxValue = computed(() => props.maxValue ?? (props.channel === "hue" ? 360 : 100));
    const step = computed(() => props.step ?? 1);
    const isControlled = computed(() => props.value !== undefined);

    const normalizedInitial = clamp(
      props.defaultValue ?? minValue.value,
      minValue.value,
      maxValue.value
    );
    const uncontrolledValue = ref<number>(normalizedInitial);

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isControlled.value && nextValue !== undefined) {
          uncontrolledValue.value = clamp(nextValue, minValue.value, maxValue.value);
        }
      }
    );

    const resolvedValue = computed(() => {
      if (isControlled.value) {
        return clamp(props.value ?? minValue.value, minValue.value, maxValue.value);
      }

      return clamp(uncontrolledValue.value, minValue.value, maxValue.value);
    });

    const setValue = (nextValue: number) => {
      const normalized = clamp(nextValue, minValue.value, maxValue.value);
      if (!isControlled.value) {
        uncontrolledValue.value = normalized;
      }

      props.onChange?.(normalized);
    };

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
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

      const label = props.label ?? props.channel ?? "Color";

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ColorSlider",
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
        }),
        [
          h("div", { class: classNames("react-spectrum-ColorSlider-header") }, [
            h("span", { class: classNames("spectrum-FieldLabel") }, label),
            h("output", { class: classNames("react-spectrum-ColorSlider-value") }, String(resolvedValue.value)),
          ]),
          h("input", {
            ref: (value: unknown) => {
              inputRef.value = value as HTMLInputElement | null;
            },
            type: "range",
            min: minValue.value,
            max: maxValue.value,
            step: step.value,
            value: resolvedValue.value,
            disabled: props.isDisabled,
            "aria-label": props["aria-label"] ?? props.ariaLabel ?? label,
            "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
            "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
            class: classNames("react-spectrum-ColorSlider-input"),
            onInput: (event: Event) => {
              const target = event.target as HTMLInputElement | null;
              setValue(Number(target?.value ?? minValue.value));
            },
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement | null;
              props.onChangeEnd?.(Number(target?.value ?? minValue.value));
            },
          }),
        ]
      );
    };
  },
});
