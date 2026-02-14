import { FocusScope, useFocusRing } from "@vue-aria/focus";
import { useUNSAFE_PortalContext } from "@vue-aria/overlays";
import { useToastRegion } from "@vue-aria/toast";
import { mergeProps } from "@vue-aria/utils";
import { Teleport, computed, defineComponent, h, ref } from "vue";
import type { SpectrumToastContainerProps, SpectrumToastValue, ToastPlacement } from "./types";
import type { ToastState } from "@vue-aria/toast-state";

interface ToastContainerProps extends SpectrumToastContainerProps {
  state: ToastState<SpectrumToastValue>;
  placement?: ToastPlacement;
}

/**
 * Portal-backed region wrapper for the visible toast stack.
 */
export const Toaster = defineComponent({
  name: "SpectrumToaster",
  inheritAttrs: false,
  props: {
    state: {
      type: Object as () => ToastState<SpectrumToastValue>,
      required: true,
    },
    placement: {
      type: String as () => ToastPlacement | undefined,
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    ariaLabelledby: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots }) {
    const refEl = ref<HTMLElement | null>(null);
    const refObj = {
      get current() {
        return refEl.value;
      },
      set current(value: HTMLElement | null) {
        refEl.value = value;
      },
    };
    const { regionProps } = useToastRegion(
      {
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
      },
      props.state,
      refObj
    );
    const { focusProps, isFocusVisible } = useFocusRing();
    const { getContainer } = useUNSAFE_PortalContext();
    const container = computed(() => getContainer?.() ?? (typeof document !== "undefined" ? document.body : null));

    const [position, placement] = ((props.placement ?? "bottom").split(" ") as [string, string?]);
    const finalPlacement = placement ?? "center";

    return () => {
      if (!container.value) {
        return null;
      }

      return h(
        Teleport,
        { to: container.value },
        h(
          FocusScope as any,
          null,
          {
            default: () =>
              h(
                "div",
                {
                  ...mergeProps(regionProps, focusProps),
                  ref: refEl,
                  "data-position": position,
                  "data-placement": finalPlacement,
                  class: [
                    "react-spectrum-ToastContainer",
                    { "focus-ring": isFocusVisible },
                  ],
                },
                slots.default?.() ?? []
              ),
          }
        )
      );
    };
  },
});
