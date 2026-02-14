import { useSwitch } from "@vue-aria/switch";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, getCurrentInstance, h, onMounted, ref, type PropType } from "vue";
import type { SpectrumSwitchProps } from "./types";

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
 * Switches allow users to turn an individual option on or off.
 */
export const Switch = defineComponent({
  name: "SpectrumSwitch",
  inheritAttrs: false,
  props: {
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
    value: {
      type: String,
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
    validationState: {
      type: String as () => "valid" | "invalid" | undefined,
      required: false,
    },
    isInvalid: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
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
  emits: ["update:modelValue"],
  setup(props, { attrs, slots, expose, emit }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const labelRef = ref<HTMLElement | null>(null);
    const instance = getCurrentInstance();
    const providedProps = (instance?.vnode.props ?? {}) as Record<string, unknown>;
    const isControlled = Object.prototype.hasOwnProperty.call(providedProps, "isSelected");
    const selected = ref(isControlled ? Boolean(props.isSelected) : Boolean(props.defaultSelected));
    const inputRefObject = createInputRefObject(inputRef);
    const merged = useProviderProps(omitUndefined({
      ...props,
      ...attrs,
      children: slots.default ? true : undefined,
    } as Record<string, unknown>)) as SpectrumSwitchProps & Record<string, unknown>;
    const rootProps = Object.fromEntries(
      Object.entries(attrs).filter(
        ([key]) => key.startsWith("data-") || key === "id" || key === "aria-hidden"
      )
    );
    const getSelected = () => (isControlled ? Boolean(props.isSelected) : selected.value);
    const state = {
      get isSelected() {
        return getSelected();
      },
      get defaultSelected() {
        return Boolean(props.defaultSelected);
      },
      setSelected(value: boolean) {
        if (merged.isReadOnly || merged.isDisabled) {
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

        emit("update:modelValue", value);
        merged.onChange?.(value);
      },
      toggle() {
        state.setSelected(!getSelected());
      },
    };

    const aria = useSwitch(merged, state, inputRefObject);
    const { styleProps } = useStyleProps(merged);
    const { hoverProps, isHovered } = useHover({ isDisabled: aria.isDisabled });
    const isSelected = computed(() => getSelected());

    onMounted(() => {
      if (merged.autoFocus) {
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
          ...mergeProps(aria.labelProps, hoverProps),
          ...rootProps,
          ...styleProps.value,
          ref: labelRef,
          class: [
            "spectrum-ToggleSwitch",
            {
              "spectrum-ToggleSwitch--quiet": !Boolean(merged.isEmphasized),
              "is-disabled": aria.isDisabled,
              "is-hovered": isHovered,
            },
            styleProps.value.class,
          ],
        },
        [
          h(
            FocusRing,
            { focusRingClass: "focus-ring", autoFocus: merged.autoFocus },
            {
              default: () =>
                h("input", {
                  ...aria.inputProps,
                  ref: inputRef,
                  class: "spectrum-ToggleSwitch-input",
                  checked: isSelected.value,
                  tabIndex: merged.excludeFromTabOrder ? -1 : aria.inputProps.tabIndex,
                }),
            }
          ),
          h("span", { class: "spectrum-ToggleSwitch-switch", "aria-hidden": "true" }),
          slots.default
            ? h("span", { class: "spectrum-ToggleSwitch-label" }, slots.default())
            : null,
        ]
      );
  },
});
