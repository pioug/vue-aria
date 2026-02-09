import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Flex } from "../src";

describe("Flex", () => {
  it("renders with flex display", () => {
    const wrapper = mount(Flex);
    const flex = wrapper.get("div").element as HTMLDivElement;

    expect(flex.style.display).toBe("flex");
  });

  it("normalizes alignment and wrap values", () => {
    const wrapper = mount(Flex, {
      props: {
        justifyContent: "start",
        alignItems: "end",
        wrap: true,
      },
    });

    const flex = wrapper.get("div").element as HTMLDivElement;
    expect(flex.style.justifyContent).toBe("flex-start");
    expect(flex.style.alignItems).toBe("flex-end");
    expect(flex.style.flexWrap).toBe("wrap");
  });

  it("supports gap props", () => {
    const wrapper = mount(Flex, {
      props: {
        gap: 12,
        rowGap: 8,
        columnGap: 6,
      },
    });

    const flex = wrapper.get("div").element as HTMLDivElement;
    expect(flex.style.gap).toBe("12px");
    expect(flex.style.rowGap).toBe("8px");
    expect(flex.style.columnGap).toBe("6px");
  });
});
