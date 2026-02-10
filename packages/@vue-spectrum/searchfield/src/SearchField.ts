import { computed, defineComponent, h, ref } from "vue";
import { useSearchField } from "@vue-aria/searchfield";
import { ClearButton } from "@vue-spectrum/button";
import { useFormProps } from "@vue-spectrum/form";
import { useProviderContext } from "@vue-spectrum/provider";
import {
  TextFieldBase,
  type SpectrumTextFieldValidationBehavior,
  type SpectrumTextFieldValidationState,
} from "@vue-spectrum/textfield";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import {
  searchFieldPropOptions,
  type SpectrumSearchFieldProps,
} from "./types";

export const SearchField = defineComponent({
  name: "SearchField",
  inheritAttrs: false,
  props: {
    ...searchFieldPropOptions,
  },
  setup(props, { attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const propsRecord = props as unknown as Record<string, unknown>;
    const provider = useProviderContext();
    const inputRef = ref<HTMLInputElement | null>(null);

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
    const validationBehavior = computed<SpectrumTextFieldValidationBehavior>(
      () =>
        props.validationBehavior ??
        (resolvedFormProps.value.validationBehavior as
          | SpectrumTextFieldValidationBehavior
          | undefined) ??
        "aria"
    );

    const searchField = useSearchField({
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
      name: computed(() => props.name),
      form: computed(() => props.form),
      placeholder: computed(() => props.placeholder),
      autoFocus: computed(() => props.autoFocus),
      autoComplete: computed(() => props.autoComplete),
      autoCapitalize: computed(() => props.autoCapitalize),
      inputMode: computed(() => props.inputMode),
      autoCorrect: computed(() => props.autoCorrect),
      spellCheck: computed(() => props.spellCheck),
      enterKeyHint: computed(() => props.enterKeyHint),
      maxLength: computed(() => props.maxLength),
      minLength: computed(() => props.minLength),
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-errormessage": ariaErrorMessage,
      onInput: props.onInput,
      onChange: props.onChange,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      onKeydown: (propsRecord.onKeydown ?? attrsRecord.onKeydown) as
        | ((event: KeyboardEvent) => void)
        | undefined,
      onSubmit: props.onSubmit,
      onClear: props.onClear,
      inputRef,
    });

    const resolvedValidationState = computed<SpectrumTextFieldValidationState | undefined>(
      () => validationState.value ?? (searchField.isInvalid.value ? "invalid" : undefined)
    );

    const resolvedIcon = computed(() => {
      if (props.icon === "" || props.icon === null) {
        return undefined;
      }

      if (props.icon !== undefined) {
        return props.icon;
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

      if (props.excludeFromTabOrder) {
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
        ...props,
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
            "is-quiet": Boolean(props.isQuiet),
            "spectrum-Search--invalid":
              resolvedValidationState.value === "invalid" && !isDisabled.value,
            "spectrum-Search--valid":
              resolvedValidationState.value === "valid" && !isDisabled.value,
          },
          props.UNSAFE_className as ClassValue | undefined
        ),
      } as Record<string, unknown>);
    };
  },
});
