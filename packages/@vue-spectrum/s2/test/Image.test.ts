import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Image } from "../src/Image";

describe("@vue-spectrum/s2 Image", () => {
  it("renders baseline attrs and image props", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Image, {
            src: "https://example.com/photo.png",
            alt: "Landscape",
            objectFit: "cover",
          }),
      },
    });

    const imageRoot = wrapper.get(".s2-Image");
    expect(imageRoot.element.tagName).toBe("DIV");

    const image = wrapper.get("img");
    expect(image.attributes("src")).toBe("https://example.com/photo.png");
    expect(image.attributes("alt")).toBe("Landscape");
    expect(image.attributes("style")).toContain("object-fit: cover");
  });
});
