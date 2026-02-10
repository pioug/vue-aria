import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type Ref,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import {
  useSliderThumb,
  type UseSliderStateResult,
} from "@vue-aria/slider";
import { mergeProps } from "@vue-aria/utils";
import { VisuallyHidden } from "@vue-aria/visually-hidden";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type { SpectrumSliderOrientation } from "./SliderBase";

export interface SpectrumSliderThumbProps {
  index: number;
  trackRef: Ref<HTMLElement | null>;
  state: UseSliderStateResult;
  inputRef?: Ref<HTMLInputElement | null> | undefined;
  orientation?: SpectrumSliderOrientation | undefined;
  direction?: "ltr" | "rtl" | undefined;
  name?: string | undefined;
  form?: string | undefined;
  isDisabled?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  ariaDetails?: string | undefined;
  ariaErrormessage?: string | undefined;
  UNSAFE_className?: string | undefined;
}

export const SliderThumb = defineComponent({
  name: "SliderThumb",
  inheritAttrs: false,
  props: {
    index: {
      type: Number,
      required: true,
    },
    trackRef: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
    state: {
      type: Object as PropType<UseSliderStateResult>,
      required: true,
    },
    inputRef: {
      type: Object as PropType<Ref<HTMLInputElement | null> | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<SpectrumSliderOrientation | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<"ltr" | "rtl" | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDescribedby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaDetails: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaErrormessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const attrsRecord = attrs as Record<string, unknown>;
    const localInputRef = ref<HTMLInputElement | null>(null);

    const inputRef = props.inputRef ?? localInputRef;

    const thumb = useSliderThumb(
      {
        index: computed(() => props.index),
        trackRef: props.trackRef,
        inputRef,
        orientation: computed(() => props.orientation),
        direction: computed(() => props.direction),
        name: computed(() => props.name),
        form: computed(() => props.form),
        isDisabled: computed(() => props.isDisabled),
        "aria-label": computed(
          () => props.ariaLabel ?? (attrsRecord["aria-label"] as string | undefined)
        ),
        "aria-labelledby": computed(
          () =>
            props.ariaLabelledby ??
            (attrsRecord["aria-labelledby"] as string | undefined)
        ),
        "aria-describedby": computed(
          () =>
            props.ariaDescribedby ??
            (attrsRecord["aria-describedby"] as string | undefined)
        ),
        "aria-details": computed(
          () => props.ariaDetails ?? (attrsRecord["aria-details"] as string | undefined)
        ),
        "aria-errormessage": computed(
          () =>
            props.ariaErrormessage ??
            (attrsRecord["aria-errormessage"] as string | undefined)
        ),
      },
      props.state
    );

    const { hoverProps, isHovered } = useHover({});
    const { focusProps, isFocusVisible } = useFocusRing();

    return () =>
      h(
        "div",
        mergeProps(thumb.thumbProps.value, hoverProps, {
          class: classNames(
            "spectrum-Slider-handle",
            {
              "is-hovered": isHovered.value,
              "is-dragged": thumb.isDragging.value,
              "is-tophandle": thumb.isFocused.value,
              "is-focused": isFocusVisible.value,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          role: "presentation",
        }),
        [
          h(VisuallyHidden, null, {
            default: () => [
              h(
                "input",
                mergeProps(thumb.inputProps.value, focusProps, {
                  ref: (value: unknown) => {
                    inputRef.value = value as HTMLInputElement | null;
                  },
                  class: classNames("spectrum-Slider-input"),
                })
              ),
            ],
          }),
        ]
      );
  },
});
