import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, ref, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { useSlider, useSliderThumb } from "../src";
import { useSliderState } from "@vue-stately/slider";

const SliderStoryHarness = defineComponent({
  name: "SliderStoryHarness",
  props: {
    label: {
      type: String,
      required: true,
    },
    values: {
      type: Array as PropType<number[]>,
      required: true,
    },
    orientation: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "horizontal",
    },
    disabledThumbs: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
  },
  setup(props) {
    const trackRef = { current: null as Element | null };
    const numberFormatter = new Intl.NumberFormat("en-US", {});
    const state = useSliderState({
      defaultValue: props.values,
      minValue: 0,
      maxValue: 100,
      orientation: props.orientation,
      numberFormatter,
    });
    const slider = useSlider(
      {
        label: props.label,
        orientation: props.orientation,
      },
      state as any,
      trackRef
    );

    const inputRefs = props.values.map(() => ref<HTMLInputElement | null>(null));
    const thumbs = inputRefs.map((inputRef, index) =>
      useSliderThumb(
        {
          index,
          "aria-label": `Thumb ${index + 1}`,
          isDisabled: props.disabledThumbs.includes(index),
          trackRef,
          inputRef,
        },
        state as any
      )
    );

    const filledRailStyle = computed(() => {
      const start = state.getThumbPercent(0) * 100;
      const end = state.getThumbPercent(state.values.length - 1) * 100;

      if (props.orientation === "vertical") {
        return {
          top: `${100 - end}%`,
          height: `${end - start}%`,
        };
      }

      return {
        left: `${start}%`,
        width: `${end - start}%`,
      };
    });

    return () =>
      h(
        "div",
        {
          ...slider.groupProps,
          class: ["slider", props.orientation === "vertical" ? "vertical" : "horizontal"],
        },
        [
        h("label", slider.labelProps as any, props.label),
        h(
          "div",
          {
            ...slider.trackProps,
            class: "track",
            ref: ((el: Element | null) => {
              trackRef.current = el;
            }) as any,
          },
          [
            h("div", { class: "rail" }),
            h("div", {
              class: "filledRail",
              style: filledRailStyle.value,
            }),
            ...thumbs.map((thumb, index) =>
              h(
                "div",
                {
                  ...thumb.thumbProps,
                  class: "thumbHandle",
                  "data-test-thumb": index,
                },
                [
                  h("input", {
                    ...thumb.inputProps,
                    ref: ((el: any) => {
                      inputRefs[index].value = el as HTMLInputElement | null;
                    }) as any,
                  }),
                ]
              )
            ),
          ]
        ),
        h("output", slider.outputProps as any, state.values.join(",")),
        ]
      );
  },
});

describe("slider story wrapper harness", () => {
  it("mirrors range-story structural output and filled rail geometry", () => {
    const wrapper = mount(SliderStoryHarness, {
      props: {
        label: "Range",
        values: [20, 80],
      },
    });

    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBeUndefined();

    const inputs = wrapper.findAll('input[type="range"]');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes("aria-label")).toBe("Thumb 1");
    expect(inputs[0].attributes("min")).toBe("0");
    expect(inputs[0].attributes("max")).toBe("80");
    expect(inputs[1].attributes("min")).toBe("20");
    expect(inputs[1].attributes("max")).toBe("100");

    const fill = wrapper.find(".filledRail");
    expect(fill.attributes("style")).toContain("left: 20%");
    expect(fill.attributes("style")).toContain("width: 60%");

    wrapper.unmount();
  });

  it("mirrors multi-thumb story with per-thumb disabled combinations", () => {
    const wrapper = mount(SliderStoryHarness, {
      props: {
        label: "Multi",
        values: [10, 35, 70, 90],
        disabledThumbs: [1, 3],
      },
    });

    const inputs = wrapper.findAll('input[type="range"]');
    expect(inputs).toHaveLength(4);
    expect(inputs[0].attributes("disabled")).toBeUndefined();
    expect(inputs[1].attributes("disabled")).toBeDefined();
    expect(inputs[2].attributes("disabled")).toBeUndefined();
    expect(inputs[3].attributes("disabled")).toBeDefined();

    wrapper.unmount();
  });

  it("mirrors vertical-story orientation output", () => {
    const wrapper = mount(SliderStoryHarness, {
      props: {
        label: "Vertical",
        values: [20, 80],
        orientation: "vertical",
      },
    });

    expect(wrapper.classes()).toContain("vertical");

    const inputs = wrapper.findAll('input[type="range"]');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].attributes("aria-orientation")).toBe("vertical");
    expect(inputs[1].attributes("aria-orientation")).toBe("vertical");

    const fill = wrapper.find(".filledRail");
    expect(fill.attributes("style")).toContain("top: 20%");
    expect(fill.attributes("style")).toContain("height: 60%");

    wrapper.unmount();
  });
});
