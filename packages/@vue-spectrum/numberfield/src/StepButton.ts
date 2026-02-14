import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { defineComponent, h, ref, type PropType } from "vue";
import type { SpectrumStepButtonProps } from "./types";

function createRefObject(domRef: { value: HTMLElement | null }): { current: Element | null } {
  return {
    get current() {
      return domRef.value;
    },
    set current(value: Element | null) {
      domRef.value = value as HTMLElement | null;
    },
  };
}

/**
 * Stepper button used by NumberField.
 */
export const StepButton = defineComponent({
  name: "SpectrumStepButton",
  inheritAttrs: false,
  props: {
    direction: {
      type: String as () => SpectrumStepButtonProps["direction"],
      required: true,
    },
    isQuiet: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: unknown) => void) | undefined>,
      required: false,
    },
    onPressStart: {
      type: Function as PropType<((event: unknown) => void) | undefined>,
      required: false,
    },
    onPressEnd: {
      type: Function as PropType<((event: unknown) => void) | undefined>,
      required: false,
    },
    onPressUp: {
      type: Function as PropType<((event: unknown) => void) | undefined>,
      required: false,
    },
    onPressChange: {
      type: Function as PropType<((pressed: boolean) => void) | undefined>,
      required: false,
    },
  },
  setup(props, { attrs }) {
    const domRef = ref<HTMLElement | null>(null);
    const refObject = createRefObject(domRef);
    const merged = {
      ...props,
      ...attrs,
      elementType: "div",
    } as SpectrumStepButtonProps & Record<string, unknown>;
    const { buttonProps, isPressed } = useButton(merged, refObject);
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });

    return () =>
      h(
        FocusRing as any,
        {
          focusRingClass: "focus-ring",
        },
        {
          default: () =>
            h(
              "div",
              {
                ...mergeProps(hoverProps, buttonProps),
                ref: domRef,
                class: [
                  "spectrum-Stepper-button",
                  {
                    "spectrum-Stepper-button--stepUp": merged.direction === "up",
                    "spectrum-Stepper-button--stepDown": merged.direction === "down",
                    "spectrum-Stepper-button--isQuiet": Boolean(merged.isQuiet),
                    "is-hovered": isHovered,
                    "is-active": isPressed,
                    "is-disabled": Boolean(merged.isDisabled),
                  },
                ],
              },
              [
                h(
                  "span",
                  {
                    class: [
                      "spectrum-Stepper-button-icon",
                      merged.direction === "up" ? "spectrum-Stepper-stepUpIcon" : "spectrum-Stepper-stepDownIcon",
                    ],
                    "aria-hidden": "true",
                  },
                  merged.direction === "up" ? "▲" : "▼"
                ),
              ]
            ),
        }
      );
  },
});
