import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { IllustratedMessage, IllustratedMessageHeading, IllustratedMessageDescription } from "../src";

describe("IllustratedMessage", () => {
  it("renders container and slots", () => {
    const wrapper = mount(IllustratedMessage, {
      attrs: {
        "data-testid": "message",
      },
      slots: {
        default: () => "message",
      },
    });

    const message = wrapper.get('[data-testid="message"]');
    expect(message.element.tagName).toBe("DIV");
    expect(message.classes()).toContain("spectrum-IllustratedMessage");
  });

  it("renders heading and description", () => {
    const heading = mount(IllustratedMessageHeading, {
      slots: { default: () => "Title" },
    });
    const description = mount(IllustratedMessageDescription, {
      slots: { default: () => "Body" },
    });

    expect(heading.find("h3").text()).toBe("Title");
    expect(heading.find("h3").classes()).toContain("spectrum-IllustratedMessage-heading");
    expect(description.find("p").text()).toBe("Body");
    expect(description.find("p").classes()).toContain("spectrum-IllustratedMessage-description");
  });
});
