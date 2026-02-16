import { defineComponent, h } from "vue";

export interface SpectrumDropzoneProps {}

export const Dropzone = defineComponent({
  name: "SpectrumDropzone",
  setup(_, { attrs, slots }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          class: ["spectrum-Dropzone", attrs.class],
        },
        slots.default ? slots.default() : null
      );
  },
});
