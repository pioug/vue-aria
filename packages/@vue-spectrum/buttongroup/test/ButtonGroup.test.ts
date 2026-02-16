import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { ButtonGroup } from "../src";

describe("ButtonGroup", () => {
  const buttons = [
    h("button", { type: "button" }, "Button1"),
    h("button", { type: "button" }, "Button2"),
    h("button", { type: "button" }, "Button3"),
  ];

  it("renders multiple children", () => {
    const wrapper = mount(ButtonGroup, {
      attrs: {
        "data-testid": "button-group",
      },
      slots: {
        default: () => buttons,
      },
    });

    const group = wrapper.get('[data-testid="button-group"]');
    expect(group.findAll("button").length).toBe(3);
    expect(group.find("button:nth-child(1)").text()).toBe("Button1");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        UNSAFE_className: "my-group",
      },
      attrs: {
        "data-testid": "button-group",
      },
    });
    expect(wrapper.get('[data-testid="button-group"]').classes()).toContain("my-group");
  });

  it("supports vertical orientation", () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        orientation: "vertical",
      },
      attrs: {
        "data-testid": "button-group",
      },
    });
    expect(wrapper.get('[data-testid="button-group"]').classes()).toContain("spectrum-ButtonGroup--vertical");
  });

  it("supports align end class", () => {
    const wrapper = mount(ButtonGroup, {
      props: {
        align: "end",
      },
      attrs: {
        "data-testid": "button-group",
      },
    });
    expect(wrapper.get('[data-testid="button-group"]').classes()).toContain("spectrum-ButtonGroup--alignEnd");
  });
});
