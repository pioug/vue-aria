import { mount } from "@vue/test-utils";
import { Content } from "@vue-spectrum/view";
import { Heading } from "@vue-spectrum/text";
import { defineComponent, h, type VNode } from "vue";
import { describe, expect, it } from "vitest";
import { IllustratedMessage } from "../src";

const dataTestId = "IMsvg1";

const Image = defineComponent({
  name: "IllustratedMessageImage",
  setup() {
    return () =>
      h(
        "svg",
        {
          "data-testid": dataTestId,
        },
        [h("path")]
      );
  },
});

interface RenderIllustratedMessageOptions {
  heading?: string;
  description?: string;
  illustration?: VNode | undefined;
}

function renderIllustratedMessage({
  heading,
  description,
  illustration,
}: RenderIllustratedMessageOptions) {
  return mount(IllustratedMessage, {
    slots: {
      default: () => [
        description ? h(Content, null, () => description) : null,
        heading ? h(Heading, null, () => heading) : null,
        illustration ?? null,
      ],
    },
  });
}

describe("IllustratedMessage", () => {
  it("renders all parts of an illustrated message", () => {
    const wrapper = renderIllustratedMessage({
      heading: "foo",
      description: "bar",
      illustration: h(Image),
    });

    const svg = wrapper.get(`[data-testid="${dataTestId}"]`);
    expect(svg.attributes("data-testid")).toBe(dataTestId);
    expect(wrapper.text()).toContain("foo");
    expect(wrapper.text()).toContain("bar");
  });

  it("renders only an svg", () => {
    const wrapper = renderIllustratedMessage({
      illustration: h(Image),
    });

    const svg = wrapper.get(`[data-testid="${dataTestId}"]`);
    expect(svg.attributes("data-testid")).toBe(dataTestId);
    expect(wrapper.text()).not.toContain("foo");
    expect(wrapper.text()).not.toContain("bar");
  });

  it("renders heading and description without an svg", () => {
    const wrapper = renderIllustratedMessage({
      heading: "foo",
      description: "bar",
    });

    expect(wrapper.find(`[data-testid="${dataTestId}"]`).exists()).toBe(false);
    expect(wrapper.text()).toContain("foo");
    expect(wrapper.text()).toContain("bar");
  });
});
