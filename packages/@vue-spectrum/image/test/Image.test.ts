import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Image } from "../src";

describe("Image", () => {
  it("renders image with src and alt", () => {
    const wrapper = mount(Image, {
      props: {
        src: "/avatar.png",
        alt: "avatar",
      },
      attrs: {
        "data-testid": "image",
      },
    });

    const image = wrapper.get('[data-testid="image"]');
    expect(image.element.tagName).toBe("IMG");
    expect((image.element as HTMLImageElement).src).toContain("/avatar.png");
    expect((image.element as HTMLImageElement).alt).toBe("avatar");
    expect(image.classes()).toContain("spectrum-Image");
  });
});
