import { useToggleButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { SlotProvider, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, getCurrentInstance, h, onMounted, ref, type PropType } from "vue";
import type { SpectrumToggleButtonProps } from "./types";
import { createRefObject, isTextOnlyNodes } from "./utils";

/**
 * ToggleButtons allow users to toggle a selection on or off.
 */
export const ToggleButton = defineComponent({
  name: "SpectrumToggleButton",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean,
      required: false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
    },
    isEmphasized: {
      type: Boolean,
      required: false,
    },
    staticColor: {
      type: String as () => SpectrumToggleButtonProps["staticColor"],
      required: false,
    },
    isSelected: {
      type: Boolean as () => boolean | undefined,
      required: false,
    },
    defaultSelected: {
      type: Boolean as () => boolean | undefined,
      required: false,
    },
    isReadOnly: {
      type: Boolean as () => boolean | undefined,
      required: false,
    },
    onChange: {
      type: Function as PropType<((isSelected: boolean) => void) | undefined>,
      required: false,
    },
    autoFocus: {
      type: Boolean,
      required: false,
    },
    type: {
      type: String as () => "button" | "submit" | "reset" | undefined,
      required: false,
      default: "button",
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object,
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
  },
  emits: ["update:modelValue"],
  setup(props, { attrs, slots, expose, emit }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = createRefObject(domRef);
    const instance = getCurrentInstance();
    const providedProps = (instance?.vnode.props ?? {}) as Record<string, unknown>;
    const isControlled = Object.prototype.hasOwnProperty.call(providedProps, "isSelected");
    const merged = useProviderProps({
      ...attrs,
      ...props,
    } as Record<string, unknown>) as SpectrumToggleButtonProps & Record<string, unknown>;
    const selected = ref(isControlled ? Boolean(props.isSelected) : Boolean(props.defaultSelected));
    const state = {
      get isSelected() {
        return isControlled ? Boolean(props.isSelected) : selected.value;
      },
      toggle() {
        if (merged.isReadOnly) {
          return;
        }

        const next = !(isControlled ? Boolean(props.isSelected) : selected.value);
        if (!isControlled) {
          selected.value = next;
        }
        emit("update:modelValue", next);
        merged.onChange?.(next);
      },
    };
    const { buttonProps, isPressed } = useToggleButton(merged, state, domRefObject);
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });
    const { styleProps } = useStyleProps(merged);
    const isSelected = computed(() => (isControlled ? Boolean(props.isSelected) : selected.value));

    onMounted(() => {
      if (merged.autoFocus) {
        domRef.value?.focus();
      }
    });

    expose({
      focus: () => domRef.value?.focus(),
      UNSAFE_getDOMNode: () => domRef.value,
    });

    return () => {
      const content = slots.default?.() ?? [];
      const isTextOnly = isTextOnlyNodes(content);

      return h(
        FocusRing,
        {
          focusRingClass: "focus-ring",
          autoFocus: Boolean(merged.autoFocus),
        },
        {
          default: () =>
            h(
              "button",
              {
                ...styleProps.value,
                ...mergeProps(buttonProps, hoverProps),
                "aria-pressed": isSelected.value,
                ref: domRef,
                class: [
                  "spectrum-ActionButton",
                  {
                    "spectrum-ActionButton--quiet": Boolean(merged.isQuiet),
                    "spectrum-ActionButton--emphasized": Boolean(merged.isEmphasized),
                    "spectrum-ActionButton--staticColor": Boolean(merged.staticColor),
                    "spectrum-ActionButton--staticWhite": merged.staticColor === "white",
                    "spectrum-ActionButton--staticBlack": merged.staticColor === "black",
                    "is-active": isPressed,
                    "is-disabled": Boolean(merged.isDisabled),
                    "is-hovered": isHovered,
                    "is-selected": isSelected.value,
                  },
                  styleProps.value.class,
                ],
              },
              [
                h(
                  SlotProvider,
                  {
                    slots: {
                      icon: {
                        size: "S",
                        UNSAFE_className: "spectrum-Icon",
                      },
                      text: {
                        UNSAFE_className: "spectrum-ActionButton-label",
                      },
                    },
                  },
                  {
                    default: () =>
                      isTextOnly
                        ? h("span", { class: "spectrum-ActionButton-label" }, content)
                        : content,
                  }
                ),
              ]
            ),
        }
      );
    };
  },
});
