import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watchEffect,
  type PropType,
} from "vue";
import { useCheckbox, useCheckboxGroupItem } from "@vue-aria/checkbox";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useToggleState } from "@vue-aria/toggle-state";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useFormProps } from "@vue-spectrum/form";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { useCheckboxGroupContext } from "./context";

export type SpectrumCheckboxValidationBehavior = "aria" | "native";

export interface SpectrumCheckboxProps {
  value?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  isSelected?: boolean | undefined;
  defaultSelected?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  validationBehavior?: SpectrumCheckboxValidationBehavior | undefined;
  isIndeterminate?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  autoFocus?: boolean | undefined;
  excludeFromTabOrder?: boolean | undefined;
  onChange?: ((isSelected: boolean) => void) | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  ariaErrormessage?: string | undefined;
  ariaControls?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

function warnUnsupportedInGroup(props: SpectrumCheckboxProps): void {
  if (isProduction) {
    return;
  }

  for (const propName of ["isSelected", "defaultSelected", "isEmphasized"]) {
    if (props[propName as keyof SpectrumCheckboxProps] !== undefined) {
      console.warn(
        `${propName} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. Please apply this prop to the group instead.`
      );
    }
  }

  if (props.value === undefined) {
    console.warn(
      "A <Checkbox> element within a <CheckboxGroup> requires a `value` property."
    );
  }
}

export const Checkbox = defineComponent({
  name: "Checkbox",
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    validationBehavior: {
      type: String as PropType<SpectrumCheckboxValidationBehavior | undefined>,
      default: undefined,
    },
    isIndeterminate: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    excludeFromTabOrder: {
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
    ariaErrormessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaControls: {
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
    const provider = useProviderContext();
    const groupContext = useCheckboxGroupContext();
    const groupState = groupContext?.state ?? null;
    const elementRef = ref<HTMLLabelElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const attrsRecord = attrs as Record<string, unknown>;
    const resolvedFormProps = computed<Record<string, unknown>>(() =>
      useFormProps({
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isRequired: props.isRequired,
        validationState: props.validationState,
        validationBehavior: props.validationBehavior,
      })
    );
    const isEmphasized = computed(
      () =>
        props.isEmphasized ??
        groupContext?.isEmphasized.value ??
        provider?.value.isEmphasized ??
        false
    );
    const isDisabled = computed(() => {
      if (props.isDisabled !== undefined) {
        return props.isDisabled;
      }

      const fromForm = resolvedFormProps.value.isDisabled;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isDisabled ?? false;
    });
    const isReadOnly = computed(() => {
      if (props.isReadOnly !== undefined) {
        return props.isReadOnly;
      }

      const fromForm = resolvedFormProps.value.isReadOnly;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isReadOnly ?? false;
    });
    const isRequired = computed(() => {
      if (props.isRequired !== undefined) {
        return props.isRequired;
      }

      const fromForm = resolvedFormProps.value.isRequired;
      if (typeof fromForm === "boolean") {
        return fromForm;
      }

      return provider?.value.isRequired ?? false;
    });
    const validationState = computed<"valid" | "invalid" | undefined>(() => {
      if (props.validationState !== undefined) {
        return props.validationState;
      }

      const fromForm = resolvedFormProps.value.validationState;
      if (fromForm === "valid" || fromForm === "invalid") {
        return fromForm;
      }

      const fromProvider = provider?.value.validationState;
      return fromProvider === "valid" || fromProvider === "invalid"
        ? fromProvider
        : undefined;
    });
    const validationBehavior = computed<SpectrumCheckboxValidationBehavior | undefined>(
      () => {
        if (props.validationBehavior !== undefined) {
          return props.validationBehavior;
        }

        const fromForm = resolvedFormProps.value.validationBehavior;
        return fromForm === "native" ? "native" : "aria";
      }
    );
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

    if (groupState) {
      warnUnsupportedInGroup(props);
    }

    const checkbox = groupState
      ? useCheckboxGroupItem(
          {
            value: computed(() => props.value ?? ""),
            isDisabled,
            isReadOnly,
            isRequired:
              props.isRequired !== undefined
                ? computed(() => props.isRequired)
                : undefined,
            isInvalid:
              props.isInvalid !== undefined
                ? computed(() => props.isInvalid)
                : undefined,
            validationState:
              props.validationState !== undefined
                ? computed(() => props.validationState)
                : undefined,
            validationBehavior,
            isIndeterminate: computed(() => Boolean(props.isIndeterminate)),
            onPressStart: props.onPressStart,
            onPressEnd: props.onPressEnd,
            onPress: props.onPress,
            onChange: props.onChange,
            "aria-label": resolvedAriaLabel,
            "aria-labelledby": resolvedAriaLabelledby,
            "aria-describedby": resolvedAriaDescribedby,
            "aria-errormessage": computed(() => props.ariaErrormessage),
            "aria-controls": computed(() => props.ariaControls),
          },
          groupState,
          inputRef
        )
      : useCheckbox(
          {
            value: computed(() => props.value),
            name: computed(() => props.name),
            form: computed(() => props.form),
            isDisabled,
            isReadOnly,
            isRequired,
            isInvalid:
              props.isInvalid !== undefined
                ? computed(() => props.isInvalid)
                : undefined,
            validationState,
            validationBehavior,
            isIndeterminate: computed(() => Boolean(props.isIndeterminate)),
            onPressStart: props.onPressStart,
            onPressEnd: props.onPressEnd,
            onPress: props.onPress,
            onChange: props.onChange,
            "aria-label": resolvedAriaLabel,
            "aria-labelledby": resolvedAriaLabelledby,
            "aria-describedby": resolvedAriaDescribedby,
            "aria-errormessage": computed(() => props.ariaErrormessage),
            "aria-controls": computed(() => props.ariaControls),
          },
          useToggleState({
            isSelected:
              props.isSelected !== undefined
                ? computed(() => props.isSelected)
                : undefined,
            defaultSelected: props.defaultSelected,
            isReadOnly,
            onChange: props.onChange,
          }),
          inputRef
        );

    const { hoverProps, isHovered } = useHover({
      isDisabled: checkbox.isDisabled,
    });
    const { focusProps, isFocusVisible } = useFocusRing();

    watchEffect(() => {
      if (!inputRef.value) {
        return;
      }

      inputRef.value.indeterminate = Boolean(props.isIndeterminate);
    });

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
      const inputInteractionProps = checkbox.inputProps.value;
      const resolvedTabIndex = props.excludeFromTabOrder
        ? -1
        : ((inputInteractionProps.tabIndex ??
            inputInteractionProps.tabindex) as number | string | undefined);
      const icon = props.isIndeterminate
        ? h(
            "span",
            {
              "aria-hidden": "true",
              class: "spectrum-Checkbox-partialCheckmark",
            },
            "-"
          )
        : h(
            "span",
            {
              "aria-hidden": "true",
              class: "spectrum-Checkbox-checkmark",
            },
            "✓"
          );

      return h(
        "label",
        mergeProps(domProps, checkbox.labelProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLLabelElement | null;
          },
          class: classNames(
            "spectrum-Checkbox",
            {
              "is-checked": Boolean(inputInteractionProps.checked),
              "is-indeterminate": Boolean(props.isIndeterminate),
              "spectrum-Checkbox--quiet": !isEmphasized.value,
              "is-invalid": checkbox.isInvalid.value,
              "is-disabled": checkbox.isDisabled.value,
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
            mergeProps(inputInteractionProps, focusProps, {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | null;
              },
              class: classNames("spectrum-Checkbox-input"),
              tabIndex: resolvedTabIndex,
              tabindex: resolvedTabIndex,
            })
          ),
          h(
            "span",
            {
              class: classNames("spectrum-Checkbox-box"),
            },
            [icon]
          ),
          slots.default
            ? h(
                "span",
                {
                  class: classNames("spectrum-Checkbox-label"),
                },
                slots.default()
              )
            : null,
        ]
      );
    };
  },
});
