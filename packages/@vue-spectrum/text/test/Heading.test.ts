import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Heading } from "../src";

describe("Heading", () => {
  it("renders h3 by default", () => {
    const wrapper = mount(Heading, {
      slots: {
        default: "Section title",
      },
    });

    const heading = wrapper.get("h3");
    expect(heading.text()).toBe("Section title");
  });

  it("supports heading level overrides", () => {
    const wrapper = mount(Heading, {
      props: {
        level: 2,
      },
      slots: {
        default: "Title",
      },
    });

    expect(wrapper.get("h2").text()).toBe("Title");
  });
});
