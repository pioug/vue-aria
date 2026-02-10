import { computed, defineComponent, h, ref } from "vue";
import { useNumberField } from "@vue-aria/numberfield";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useFormProps } from "@vue-spectrum/form";
import { Field } from "@vue-spectrum/label";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { StepButton } from "./StepButton";
import { numberFieldPropOptions, type SpectrumNumberFieldProps } from "./types";

export const NumberField = defineComponent({
  name: "NumberField",
  inheritAttrs: false,
  props: {
    ...numberFieldPropOptions,
  },
  setup(props, { attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const propsRecord = props as unknown as Record<string, unknown>;
    const provider = useProviderContext();
    const inputRef = ref<HTMLInputElement | null>(null);

    const resolvedFormProps = computed(() =>
      useFormProps({
        labelPosition: props.labelPosition,
        labelAlign: props.labelAlign,
        necessityIndicator: props.necessityIndicator,
        validationBehavior: props.validationBehavior,
      })
    );

    const isDisabled = computed(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );
    const isReadOnly = computed(
      () => props.isReadOnly ?? provider?.value.isReadOnly ?? false
    );
    const isRequired = computed(
      () => props.isRequired ?? provider?.value.isRequired ?? false
    );
    const validationState = computed(() => {
      const value = props.validationState ?? provider?.value.validationState;
      if (value === "valid" || value === "invalid") {
        return value;
      }

      return undefined;
    });
    const validationBehavior = computed(
      () =>
        props.validationBehavior ??
        resolvedFormProps.value.validationBehavior ??
        "aria"
    );

    const resolveStringProp = (
      kebabCase: string,
      camelCaseAlternatives: string[] = []
    ) =>
      computed(() => {
        const candidateKeys = [kebabCase, ...camelCaseAlternatives];

        for (const key of candidateKeys) {
          const value = propsRecord[key] ?? attrsRecord[key];
          if (typeof value === "string") {
            return value;
          }
        }

        return undefined;
      });

    const ariaLabel = resolveStringProp("aria-label", ["ariaLabel"]);
    const ariaLabelledBy = resolveStringProp("aria-labelledby", [
      "ariaLabelledby",
      "ariaLabeledby",
    ]);
    const ariaDescribedBy = resolveStringProp("aria-describedby", [
      "ariaDescribedby",
    ]);
    const ariaErrorMessage = resolveStringProp("aria-errormessage", [
      "ariaErrormessage",
    ]);

    const numberField = useNumberField({
      id: computed(() => props.id),
      label: computed(() => props.label),
      description: computed(() => props.description),
      errorMessage: computed(() => props.errorMessage),
      isInvalid:
        props.isInvalid !== undefined
          ? computed(() => props.isInvalid)
          : undefined,
      validationState,
      validationBehavior,
      isDisabled,
      isReadOnly,
      isRequired,
      value: props.value !== undefined ? computed(() => props.value) : undefined,
      defaultValue: props.defaultValue,
      minValue: computed(() => props.minValue),
      maxValue: computed(() => props.maxValue),
      step: computed(() => props.step),
      formatOptions: computed(() => props.formatOptions),
      decrementAriaLabel: computed(() => props.decrementAriaLabel),
      incrementAriaLabel: computed(() => props.incrementAriaLabel),
      name: computed(() => props.name),
      form: computed(() => props.form),
      placeholder: computed(() => props.placeholder),
      autoFocus: computed(() => props.autoFocus),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-errormessage": ariaErrorMessage,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      onKeydown: props.onKeydown,
      onKeyup: props.onKeyup,
      onChange: props.onChange,
      inputRef,
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });

    const showStepper = computed(() => !props.hideStepper);
    const isMobile = computed(() => provider?.value.scale === "large");
    const resolvedValidationState = computed(() =>
      validationState.value ?? (numberField.isInvalid.value ? "invalid" : undefined)
    );
    const hiddenInputValue = computed(() => {
      const value =
        props.value !== undefined ? props.value : numberField.numberValue.value;
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      return "";
    });

    return () =>
      h(
        Field,
        {
          ...(attrsRecord as Record<string, unknown>),
          label: props.label,
          labelPosition: props.labelPosition,
          labelAlign: props.labelAlign,
          necessityIndicator: props.necessityIndicator,
          includeNecessityIndicatorInAccessibilityName:
            props.includeNecessityIndicatorInAccessibilityName,
          description: props.description,
          errorMessage: props.errorMessage,
          isRequired: isRequired.value,
          isDisabled: isDisabled.value,
          isInvalid: numberField.isInvalid.value,
          validationState: resolvedValidationState.value,
          labelProps: numberField.labelProps.value,
          descriptionProps: numberField.descriptionProps.value,
          errorMessageProps: numberField.errorMessageProps.value,
          wrapperClassName: classNames(
            "spectrum-Stepper-container",
            {
              "spectrum-Stepper-container--isMobile": isMobile.value,
            }
          ),
        } as Record<string, unknown>,
        {
          default: () => [
            h(
              "div",
              mergeProps(numberField.groupProps.value, hoverProps, {
                class: classNames(
                  "spectrum-Stepper",
                  {
                    "spectrum-Stepper--isQuiet": Boolean(props.isQuiet),
                    "is-disabled": isDisabled.value,
                    "spectrum-Stepper--readonly": isReadOnly.value,
                    "is-invalid":
                      resolvedValidationState.value === "invalid" && !isDisabled.value,
                    "spectrum-Stepper--showStepper": showStepper.value,
                    "spectrum-Stepper--isMobile": isMobile.value,
                    "is-hovered": isHovered.value,
                  },
                  props.UNSAFE_className as ClassValue | undefined
                ),
                style: props.UNSAFE_style,
              }),
              [
                h(
                  "input",
                  mergeProps(numberField.inputProps.value, {
                    ref: (value: unknown) => {
                      inputRef.value = value as HTMLInputElement | null;
                    },
                    class: classNames("spectrum-Stepper-input"),
                  })
                ),
                showStepper.value
                  ? h(StepButton as any, {
                      direction: "up",
                      isQuiet: props.isQuiet,
                      ...(numberField.incrementButtonProps.value as Record<
                        string,
                        unknown
                      >),
                    } as Record<string, unknown>)
                  : null,
                showStepper.value
                  ? h(StepButton as any, {
                      direction: "down",
                      isQuiet: props.isQuiet,
                      ...(numberField.decrementButtonProps.value as Record<
                        string,
                        unknown
                      >),
                    } as Record<string, unknown>)
                  : null,
                props.name
                  ? h("input", {
                      type: "hidden",
                      name: props.name,
                      form: props.form,
                      value: hiddenInputValue.value,
                    })
                  : null,
              ]
            ),
          ],
        }
      );
  },
});
