import {
  computed,
  defineComponent,
  h,
  ref,
  Teleport,
  type PropType,
} from "vue";
import { useToastRegion } from "@vue-aria/toast";
import { mergeProps } from "@vue-aria/utils";
import type { UseToastStateResult } from "@vue-aria/toast-state";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type { SpectrumToastValue } from "./Toast";
import type { ToastPlacement } from "./ToastContainer";

interface ToasterProps {
  state: UseToastStateResult<SpectrumToastValue>;
  placement?: ToastPlacement | undefined;
  ariaLabel?: string | undefined;
  "aria-label"?: string | undefined;
}

export const Toaster = defineComponent({
  name: "Toaster",
  inheritAttrs: false,
  props: {
    state: {
      type: Object as PropType<UseToastStateResult<SpectrumToastValue>>,
      required: true,
    },
    placement: {
      type: String as PropType<ToastPlacement | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const regionRef = ref<HTMLElement | null>(null);
    const { regionProps } = useToastRegion(
      {
        "aria-label":
          props.ariaLabel ??
          props["aria-label"] ??
          (attrs["aria-label"] as string | undefined),
      },
      props.state,
      regionRef
    );

    const position = computed(() => {
      const [pos = "bottom"] = (props.placement ?? "bottom").split(" ");
      return pos;
    });
    const placement = computed(() => {
      const [, place = "center"] = (props.placement ?? "bottom").split(" ");
      return place;
    });

    return () => {
      if (typeof document === "undefined") {
        return null;
      }

      const attrsRecord = attrs as Record<string, unknown>;
      return h(Teleport, { to: "body" }, [
        h(
          "div",
          mergeProps(regionProps.value as Record<string, unknown>, attrsRecord, {
            ref: regionRef,
            class: classNames(
              "react-spectrum-ToastContainer",
              attrsRecord.class as ClassValue | undefined
            ),
            "data-position": position.value,
            "data-placement": placement.value,
          }),
          slots.default?.()
        ),
      ]);
    };
  },
});
