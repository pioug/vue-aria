import { useHover } from "@vue-aria/interactions";
import { useSliderThumb } from "@vue-aria/slider";
import type { SliderState } from "@vue-aria/slider-state";
import { mergeProps } from "@vue-aria/utils";
import { VisuallyHidden } from "@vue-aria/visually-hidden";
import {
  defineComponent,
  h,
  inject,
  ref,
  useAttrs,
  type PropType,
  type Ref,
} from "vue";
import { sliderContextKey } from "./sliderContext";

export const SliderThumb = defineComponent({
  name: "SpectrumSliderThumb",
  props: {
    index: {
      type: Number,
      default: 0,
    },
    state: Object as PropType<SliderState>,
    trackRef: Object as PropType<{ current: Element | null }>,
    inputRef: Object as PropType<Ref<HTMLInputElement | null>>,
    isDisabled: Boolean,
    name: String,
    form: String,
    label: String,
  },
  setup(props) {
    const attrs = useAttrs();
    const context = inject(sliderContextKey, null);
    const localInputRef = ref<HTMLInputElement | null>(null);
    const resolvedState = props.state ?? context?.state;
    const resolvedTrackRef = props.trackRef ?? context?.trackRef;
    const resolvedInputRef = props.inputRef ?? localInputRef;

    if (!resolvedState || !resolvedTrackRef) {
      throw new Error("SliderThumb must be used within SliderBase or receive state/trackRef props.");
    }

    const thumb = useSliderThumb(
      {
        index: props.index,
        label: props.label,
        isDisabled: props.isDisabled,
        name: props.name,
        form: props.form,
        trackRef: resolvedTrackRef,
        inputRef: resolvedInputRef,
        "aria-label": attrs["aria-label"] as string | undefined,
        "aria-labelledby": attrs["aria-labelledby"] as string | undefined,
        "aria-describedby": attrs["aria-describedby"] as string | undefined,
        "aria-details": attrs["aria-details"] as string | undefined,
      },
      resolvedState as any
    );

    const { hoverProps, isHovered } = useHover({});
    const mergedThumbProps = mergeProps(thumb.thumbProps, hoverProps);

    return () => {
      const liveInputProps = {
        ...thumb.inputProps,
        min: resolvedState.getThumbMinValue(props.index),
        max: resolvedState.getThumbMaxValue(props.index),
        value: resolvedState.values[props.index],
        "aria-valuetext": resolvedState.getThumbValueLabel(props.index),
      };

      return (
      h(
        "div",
        {
          ...mergedThumbProps,
          class: [
            "spectrum-Slider-handle",
            isHovered ? "is-hovered" : null,
            thumb.isDragging ? "is-dragged" : null,
            thumb.isFocused ? "is-tophandle" : null,
            thumb.isFocused ? "is-focused" : null,
          ],
          role: "presentation",
        },
        [
          h(VisuallyHidden, null, {
            default: () => [
              h("input", {
                ...liveInputProps,
                class: "spectrum-Slider-input",
                ref: ((el: any) => {
                  resolvedInputRef.value = el as HTMLInputElement | null;
                }) as any,
              }),
            ],
          }),
        ]
      ));
    };
  },
});
