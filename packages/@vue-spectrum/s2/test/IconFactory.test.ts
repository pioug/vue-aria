import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { createIcon, createIllustration } from "../src";

const TestSvg = defineComponent({
  name: "S2FactoryTestSvg",
  setup() {
    return () =>
      h("svg", { viewBox: "0 0 10 10" }, [h("circle", { cx: 5, cy: 5, r: 4 })]);
  },
});

describe("@vue-spectrum/s2 icon factories", () => {
  it("createIcon renders a Spectrum Icon wrapper", () => {
    const GeneratedIcon = createIcon(TestSvg);
    const wrapper = mount(GeneratedIcon, {
      attrs: {
        "aria-label": "Factory icon",
        class: "factory-icon",
      },
    });

    const icon = wrapper.get("svg");
    expect(icon.classes()).toContain("spectrum-Icon");
    expect(icon.classes()).toContain("factory-icon");
    expect(icon.attributes("aria-label")).toBe("Factory icon");
    expect(icon.attributes("role")).toBe("img");
  });

  it("createIllustration renders a Spectrum Illustration wrapper", () => {
    const GeneratedIllustration = createIllustration(TestSvg);
    const wrapper = mount(GeneratedIllustration, {
      attrs: {
        "aria-label": "Factory illustration",
      },
    });

    const illustration = wrapper.get("svg");
    expect(illustration.attributes("aria-label")).toBe("Factory illustration");
    expect(illustration.attributes("role")).toBe("img");
    expect(illustration.attributes("focusable")).toBe("false");
  });
});
