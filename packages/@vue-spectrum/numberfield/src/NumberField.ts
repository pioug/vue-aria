import { useNumberField } from "@vue-aria/numberfield";
import { useNumberFieldState } from "@vue-aria/numberfield-state";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useLocale } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import { TextFieldBase } from "@vue-spectrum/textfield";
import { useProviderProps } from "@vue-spectrum/provider";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, ref, type PropType } from "vue";
import { StepButton } from "./StepButton";
import type { SpectrumNumberFieldProps } from "./types";

/**
 * NumberField allows users to enter and step numeric values.
 */
export const NumberField = defineComponent({
  name: "SpectrumNumberField",
  inheritAttrs: false,
  props: {
    value: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    defaultValue: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    minValue: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    maxValue: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    step: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<((value: number) => void) | undefined>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      required: false,
    },
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      required: false,
    },
    onFocusChange: {
      type: Function as PropType<((isFocused: boolean) => void) | undefined>,
      required: false,
    },
    onKeyDown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      required: false,
    },
    onKeyUp: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      required: false,
    },
    onCopy: {
      type: Function as PropType<((event: ClipboardEvent) => void) | undefined>,
      required: false,
    },
    onCut: {
      type: Function as PropType<((event: ClipboardEvent) => void) | undefined>,
      required: false,
    },
    onPaste: {
      type: Function as PropType<((event: ClipboardEvent) => void) | undefined>,
      required: false,
    },
    onCompositionStart: {
      type: Function as PropType<((event: CompositionEvent) => void) | undefined>,
      required: false,
    },
    onCompositionEnd: {
      type: Function as PropType<((event: CompositionEvent) => void) | undefined>,
      required: false,
    },
    onCompositionUpdate: {
      type: Function as PropType<((event: CompositionEvent) => void) | undefined>,
      required: false,
    },
    onSelect: {
      type: Function as PropType<((event: Event) => void) | undefined>,
      required: false,
    },
    onBeforeInput: {
      type: Function as PropType<((event: InputEvent) => void) | undefined>,
      required: false,
    },
    onInput: {
      type: Function as PropType<((event: InputEvent) => void) | undefined>,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    validationBehavior: {
      type: String as () => "aria" | "native" | undefined,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isRequired: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    hideStepper: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    formatOptions: {
      type: Object as () => Intl.NumberFormatOptions | undefined,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    form: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
    },
    isWheelDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
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
  setup(props, { attrs, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const mergedProvider = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumNumberFieldProps & Record<string, unknown>;
    const merged = useSlotProps(mergedProvider, "numberfield") as SpectrumNumberFieldProps & Record<string, unknown>;
    const locale = useLocale();
    const state = useNumberFieldState({
      ...merged,
      locale: locale.value.locale,
    });
    const result = useNumberField(merged, state, {
      get current() {
        return inputRef.value;
      },
      set current(value: HTMLInputElement | null) {
        inputRef.value = value;
      },
    });
    const { styleProps } = useStyleProps(merged);
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });
    const validationState = computed(
      () => merged.validationState || (result.isInvalid ? "invalid" : undefined)
    );
    const showStepper = computed(() => !merged.hideStepper);
    const groupProps = computed(() => mergeProps(result.groupProps, hoverProps));
    const wrapperChildren = computed(() => {
      const children: unknown[] = [];
      if (showStepper.value) {
        children.push(
          h(StepButton as any, {
            direction: "up",
            isQuiet: merged.isQuiet,
            ...result.incrementButtonProps,
          })
        );
        children.push(
          h(StepButton as any, {
            direction: "down",
            isQuiet: merged.isQuiet,
            ...result.decrementButtonProps,
          })
        );
      }

      if (merged.name) {
        const value = Number.isNaN(state.numberValue) ? "" : String(state.numberValue);
        children.push(
          h("input", {
            type: "hidden",
            name: merged.name,
            form: merged.form,
            value,
          })
        );
      }

      return children.length > 0 ? children : undefined;
    });

    expose({
      focus: () => inputRef.value?.focus(),
      UNSAFE_getDOMNode: () => inputRef.value?.closest(".spectrum-Stepper"),
    });

    return () =>
      h(
        "div",
        {
          class: [
            "spectrum-Stepper-container",
          ],
        },
        [
          h(
            FocusRing as any,
            {
              within: true,
              isTextInput: true,
              focusClass: "is-focused",
              focusRingClass: "focus-ring",
              autoFocus: Boolean(merged.autoFocus),
            },
            {
              default: () =>
                h(
                  "div",
                  {
                    ...groupProps.value,
                    ...styleProps.value,
                    class: [
                      "spectrum-Stepper",
                      {
                        "spectrum-Stepper--isQuiet": Boolean(merged.isQuiet),
                        "is-disabled": Boolean(merged.isDisabled),
                        "spectrum-Stepper--readonly": Boolean(merged.isReadOnly),
                        "is-invalid": validationState.value === "invalid" && !merged.isDisabled,
                        "spectrum-Stepper--showStepper": showStepper.value,
                        "is-hovered": isHovered,
                      },
                      merged.UNSAFE_className,
                      styleProps.value.class,
                    ],
                  },
                  [
                    h(TextFieldBase as any, {
                      label: merged.label,
                      description: merged.description,
                      errorMessage: merged.errorMessage,
                      labelProps: result.labelProps,
                      descriptionProps: result.descriptionProps,
                      errorMessageProps: result.errorMessageProps,
                      isDisabled: Boolean(merged.isDisabled),
                      isQuiet: Boolean(merged.isQuiet),
                      validationState: validationState.value,
                      UNSAFE_className: "spectrum-Stepper-field",
                      inputClassName: "spectrum-Stepper-input",
                      validationIconClassName: "spectrum-Stepper-icon",
                      inputProps: {
                        ...result.inputProps,
                        ref: inputRef,
                      },
                    }),
                    ...(wrapperChildren.value as any[] | undefined ?? []),
                  ]
                ),
            }
          ),
        ]
      );
  },
});
