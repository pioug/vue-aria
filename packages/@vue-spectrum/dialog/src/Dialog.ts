import { useDialog } from "@vue-aria/dialog";
import { mergeProps } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import { useSlotProps, useStyleProps } from "@vue-spectrum/utils";
import { computed, defineComponent, h, inject, ref, type PropType } from "vue";
import { DialogContext } from "./context";
import type { SpectrumDialogProps } from "./types";

const sizeMap: Record<string, string> = {
  S: "small",
  M: "medium",
  L: "large",
  fullscreen: "fullscreen",
  fullscreenTakeover: "fullscreenTakeover",
};

/**
 * Dialog displays contextual information or workflows in an overlay surface.
 */
export const Dialog = defineComponent({
  name: "SpectrumDialog",
  inheritAttrs: false,
  props: {
    type: {
      type: String as () => SpectrumDialogProps["type"],
      required: false,
      default: undefined,
    },
    size: {
      type: String as () => SpectrumDialogProps["size"],
      required: false,
      default: undefined,
    },
    isDismissable: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onDismiss: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    role: {
      type: String as () => "dialog" | "alertdialog" | undefined,
      required: false,
      default: undefined,
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
  setup(props, { attrs, slots, expose }) {
    const contextRef = inject(DialogContext, ref(null));
    const context = computed(() => contextRef?.value ?? {});
    const merged = useSlotProps(
      {
        ...props,
        ...attrs,
      } as Record<string, unknown>,
      "dialog"
    ) as SpectrumDialogProps & Record<string, unknown>;

    const isDismissable = computed(() => merged.isDismissable ?? context.value?.isDismissable ?? false);
    const onDismiss = computed(() => merged.onDismiss ?? context.value?.onClose);
    const type = computed(() => merged.type ?? context.value?.type ?? "modal");
    const size = computed(() => (type.value === "popover" ? merged.size ?? "S" : merged.size ?? "L"));
    const sizeVariant = computed(() => sizeMap[type.value ?? ""] ?? sizeMap[size.value ?? ""]);

    const domRef = ref<HTMLElement | null>(null);
    const { dialogProps } = useDialog(
      mergeProps(context.value ?? {}, merged),
      {
        get current() {
          return domRef.value;
        },
        set current(value: HTMLElement | null) {
          domRef.value = value;
        },
      }
    );
    const { styleProps } = useStyleProps(merged);

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () =>
      h(
        "section",
        {
          ...styleProps.value,
          ...dialogProps,
          ref: domRef,
          class: [
            "spectrum-Dialog",
            {
              [`spectrum-Dialog--${sizeVariant.value}`]: Boolean(sizeVariant.value),
              "spectrum-Dialog--dismissable": isDismissable.value,
            },
            merged.UNSAFE_className,
            styleProps.value.class,
          ],
        },
        [
          h(
            "div",
            {
              class: "spectrum-Dialog-grid",
            },
            [
              slots.default?.(),
              isDismissable.value
                ? h(
                    ActionButton as any,
                    {
                      UNSAFE_className: "spectrum-Dialog-closeButton",
                      isQuiet: true,
                      "aria-label": "Dismiss",
                      onPress: onDismiss.value,
                      "data-testid": "dialog-close-button",
                    },
                    {
                      default: () => "×",
                    }
                  )
                : null,
            ]
          ),
        ]
      );
  },
});
