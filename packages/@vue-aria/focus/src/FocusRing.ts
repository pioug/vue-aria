import { mergeProps } from "@vue-aria/utils";
import { cloneVNode, defineComponent } from "vue";
import { useFocusRing } from "./useFocusRing";

export interface FocusRingProps {
  focusClass?: string;
  focusRingClass?: string;
  within?: boolean;
  isTextInput?: boolean;
  autoFocus?: boolean;
}

export const FocusRing = defineComponent({
  name: "FocusRing",
  props: {
    focusClass: String,
    focusRingClass: String,
    within: Boolean,
    isTextInput: Boolean,
    autoFocus: Boolean,
  },
  setup(props, { slots }) {
    const { isFocused, isFocusVisible, focusProps } = useFocusRing(props);

    return () => {
      const child = slots.default?.()[0];
      if (!child) {
        return null;
      }

      const classes = [
        (child.props?.class as string | undefined) ?? "",
        isFocused ? props.focusClass ?? "" : "",
        isFocusVisible ? props.focusRingClass ?? "" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return cloneVNode(
        child,
        mergeProps(child.props ?? {}, {
          ...focusProps,
          class: classes || undefined,
        })
      );
    };
  },
});
