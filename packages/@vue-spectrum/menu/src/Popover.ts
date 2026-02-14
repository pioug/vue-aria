import { computed, defineComponent, h, Teleport, type PropType } from "vue";

interface OverlayLikeState {
  readonly isOpen: boolean;
  close(): void;
}

/**
 * Minimal popover wrapper used by menu overlays.
 */
export const Popover = defineComponent({
  name: "SpectrumMenuPopover",
  inheritAttrs: false,
  props: {
    state: {
      type: Object as PropType<OverlayLikeState>,
      required: true,
    },
    triggerRef: {
      type: Object as PropType<{ current: Element | null }>,
      required: true,
    },
    scrollRef: {
      type: Object as PropType<{ current: Element | null }>,
      required: false,
      default: undefined,
    },
    placement: {
      type: String,
      required: false,
      default: "bottom start",
    },
    shouldFlip: {
      type: Boolean,
      required: false,
      default: true,
    },
    hideArrow: {
      type: Boolean,
      required: false,
      default: false,
    },
    shouldContainFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    isNonModal: {
      type: Boolean,
      required: false,
      default: false,
    },
    containerPadding: {
      type: Number,
      required: false,
      default: 12,
    },
    offset: {
      type: Number,
      required: false,
      default: 0,
    },
    crossOffset: {
      type: Number,
      required: false,
      default: 0,
    },
    shouldCloseOnInteractOutside: {
      type: Function as PropType<((target: Element) => boolean) | undefined>,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
    portalContainer: {
      type: Object as PropType<Element | null | undefined>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const container = computed(() => props.portalContainer ?? (typeof document !== "undefined" ? document.body : null));

    return () => {
      if (!props.state.isOpen || !container.value) {
        return null;
      }

      return h(
        Teleport,
        {
          to: container.value,
        },
        [
          !props.isNonModal
            ? h("div", {
                class: "spectrum-Underlay",
                onClick: () => props.state.close(),
              })
            : null,
          h(
            "div",
            {
              class: ["spectrum-Popover", "spectrum-Menu-popover", props.UNSAFE_className],
              style: {
                position: "absolute",
                zIndex: 100000,
                ...(props.UNSAFE_style ?? {}),
              },
              "data-placement": props.placement,
            },
            [
              !props.hideArrow
                ? h("div", {
                    class: "spectrum-Popover-tip",
                    "aria-hidden": "true",
                  })
                : null,
              slots.default?.(),
            ]
          ),
        ]
      );
    };
  },
});
