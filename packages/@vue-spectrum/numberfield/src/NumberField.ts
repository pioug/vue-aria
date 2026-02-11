import { computed, defineComponent, h, ref, watch, watchEffect } from "vue";
import { useNumberField } from "@vue-aria/numberfield";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useFormContext, useFormValidationErrors } from "@vue-spectrum/form";
import { Field } from "@vue-spectrum/label";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { StepButton } from "./StepButton";
import {
  numberFieldPropOptions,
  type SpectrumNumberFieldErrorMessageContext,
  type SpectrumNumberFieldProps,
} from "./types";

export const NumberField = defineComponent({
  name: "NumberField",
  inheritAttrs: false,
  props: {
    ...numberFieldPropOptions,
  },
  setup(props, { attrs, expose }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const propsRecord = props as unknown as Record<string, unknown>;
    const provider = useProviderContext();
    const formContext = useFormContext();
    const formValidationErrors = useFormValidationErrors();
    const inputRef = ref<HTMLInputElement | null>(null);
    const groupRef = ref<HTMLElement | null>(null);
    const isServerErrorCleared = ref(false);
    const currentValue = ref<number | undefined>(
      props.value !== undefined ? props.value : props.defaultValue
    );
    const nativeValidationMessage = ref<string | undefined>(undefined);
    const nativeValidationDetails = ref<unknown>(undefined);

    watch(
      () => [formValidationErrors.value, props.name] as const,
      () => {
        isServerErrorCleared.value = false;
      },
      { deep: true }
    );

    watch(
      () => props.value,
      (nextValue) => {
        if (nextValue !== undefined) {
          currentValue.value = nextValue;
        }
      },
      { immediate: true }
    );

    const resolvedFormProps = computed(() => ({
      labelPosition: props.labelPosition ?? formContext?.value.labelPosition,
      labelAlign: props.labelAlign ?? formContext?.value.labelAlign,
      necessityIndicator:
        props.necessityIndicator ?? formContext?.value.necessityIndicator,
      validationBehavior:
        props.validationBehavior ?? formContext?.value.validationBehavior,
    }));

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
    const serverErrorMessageFromForm = computed(() => {
      if (!props.name) {
        return undefined;
      }

      const formError = formValidationErrors.value[props.name];
      if (typeof formError === "string") {
        return formError;
      }

      if (Array.isArray(formError)) {
        for (const entry of formError) {
          if (typeof entry === "string" && entry.trim().length > 0) {
            return entry;
          }
        }
      }

      return undefined;
    });
    const serverErrorMessage = computed(() =>
      isServerErrorCleared.value ? undefined : serverErrorMessageFromForm.value
    );
    const validationErrorMessage = computed(() => {
      if (typeof props.validate !== "function") {
        return undefined;
      }

      const result = props.validate(currentValue.value);
      if (typeof result === "string" && result.trim().length > 0) {
        return result;
      }

      if (Array.isArray(result)) {
        for (const entry of result) {
          if (typeof entry === "string" && entry.trim().length > 0) {
            return entry;
          }
        }
      }

      return undefined;
    });
    const ariaValidationErrorMessage = computed(() =>
      validationBehavior.value === "aria" ? validationErrorMessage.value : undefined
    );
    const baseValidationErrors = computed<string[]>(() => {
      if (serverErrorMessage.value) {
        return [serverErrorMessage.value];
      }

      if (ariaValidationErrorMessage.value) {
        return [ariaValidationErrorMessage.value];
      }

      if (nativeValidationMessage.value) {
        return [nativeValidationMessage.value];
      }

      return [];
    });
    const resolvedErrorMessageFromProp = computed<string | undefined>(() => {
      if (typeof props.errorMessage === "string") {
        return props.errorMessage;
      }

      if (typeof props.errorMessage !== "function") {
        return undefined;
      }

      const context: SpectrumNumberFieldErrorMessageContext = {
        isInvalid:
          Boolean(props.isInvalid) ||
          validationState.value === "invalid" ||
          baseValidationErrors.value.length > 0,
        validationErrors: baseValidationErrors.value,
        validationDetails: nativeValidationDetails.value ?? {},
      };
      const value = props.errorMessage(context);
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }

      return undefined;
    });
    const resolvedErrorMessage = computed(
      () =>
        resolvedErrorMessageFromProp.value ??
        serverErrorMessage.value ??
        ariaValidationErrorMessage.value ??
        nativeValidationMessage.value
    );
    const resolvedValidationState = computed(
      () =>
        validationState.value ??
        (serverErrorMessage.value ||
        ariaValidationErrorMessage.value ||
        nativeValidationMessage.value
          ? "invalid"
          : undefined)
    );
    const resolvedInvalid = computed(
      () =>
        Boolean(props.isInvalid) ||
        resolvedValidationState.value === "invalid" ||
        Boolean(serverErrorMessage.value) ||
        Boolean(ariaValidationErrorMessage.value) ||
        Boolean(nativeValidationMessage.value)
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
    const inputDataAttributes = computed<Record<string, unknown>>(() => {
      const dataAttributes: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(attrsRecord)) {
        if (key.startsWith("data-")) {
          dataAttributes[key] = value;
        }
      }

      return dataAttributes;
    });

    const numberField = useNumberField({
      id: computed(() => props.id),
      label: computed(() => props.label),
      description: computed(() => props.description),
      errorMessage: resolvedErrorMessage,
      isInvalid: resolvedInvalid,
      validationState: resolvedValidationState,
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
      isWheelDisabled: computed(() => props.isWheelDisabled),
      autoFocus: computed(() => props.autoFocus),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-errormessage": ariaErrorMessage,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      onKeydown: props.onKeydown,
      onKeyup: props.onKeyup,
      onInput: () => {
        if (serverErrorMessageFromForm.value) {
          isServerErrorCleared.value = true;
        }
      },
      onChange: (value) => {
        currentValue.value = value;
        if (serverErrorMessageFromForm.value) {
          isServerErrorCleared.value = true;
        }
        props.onChange?.(value);
      },
      inputRef,
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });

    const showStepper = computed(() => !props.hideStepper);
    const isMobile = computed(() => provider?.value.scale === "large");
    const resolvedValidationStateForField = computed(
      () =>
        resolvedValidationState.value ??
        (numberField.isInvalid.value ? "invalid" : undefined)
    );
    const hiddenInputValue = computed(() => {
      const value =
        props.value !== undefined ? props.value : numberField.numberValue.value;
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      return "";
    });

    watchEffect(() => {
      const inputElement = inputRef.value;
      if (!inputElement) {
        return;
      }

      if (validationBehavior.value === "native") {
        const customValidityMessage =
          serverErrorMessage.value ?? (validationErrorMessage.value ?? "");
        inputElement.setCustomValidity(customValidityMessage);
        return;
      }

      inputElement.setCustomValidity("");
    });

    watch(
      () => validationBehavior.value,
      (nextBehavior) => {
        if (nextBehavior !== "native") {
          nativeValidationMessage.value = undefined;
          nativeValidationDetails.value = undefined;
        }
      },
      { immediate: true }
    );

    watchEffect((onCleanup) => {
      const inputElement = inputRef.value;
      if (!inputElement) {
        return;
      }

      const onNativeInvalid = () => {
        if (validationBehavior.value !== "native") {
          return;
        }

        nativeValidationMessage.value =
          inputElement.validationMessage || "Constraints not satisfied";
        nativeValidationDetails.value = inputElement.validity;
      };
      const onNativeBlur = () => {
        if (validationBehavior.value !== "native") {
          return;
        }

        if (inputElement.validity.valid) {
          nativeValidationMessage.value = undefined;
          nativeValidationDetails.value = inputElement.validity;
        }
      };
      const onFormReset = () => {
        nativeValidationMessage.value = undefined;
        nativeValidationDetails.value = undefined;
      };

      inputElement.addEventListener("invalid", onNativeInvalid);
      inputElement.addEventListener("blur", onNativeBlur);
      inputElement.form?.addEventListener("reset", onFormReset);

      onCleanup(() => {
        inputElement.removeEventListener("invalid", onNativeInvalid);
        inputElement.removeEventListener("blur", onNativeBlur);
        inputElement.form?.removeEventListener("reset", onFormReset);
      });
    });

    expose({
      UNSAFE_getDOMNode: () => groupRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
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
          errorMessage: resolvedErrorMessage.value,
          validationErrors: baseValidationErrors.value,
          validationDetails: nativeValidationDetails.value ?? {},
          isRequired: isRequired.value,
          isDisabled: isDisabled.value,
          isInvalid: resolvedInvalid.value,
          validationState: resolvedValidationStateForField.value,
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
                ref: (value: unknown) => {
                  groupRef.value = value as HTMLElement | null;
                },
                class: classNames(
                  "spectrum-Stepper",
                  {
                    "spectrum-Stepper--isQuiet": Boolean(props.isQuiet),
                    "is-disabled": isDisabled.value,
                    "spectrum-Stepper--readonly": isReadOnly.value,
                    "is-invalid":
                      resolvedValidationStateForField.value === "invalid" &&
                      !isDisabled.value,
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
                  mergeProps(numberField.inputProps.value, inputDataAttributes.value, {
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
