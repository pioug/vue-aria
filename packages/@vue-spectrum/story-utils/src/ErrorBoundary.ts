import { defineComponent, h, onErrorCaptured, ref } from "vue";

export const ErrorBoundary = defineComponent({
  name: "StoryErrorBoundary",
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    const hasError = ref(false);

    onErrorCaptured(() => {
      hasError.value = true;
      // Prevent bubbling so stories/tests can keep rendering the fallback.
      return false;
    });

    return () => {
      if (hasError.value) {
        return h("div", props.message);
      }

      return slots.default?.() ?? null;
    };
  },
});
