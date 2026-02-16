import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { FileTrigger } from "../src";

describe("FileTrigger", () => {
  it("renders a file input", () => {
    const wrapper = mount(FileTrigger, {
      attrs: {
        "data-testid": "file-trigger",
      },
    });

    const input = wrapper.get('[data-testid="file-trigger"]');
    expect(input.element.tagName).toBe("INPUT");
    expect((input.element as HTMLInputElement).type).toBe("file");
    expect(input.classes()).toContain("spectrum-FileTrigger");
  });

  it("supports UNSAFE className", () => {
    const wrapper = mount(FileTrigger, {
      props: {
        UNSAFE_className: "my-file-trigger",
      },
      attrs: {
        "data-testid": "file-trigger",
      },
    });

    expect(wrapper.get('[data-testid="file-trigger"]').classes()).toContain("my-file-trigger");
  });
});
