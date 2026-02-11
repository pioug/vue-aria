import { computed, defineComponent, h, ref, watch } from "vue";
import { useSearchField } from "@vue-aria/searchfield";
import { ClearButton } from "@vue-spectrum/button";
import { useFormProps } from "@vue-spectrum/form";
import { useProviderContext } from "@vue-spectrum/provider";
import {
  TextFieldBase,
  type SpectrumTextFieldValidationBehavior,
  type SpectrumTextFieldValidationState,
} from "@vue-spectrum/textfield";
import {
  classNames,
  useSlotProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  searchFieldPropOptions,
  type SpectrumSearchFieldProps,
} from "./types";

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/SearchField.html#help-text";

export const SearchField = defineComponent({
  name: "SearchField",
  inheritAttrs: false,
  props: {
    ...searchFieldPropOptions,
  },
  setup(props, { attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const slottedProps = computed(() =>
      useSlotProps(
        props as unknown as SpectrumSearchFieldProps & Record<string, unknown>,
        "searchfield"
      )
    );
    const propsRecord = computed(
      () => slottedProps.value as unknown as Record<string, unknown>
    );
    const provider = useProviderContext();
    const inputRef = ref<HTMLInputElement | null>(null);
    const hasWarnedPlaceholder = ref(false);
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    watch(
      () => propsRecord.value.placeholder as string | undefined,
      (placeholder) => {
        if (isProduction || hasWarnedPlaceholder.value || !placeholder) {
          return;
        }

        console.warn(PLACEHOLDER_DEPRECATION_WARNING);
        hasWarnedPlaceholder.value = true;
      },
      { immediate: true }
    );

    const resolveStringProp = (
      kebabCase: string,
      camelCaseAlternatives: string[] = []
    ) =>
      computed(() => {
        const candidateKeys = [kebabCase, ...camelCaseAlternatives];

        for (const key of candidateKeys) {
          const value = propsRecord.value[key] ?? attrsRecord[key];
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

    const resolvedFormProps = computed(() =>
      useFormProps({
        labelPosition: propsRecord.value.labelPosition as
          | SpectrumSearchFieldProps["labelPosition"]
          | undefined,
        labelAlign: propsRecord.value.labelAlign as
          | SpectrumSearchFieldProps["labelAlign"]
          | undefined,
        necessityIndicator: propsRecord.value.necessityIndicator as
          | SpectrumSearchFieldProps["necessityIndicator"]
          | undefined,
        validationBehavior: propsRecord.value.validationBehavior as
          | SpectrumSearchFieldProps["validationBehavior"]
          | undefined,
      })
    );

    const isDisabled = computed(
      () =>
        (propsRecord.value.isDisabled as boolean | undefined) ??
        provider?.value.isDisabled ??
        false
    );
    const isReadOnly = computed(
      () =>
        (propsRecord.value.isReadOnly as boolean | undefined) ??
        provider?.value.isReadOnly ??
        false
    );
    const isRequired = computed(
      () =>
        (propsRecord.value.isRequired as boolean | undefined) ??
        provider?.value.isRequired ??
        false
    );
    const validationState = computed(() => {
      const value =
        (propsRecord.value.validationState as
          | SpectrumSearchFieldProps["validationState"]
          | undefined) ??
        provider?.value.validationState;
      if (value === "valid" || value === "invalid") {
        return value;
      }

      return undefined;
    });
    const validationBehavior = computed<SpectrumTextFieldValidationBehavior>(
      () =>
        (propsRecord.value.validationBehavior as
          | SpectrumTextFieldValidationBehavior
          | undefined) ??
        (resolvedFormProps.value.validationBehavior as
          | SpectrumTextFieldValidationBehavior
          | undefined) ??
        "aria"
    );
    const hasControlledValue = computed(
      () => propsRecord.value.value !== undefined
    );

    const searchField = useSearchField({
      id: computed(() => propsRecord.value.id as string | undefined),
      label: computed(() => propsRecord.value.label as string | undefined),
      description: computed(
        () => propsRecord.value.description as string | undefined
      ),
      errorMessage: computed(
        () => propsRecord.value.errorMessage as string | undefined
      ),
      isInvalid: computed(
        () => propsRecord.value.isInvalid as boolean | undefined
      ),
      validationState,
      validationBehavior,
      isDisabled,
      isReadOnly,
      isRequired,
      value: hasControlledValue.value
        ? computed(() => propsRecord.value.value as string | undefined)
        : undefined,
      defaultValue: computed(
        () => propsRecord.value.defaultValue as string | undefined
      ),
      name: computed(() => propsRecord.value.name as string | undefined),
      form: computed(() => propsRecord.value.form as string | undefined),
      placeholder: computed(
        () => propsRecord.value.placeholder as string | undefined
      ),
      autoFocus: computed(
        () => propsRecord.value.autoFocus as boolean | undefined
      ),
      autoComplete: computed(
        () => propsRecord.value.autoComplete as string | undefined
      ),
      autoCapitalize: computed(
        () => propsRecord.value.autoCapitalize as string | undefined
      ),
      inputMode: computed(
        () => propsRecord.value.inputMode as string | undefined
      ),
      autoCorrect: computed(
        () => propsRecord.value.autoCorrect as string | undefined
      ),
      spellCheck: computed(
        () => propsRecord.value.spellCheck as boolean | undefined
      ),
      enterKeyHint: computed(
        () => propsRecord.value.enterKeyHint as string | undefined
      ),
      maxLength: computed(
        () => propsRecord.value.maxLength as number | undefined
      ),
      minLength: computed(
        () => propsRecord.value.minLength as number | undefined
      ),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-errormessage": ariaErrorMessage,
      onInput: propsRecord.value.onInput as
        | ((value: string) => void)
        | undefined,
      onChange: propsRecord.value.onChange as
        | ((value: string) => void)
        | undefined,
      onFocus: propsRecord.value.onFocus as
        | ((event: FocusEvent) => void)
        | undefined,
      onBlur: propsRecord.value.onBlur as
        | ((event: FocusEvent) => void)
        | undefined,
      onKeydown: (propsRecord.value.onKeydown ?? attrsRecord.onKeydown) as
        | ((event: KeyboardEvent) => void)
        | undefined,
      onSubmit: propsRecord.value.onSubmit as
        | ((value: string) => void)
        | undefined,
      onClear: propsRecord.value.onClear as (() => void) | undefined,
      inputRef,
    });

    const resolvedValidationState = computed<SpectrumTextFieldValidationState | undefined>(
      () => validationState.value ?? (searchField.isInvalid.value ? "invalid" : undefined)
    );

    const resolvedIcon = computed(() => {
      const icon = propsRecord.value.icon as SpectrumSearchFieldProps["icon"];
      if (icon === "" || icon === null) {
        return undefined;
      }

      if (icon !== undefined) {
        return icon;
      }

      return h("span", {
        "data-testid": "searchicon",
        "aria-hidden": "true",
      });
    });

    const inputProps = computed<Record<string, unknown>>(() => {
      const baseProps = {
        ...searchField.inputProps.value,
      };

      if (propsRecord.value.excludeFromTabOrder) {
        baseProps.tabIndex = -1;
      }

      return baseProps;
    });

    const showClearButton = computed(() => {
      if (isReadOnly.value) {
        return false;
      }

      const currentValue = searchField.inputProps.value.value;
      return typeof currentValue === "string" && currentValue.length > 0;
    });

    return () => {
      const clearButtonProps = searchField.clearButtonProps.value;
      const clearButtonOnPress = clearButtonProps.onPress as
        | (() => void)
        | undefined;
      const clearButtonOnPressStart = clearButtonProps.onPressStart as
        | (() => void)
        | undefined;
      const clearButton = showClearButton.value
        ? h(ClearButton as any, {
            ...clearButtonProps,
            onPressStart: () => {
              clearButtonOnPressStart?.();
              inputRef.value?.focus();
            },
            onPress: () => {
              clearButtonOnPress?.();
              inputRef.value?.focus();
            },
            preventFocus: true,
            UNSAFE_className: classNames("spectrum-ClearButton"),
          } as Record<string, unknown>)
        : undefined;

      return h(TextFieldBase as any, {
        ...(attrsRecord as Record<string, unknown>),
        ...slottedProps.value,
        isDisabled: isDisabled.value,
        isInvalid: searchField.isInvalid.value,
        validationState: resolvedValidationState.value,
        labelProps: searchField.labelProps.value,
        descriptionProps: searchField.descriptionProps.value,
        errorMessageProps: searchField.errorMessageProps.value,
        inputProps: inputProps.value,
        inputRef,
        inputClassName: classNames("spectrum-Search-input"),
        icon: resolvedIcon.value,
        wrapperChildren: clearButton,
        UNSAFE_className: classNames(
          "spectrum-Search",
          "spectrum-Textfield",
          {
            "is-disabled": isDisabled.value,
            "is-quiet": Boolean(propsRecord.value.isQuiet),
            "spectrum-Search--invalid":
              resolvedValidationState.value === "invalid" && !isDisabled.value,
            "spectrum-Search--valid":
              resolvedValidationState.value === "valid" && !isDisabled.value,
          },
          propsRecord.value.UNSAFE_className as ClassValue | undefined
        ),
      } as Record<string, unknown>);
    };
  },
});
