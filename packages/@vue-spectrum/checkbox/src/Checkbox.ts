import { useCheckbox, useCheckboxGroupItem } from "@vue-aria/checkbox";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, getCurrentInstance, h, inject, onMounted, ref, type PropType, watch } from "vue";
import { CheckboxGroupContextSymbol } from "./context";
import type { SpectrumCheckboxProps } from "./types";

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

/**
 * Checkboxes allow selecting one or more options.
 */
export const Checkbox = defineComponent({
  name: "SpectrumCheckbox",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: false,
    },
    isSelected: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    defaultSelected: {
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
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
    },
    isIndeterminate: {
      type: Boolean,
      required: false,
      default: false,
    },
    isEmphasized: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    excludeFromTabOrder: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    name: {
      type: String,
      required: false,
    },
    form: {
      type: String,
      required: false,
    },
    onChange: {
      type: Function as PropType<((isSelected: boolean) => void) | undefined>,
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
    const instance = getCurrentInstance();
    const providedProps = (instance?.vnode.props ?? {}) as Record<string, unknown>;
    const isControlled = Object.prototype.hasOwnProperty.call(providedProps, "isSelected");
    const selected = ref(isControlled ? Boolean(props.isSelected) : Boolean(props.defaultSelected));
    const inputRefObject = createInputRefObject(inputRef);
    const provided = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumCheckboxProps & Record<string, unknown>;
    const groupContext = inject(CheckboxGroupContextSymbol, null);
    const state = groupContext?.state;
    const passthroughProps = Object.fromEntries(
      Object.entries(attrs).filter(([key]) => key.startsWith("data-") || key === "id")
    );
    const getSelected = () => (isControlled ? Boolean(props.isSelected) : selected.value);
    const standaloneState = {
      get isSelected() {
        return getSelected();
      },
      get defaultSelected() {
        return Boolean(props.defaultSelected);
      },
      setSelected(value: boolean) {
        if (props.isReadOnly || props.isDisabled) {
          if (inputRef.value) {
            inputRef.value.checked = getSelected();
          }
          return;
        }

        if (!isControlled) {
          selected.value = value;
        } else if (inputRef.value) {
          inputRef.value.checked = Boolean(props.isSelected);
        }
        props.onChange?.(value);
      },
      toggle() {
        standaloneState.setSelected(!getSelected());
      },
    };

    const aria = state
      ? useCheckboxGroupItem(
          {
            ...provided,
            children: slots.default ? true : undefined,
            value: provided.value as string,
          },
          state,
          inputRefObject
        )
      : useCheckbox(
          {
            ...provided,
            children: slots.default ? true : undefined,
          },
          standaloneState,
          inputRefObject
        );
    const { styleProps } = useStyleProps(provided);
    const { hoverProps, isHovered } = useHover({ isDisabled: aria.isDisabled });
    const isSelected = computed(() =>
      state ? state.isSelected(String(provided.value ?? "")) : standaloneState.isSelected
    );
    const isEmphasized = computed(() => provided.isEmphasized ?? groupContext?.isEmphasized ?? false);

    const syncIndeterminate = () => {
      if (inputRef.value) {
        inputRef.value.indeterminate = Boolean(props.isIndeterminate);
      }
    };

    watch(() => props.isIndeterminate, syncIndeterminate, { immediate: true });
    onMounted(() => {
      syncIndeterminate();
      if (props.autoFocus) {
        inputRef.value?.focus();
      }
    });

    expose({
      focus: () => inputRef.value?.focus(),
      UNSAFE_getDOMNode: () => labelRef.value,
    });

    if (state && process.env.NODE_ENV !== "production") {
      for (const key of ["isSelected", "defaultSelected", "isEmphasized"] as const) {
        if ((props as Record<string, unknown>)[key] != null) {
          console.warn(
            `${key} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. ` +
            "Apply these props on the group instead."
          );
        }
      }
      if (props.value == null) {
        console.warn("A <Checkbox> element within a <CheckboxGroup> requires a `value` property.");
      }
    }

    return () =>
      h(
        "label",
        {
          ...passthroughProps,
          ...styleProps.value,
          ...aria.labelProps,
          ...hoverProps,
          ref: labelRef,
          class: [
            "spectrum-Checkbox",
            {
              "is-checked": isSelected.value,
              "is-indeterminate": Boolean(props.isIndeterminate),
              "spectrum-Checkbox--quiet": !isEmphasized.value,
              "is-invalid": aria.isInvalid,
              "is-disabled": aria.isDisabled,
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
              default: () => {
                const required =
                  state && aria.inputProps.required !== undefined
                    ? provided.isRequired ?? state.isRequired
                    : aria.inputProps.required;
                const ariaInvalid = (aria.inputProps["aria-invalid"] as string | undefined)
                  ?? (groupContext?.isInvalidFromGroupProps ? "true" : undefined);

                return h("input", {
                  ...aria.inputProps,
                  ref: inputRef,
                  class: "spectrum-Checkbox-input",
                  checked: isSelected.value,
                  required,
                  "aria-invalid": ariaInvalid,
                });
              },
            }
          ),
          h(
            "span",
            { class: "spectrum-Checkbox-box" },
            props.isIndeterminate
              ? [h("span", { class: "spectrum-Checkbox-partialCheckmark", "aria-hidden": "true" }, "-")]
              : [h("span", { class: "spectrum-Checkbox-checkmark", "aria-hidden": "true" }, "v")]
          ),
          slots.default
            ? h("span", { class: "spectrum-Checkbox-label" }, slots.default())
            : null,
        ]
      );
  },
});
