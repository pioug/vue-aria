import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Dropzone } from "../src";

describe("Dropzone", () => {
  it("renders a dropzone container", () => {
    const wrapper = mount(Dropzone, {
      attrs: {
        "data-testid": "dropzone",
      },
      slots: {
        default: () => "Drop files here",
      },
    });

    const zone = wrapper.get('[data-testid="dropzone"]');
    expect(zone.element.tagName).toBe("DIV");
    expect(zone.classes()).toContain("spectrum-Dropzone");
    expect(zone.text()).toBe("Drop files here");
  });

  it("supports UNSAFE className", () => {
    const wrapper = mount(Dropzone, {
      props: {
        UNSAFE_className: "my-dropzone",
      },
      attrs: {
        "data-testid": "dropzone",
      },
    });

    expect(wrapper.get('[data-testid="dropzone"]').classes()).toContain("my-dropzone");
  });
});
