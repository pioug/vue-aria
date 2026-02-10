import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useSwitch } from "@vue-aria/switch";
import { useToggleState } from "@vue-aria/toggle-state";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

type ValidationState = "valid" | "invalid";

export interface SpectrumSwitchProps {
  isEmphasized?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  isSelected?: boolean | undefined;
  defaultSelected?: boolean | undefined;
  value?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  autoFocus?: boolean | undefined;
  excludeFromTabOrder?: boolean | undefined;
  validationState?: ValidationState | undefined;
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

export const Switch = defineComponent({
  name: "Switch",
  inheritAttrs: false,
  props: {
    isEmphasized: {
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
    isSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultSelected: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
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
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    excludeFromTabOrder: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<ValidationState | undefined>,
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
    const provider = useProviderContext();
    const elementRef = ref<HTMLLabelElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const attrsRecord = attrs as Record<string, unknown>;
    const isDisabled = computed(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );
    const isReadOnly = computed(
      () => props.isReadOnly ?? provider?.value.isReadOnly ?? false
    );
    const isRequired = computed(
      () => props.isRequired ?? provider?.value.isRequired ?? false
    );
    const validationState = computed(
      () => props.validationState ?? provider?.value.validationState
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

    const state = useToggleState({
      isSelected:
        props.isSelected !== undefined
          ? computed(() => props.isSelected)
          : undefined,
      defaultSelected: props.defaultSelected,
      isReadOnly,
      onChange: props.onChange,
    });

    const { inputProps, labelProps } = useSwitch(
      {
        value: computed(() => props.value),
        name: computed(() => props.name),
        form: computed(() => props.form),
        isDisabled,
        isReadOnly,
        isRequired,
        validationState,
        onPressStart: props.onPressStart,
        onPressEnd: props.onPressEnd,
        onPress: props.onPress,
        "aria-label": resolvedAriaLabel,
        "aria-labelledby": resolvedAriaLabelledby,
        "aria-describedby": resolvedAriaDescribedby,
      },
      state,
      inputRef
    );
    const { hoverProps, isHovered } = useHover({
      isDisabled,
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
      const inputInteractionProps = inputProps.value;
      const resolvedTabIndex = props.excludeFromTabOrder
        ? -1
        : ((inputInteractionProps.tabIndex ??
            inputInteractionProps.tabindex) as number | string | undefined);
      const labelChildren = slots.default?.() ?? [];

      return h(
        "label",
        mergeProps(domProps, labelProps.value, hoverProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLLabelElement | null;
          },
          class: classNames(
            "spectrum-ToggleSwitch",
            {
              "spectrum-ToggleSwitch--quiet": !props.isEmphasized,
              "is-disabled": isDisabled.value,
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
              class: classNames("spectrum-ToggleSwitch-input"),
              tabIndex: resolvedTabIndex,
              tabindex: resolvedTabIndex,
            })
          ),
          h("span", {
            class: classNames("spectrum-ToggleSwitch-switch"),
          }),
          labelChildren.length > 0
            ? h(
                "span",
                {
                  class: classNames("spectrum-ToggleSwitch-label"),
                },
                labelChildren
              )
            : null,
        ]
      );
    };
  },
});
