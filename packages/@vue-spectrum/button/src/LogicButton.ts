import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, onMounted, ref } from "vue";
import type { SpectrumLogicButtonProps } from "./types";
import { createRefObject } from "./utils";

/**
 * A LogicButton displays an operator within a boolean logic sequence.
 */
export const LogicButton = defineComponent({
  name: "SpectrumLogicButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as () => SpectrumLogicButtonProps["elementType"],
      required: false,
    },
    variant: {
      type: String as () => SpectrumLogicButtonProps["variant"],
      required: false,
    },
    isDisabled: {
      type: Boolean,
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
  setup(props, { slots, attrs, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = createRefObject(domRef);

    const merged = useProviderProps({
      ...attrs,
      ...props,
    } as Record<string, unknown>) as SpectrumLogicButtonProps & Record<string, unknown>;
    if (merged.elementType && merged.elementType !== "button") {
      merged.type = undefined;
    }
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
                ref: domRef,
                class: [
                  "spectrum-LogicButton",
                  merged.variant ? `spectrum-LogicButton--${merged.variant}` : null,
                  {
                    "is-disabled": Boolean(merged.isDisabled),
                    "is-active": isPressed,
                    "is-hovered": isHovered,
                  },
                  styleProps.value.class,
                ],
              },
              [h("span", { class: "spectrum-Button-label" }, slots.default?.())]
            ),
        }
      );
  },
});
