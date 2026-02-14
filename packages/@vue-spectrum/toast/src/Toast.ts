import { useFocusRing } from "@vue-aria/focus";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useToast } from "@vue-aria/toast";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { Button, ClearButton } from "@vue-spectrum/button";
import { useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, ref } from "vue";
import { intlMessages } from "./intlMessages";
import type { SpectrumToastProps } from "./types";

/**
 * Individual toast surface rendered inside a toast container region.
 */
export const Toast = defineComponent({
  name: "SpectrumToast",
  inheritAttrs: false,
  props: {
    toast: {
      type: Object as () => SpectrumToastProps["toast"],
      required: true,
    },
    state: {
      type: Object as () => SpectrumToastProps["state"],
      required: true,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
    },
  },
  setup(props, { attrs, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const domRefObject = {
      get current() {
        return domRef.value;
      },
      set current(value: Element | null) {
        domRef.value = value as HTMLElement | null;
      },
    };

    const { closeButtonProps, titleProps, toastProps, contentProps } = useToast(
      {
        toast: props.toast,
      },
      props.state,
      domRefObject
    );
    const { styleProps } = useStyleProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>);
    const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@vue-spectrum/toast");
    const { isFocusVisible, focusProps } = useFocusRing();

    const variant = computed(() => props.toast.content.variant);
    const iconLabel = computed(() => {
      if (!variant.value || variant.value === "neutral") {
        return null;
      }
      return stringFormatter.format(variant.value);
    });

    const handleAction = () => {
      props.toast.content.onAction?.();
      if (props.toast.content.shouldCloseOnAction) {
        props.state.close(String(props.toast.key));
      }
    };

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ...mergeProps(toastProps, focusProps),
          ...filterDOMProps(props.toast.content as Record<string, unknown>),
          ref: domRef,
          class: [
            "spectrum-Toast",
            variant.value ? `spectrum-Toast--${variant.value}` : null,
            { "focus-ring": isFocusVisible },
            styleProps.value.class,
          ],
        },
        [
          h(
            "div",
            {
              ...contentProps,
              class: "spectrum-Toast-contentWrapper",
            },
            [
              variant.value && variant.value !== "neutral"
                ? h(
                    "span",
                    {
                      role: "img",
                      "aria-label": iconLabel.value ?? undefined,
                      class: "spectrum-Toast-typeIcon spectrum-Icon",
                    },
                    variant.value === "positive" ? "✓" : variant.value === "negative" ? "!" : "i"
                  )
                : null,
              h("div", { class: "spectrum-Toast-body", role: "presentation" }, [
                h(
                  "div",
                  {
                    ...titleProps,
                    class: "spectrum-Toast-content",
                    role: "presentation",
                  },
                  props.toast.content.children
                ),
                props.toast.content.actionLabel
                  ? h(
                      Button as any,
                      {
                        onPress: handleAction,
                        UNSAFE_className: "spectrum-Button",
                        variant: "secondary",
                        staticColor: "white",
                        "data-testid": "rsp-Toast-secondaryButton",
                      },
                      {
                        default: () => props.toast.content.actionLabel,
                      }
                    )
                  : null,
              ]),
            ]
          ),
          h("div", { class: "spectrum-Toast-buttons" }, [
            h(
              ClearButton as any,
              {
                ...closeButtonProps,
                variant: "overBackground",
                "data-testid": "rsp-Toast-closeButton",
              },
              {
                default: () => [h("span", { class: "spectrum-Icon", "aria-hidden": "true" }, "×")],
              }
            ),
          ]),
        ]
      );
  },
});
