import { useRadio } from "@vue-aria/radio";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, inject, onMounted, ref, type PropType } from "vue";
import { RadioGroupContextSymbol } from "./context";
import type { SpectrumRadioProps } from "./types";

function createInputRefObject(inputRef: { value: HTMLInputElement | null }) {
  return {
    get current() {
      return inputRef.value;
    },
    set current(value: HTMLInputElement | null) {
      inputRef.value = value;
    },
  };
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

/**
 * A Radio renders a single option inside a RadioGroup.
 */
export const Radio = defineComponent({
  name: "SpectrumRadio",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: true,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    onChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      required: false,
    },
    onPress: {
      type: Function,
      required: false,
    },
    onPressStart: {
      type: Function,
      required: false,
    },
    onPressEnd: {
      type: Function,
      required: false,
    },
    onPressUp: {
      type: Function,
      required: false,
    },
    onPressChange: {
      type: Function,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const labelRef = ref<HTMLElement | null>(null);
    const inputRefObject = createInputRefObject(inputRef);
    const radioGroupContext = inject(RadioGroupContextSymbol, null);
    if (!radioGroupContext) {
      throw new Error("Radio must be rendered inside a RadioGroup.");
    }

    const merged = useProviderProps(omitUndefined({
      ...props,
      ...attrs,
      children: slots.default ? true : undefined,
    } as Record<string, unknown>)) as SpectrumRadioProps & Record<string, unknown>;
    const { inputProps, labelProps, isDisabled } = useRadio(merged, radioGroupContext.state, inputRefObject);
    const { hoverProps, isHovered } = useHover({ isDisabled });
    const { styleProps } = useStyleProps(merged);
    const isEmphasized = computed(() => Boolean(radioGroupContext.isEmphasized));
    const isSelected = computed(() => radioGroupContext.state.selectedValue === String(merged.value));
    const tabIndex = computed(() => {
      if (isDisabled) {
        return undefined;
      }

      if (radioGroupContext.state.selectedValue != null) {
        return isSelected.value ? 0 : -1;
      }

      return radioGroupContext.state.lastFocusedValue === String(merged.value)
        || radioGroupContext.state.lastFocusedValue == null
        ? 0
        : -1;
    });

    onMounted(() => {
      if (props.autoFocus) {
        inputRef.value?.focus();
      }
    });

    expose({
      focus: () => inputRef.value?.focus(),
      UNSAFE_getDOMNode: () => labelRef.value,
    });

    return () =>
      h(
        "label",
        {
          ...mergeProps(labelProps, hoverProps),
          ...styleProps.value,
          ref: labelRef,
          class: [
            "spectrum-Radio",
            {
              "spectrum-Radio--quiet": !isEmphasized.value,
              "is-disabled": isDisabled,
              "is-invalid": radioGroupContext.state.isInvalid,
              "is-hovered": isHovered,
            },
            styleProps.value.class,
          ],
        },
        [
          h(
            FocusRing,
            { focusRingClass: "focus-ring", autoFocus: props.autoFocus },
            {
              default: () =>
                h("input", {
                  ...inputProps,
                  ref: inputRef,
                  class: "spectrum-Radio-input",
                  checked: isSelected.value,
                  tabIndex: tabIndex.value,
                }),
            }
          ),
          h("span", { class: "spectrum-Radio-button", "aria-hidden": "true" }),
          slots.default
            ? h("span", { class: "spectrum-Radio-label" }, slots.default())
            : null,
        ]
      );
  },
});
