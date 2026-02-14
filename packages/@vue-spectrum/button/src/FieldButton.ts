import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { SlotProvider, useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, onMounted, ref } from "vue";
import type { SpectrumFieldButtonProps } from "./types";
import { createRefObject } from "./utils";

// @private
export const FieldButton = defineComponent({
  name: "SpectrumFieldButton",
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
    validationState: {
      type: String as () => SpectrumFieldButtonProps["validationState"],
      required: false,
    },
    isInvalid: {
      type: Boolean,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
    },
    autoFocus: {
      type: Boolean,
      required: false,
    },
    focusRingClass: {
      type: String,
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
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = createRefObject(domRef);
    const merged = useSlotProps(
      {
        ...attrs,
        ...props,
      } as Record<string, unknown>,
      "button"
    ) as SpectrumFieldButtonProps & Record<string, unknown>;
    const { buttonProps, isPressed } = useButton(merged, domRefObject);
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });
    const { styleProps } = useStyleProps(merged);

    expose({
      focus: () => domRef.value?.focus(),
      UNSAFE_getDOMNode: () => domRef.value,
    });
    onMounted(() => {
      if (merged.autoFocus) {
        domRef.value?.focus();
      }
    });

    return () =>
      h(
        FocusRing,
        {
          focusRingClass: ["focus-ring", merged.focusRingClass].filter(Boolean).join(" "),
          autoFocus: Boolean(merged.autoFocus),
        },
        {
          default: () =>
            h(
              "button",
              {
                ...styleProps.value,
                ...mergeProps(buttonProps, hoverProps),
                ref: domRef,
                class: [
                  "spectrum-FieldButton",
                  {
                    "spectrum-FieldButton--quiet": Boolean(merged.isQuiet),
                    "is-active": Boolean(merged.isActive) || isPressed,
                    "is-disabled": Boolean(merged.isDisabled),
                    "spectrum-FieldButton--invalid":
                      Boolean(merged.isInvalid) || merged.validationState === "invalid",
                    "is-hovered": isHovered,
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
                    },
                  },
                  {
                    default: () => slots.default?.(),
                  }
                ),
              ]
            ),
        }
      );
  },
});
