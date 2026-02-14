import { useButton } from "@vue-aria/button";
import { FocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useStyleProps } from "@vue-spectrum/utils";
import { defineComponent, h, onMounted, ref } from "vue";
import type { SpectrumClearButtonProps } from "./types";
import { createRefObject } from "./utils";

export const ClearButton = defineComponent({
  name: "SpectrumClearButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as () => SpectrumClearButtonProps["elementType"],
      required: false,
    },
    focusClassName: {
      type: String,
      required: false,
    },
    variant: {
      type: String as () => SpectrumClearButtonProps["variant"],
      required: false,
    },
    autoFocus: {
      type: Boolean,
      required: false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
    },
    preventFocus: {
      type: Boolean,
      required: false,
    },
    inset: {
      type: Boolean,
      required: false,
      default: false,
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
    const elementType = (props.preventFocus ? "div" : props.elementType ?? "button") as
      | "button"
      | "a"
      | "div"
      | "input"
      | "span";
    const merged = {
      ...attrs,
      ...props,
      elementType,
    } as SpectrumClearButtonProps & Record<string, unknown>;
    if (elementType !== "button") {
      merged.type = undefined;
    }
    const { buttonProps, isPressed } = useButton(merged, domRefObject);
    const { hoverProps, isHovered } = useHover({
      isDisabled: Boolean(merged.isDisabled),
    });
    const { styleProps } = useStyleProps(merged);

    if (props.preventFocus) {
      delete buttonProps.tabIndex;
    }

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
          focusRingClass: ["focus-ring", merged.focusClassName].filter(Boolean).join(" "),
          autoFocus: Boolean(merged.autoFocus),
        },
        {
          default: () =>
            h(
              elementType,
              {
                ...styleProps.value,
                ...mergeProps(buttonProps, hoverProps),
                ref: domRef,
                class: [
                  "spectrum-ClearButton",
                  {
                    [`spectrum-ClearButton--${merged.variant}`]: Boolean(merged.variant),
                    "is-disabled": Boolean(merged.isDisabled),
                    "is-active": isPressed,
                    "is-hovered": isHovered,
                    "spectrum-ClearButton--inset": Boolean(merged.inset),
                  },
                  styleProps.value.class,
                ],
              },
              slots.default?.() ?? [h("span", { class: "spectrum-Icon", "aria-hidden": "true" }, "x")]
            ),
        }
      );
  },
});
