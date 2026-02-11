import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { Avatar } from "../src/Avatar";

describe("@vue-spectrum/s2 Avatar", () => {
  it("renders baseline attrs and image props", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(Avatar, {
            src: "https://example.com/avatar.png",
            alt: "Profile avatar",
          }),
      },
    });

    const avatar = wrapper.get(".s2-Avatar");
    expect(avatar.element).toBeInstanceOf(HTMLImageElement);
    expect(avatar.attributes("src")).toBe("https://example.com/avatar.png");
    expect(avatar.attributes("alt")).toBe("Profile avatar");
  });
});
