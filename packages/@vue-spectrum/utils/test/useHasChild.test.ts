import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { useHasChild } from "../src";

const ChildProbe = defineComponent({
  name: "ChildProbe",
  props: {
    showChild: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const rootRef = ref<HTMLElement | null>(null);
    const hasChild = useHasChild(".target-child", rootRef);

    return () =>
      h(
        "div",
        {
          ref: rootRef,
          "data-has-child": String(hasChild.value),
        },
        props.showChild
          ? [h("span", { class: "target-child" }, "child")]
          : []
      );
  },
});

describe("useHasChild", () => {
  it("reports false when matching children are absent", async () => {
    const wrapper = mount(ChildProbe, {
      props: {
        showChild: false,
      },
    });

    await nextTick();
    expect(wrapper.get("div").attributes("data-has-child")).toBe("false");
  });

  it("reports true when matching children are present", async () => {
    const wrapper = mount(ChildProbe, {
      props: {
        showChild: true,
      },
    });

    await nextTick();
    expect(wrapper.get("div").attributes("data-has-child")).toBe("true");
  });
});
