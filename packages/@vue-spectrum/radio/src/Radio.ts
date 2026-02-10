import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  toValue,
  type PropType,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useRadio } from "@vue-aria/radio";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { useRadioGroupContext } from "./context";

export interface SpectrumRadioProps {
  value: string;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  onChange?: ((isSelected: boolean) => void) | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const Radio = defineComponent({
  name: "Radio",
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string>,
      required: true,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((isSelected: boolean) => void) | undefined>,
      default: undefined,
    },
    onPressStart: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressEnd: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
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
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    slot: {
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
    const groupContext = useRadioGroupContext();
    if (!groupContext) {
      throw new Error("Radio must be used within a RadioGroup.");
    }

    const elementRef = ref<HTMLLabelElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const attrsRecord = attrs as Record<string, unknown>;
    const isDisabled = computed(() => Boolean(props.isDisabled));
    const resolvedAriaLabel = computed(
      () => props.ariaLabel ?? (attrsRecord["aria-label"] as string | undefined)
    );
    const resolvedAriaLabelledby = computed(
      () =>
        props.ariaLabelledby ??
        (attrsRecord["aria-labelledby"] as string | undefined)
    );
    const resolvedAriaDescribedby = computed(
      () =>
        props.ariaDescribedby ??
        (attrsRecord["aria-describedby"] as string | undefined)
    );
    const groupInvalid = computed(() =>
      Boolean(
        groupContext.state.isInvalid === undefined
          ? false
          : toValue(groupContext.state.isInvalid)
      )
    );

    const radio = useRadio(
      {
        value: computed(() => props.value),
        isDisabled,
        onChange: props.onChange,
        onPressStart: props.onPressStart,
        onPressEnd: props.onPressEnd,
        onPress: props.onPress,
        "aria-label": resolvedAriaLabel,
        "aria-labelledby": resolvedAriaLabelledby,
        "aria-describedby": resolvedAriaDescribedby,
      },
      groupContext.state,
      inputRef
    );
    const { hoverProps, isHovered } = useHover({
      isDisabled: radio.isDisabled,
    });
    const { focusProps, isFocusVisible } = useFocusRing();

    onMounted(() => {
      if (!props.autoFocus) {
        return;
      }

      void nextTick(() => {
        inputRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(
        {
          ...attrsRecord,
          slot: props.slot,
        },
        { labelable: false }
      );

      return h(
        "label",
        mergeProps(domProps, radio.labelProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLLabelElement | null;
          },
          class: classNames(
            "spectrum-Radio",
            {
              "spectrum-Radio--quiet": !groupContext.isEmphasized.value,
              "is-disabled": radio.isDisabled.value,
              "is-invalid": groupInvalid.value,
              "is-hovered": isHovered.value,
              "focus-ring": isFocusVisible.value,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: props.UNSAFE_style,
        }),
        [
          h(
            "input",
            mergeProps(radio.inputProps.value, focusProps, {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | null;
              },
              class: classNames("spectrum-Radio-input"),
            })
          ),
          h("span", {
            class: classNames("spectrum-Radio-button"),
          }),
          slots.default
            ? h(
                "span",
                {
                  class: classNames("spectrum-Radio-label"),
                },
                slots.default()
              )
            : null,
        ]
      );
    };
  },
});
