import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { HelpText } from "../src";

describe("HelpText", () => {
  it("renders neutral description text by default", () => {
    const wrapper = mount(HelpText, {
      props: {
        description: "Helpful text",
      },
    });

    expect(wrapper.classes()).toContain("spectrum-HelpText");
    expect(wrapper.classes()).toContain("spectrum-HelpText--neutral");
    expect(wrapper.text()).toContain("Helpful text");
  });

  it("renders error text when invalid", () => {
    const wrapper = mount(HelpText, {
      props: {
        description: "Helpful text",
        errorMessage: "Error text",
        validationState: "invalid",
      },
    });

    expect(wrapper.classes()).toContain("spectrum-HelpText--negative");
    expect(wrapper.text()).toContain("Error text");
    expect(wrapper.text()).not.toContain("Helpful text");
  });

  it("renders optional error icon", () => {
    const wrapper = mount(HelpText, {
      props: {
        errorMessage: "Error text",
        isInvalid: true,
        showErrorIcon: true,
      },
    });

    expect(wrapper.find(".spectrum-HelpText-validationIcon").exists()).toBe(true);
  });
});
