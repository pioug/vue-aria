import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { StatusLight } from "../src";

describe("StatusLight", () => {
  it("renders default neutral variant", () => {
    const wrapper = mount(StatusLight, {
      attrs: {
        "data-testid": "status",
      },
      slots: { default: () => "Ready" },
    });

    expect(wrapper.get('[data-testid="status"]').classes()).toContain("spectrum-StatusLight--neutral");
  });

  it("supports custom variant and custom class", () => {
    const wrapper = mount(StatusLight, {
      props: {
        variant: "positive",
      },
      attrs: {
        "data-testid": "status",
      },
    });

    expect(wrapper.get('[data-testid="status"]').classes()).toContain("spectrum-StatusLight--positive");
  });
});
