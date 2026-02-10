import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Avatar } from "../src";

describe("Avatar", () => {
  it("renders an avatar image", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
      },
    });

    const image = wrapper.get("img");
    expect(image.attributes("src")).toBe("http://localhost/some_image.png");
  });

  it("renders an avatar image with alt text", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        alt: "Test avatar",
      },
    });

    expect(wrapper.get("img").attributes("alt")).toBe("Test avatar");
  });

  it("supports custom size values with units", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        size: "80px",
      },
    });

    const style = wrapper.get("img").attributes("style");
    expect(style).toContain("height: 80px");
    expect(style).toContain("width: 80px");
  });

  it("supports custom numeric sizes", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        size: 80,
      },
    });

    const style = wrapper.get("img").attributes("style");
    expect(style).toContain("height: 80px");
    expect(style).toContain("width: 80px");
  });

  it("supports custom class names", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        UNSAFE_className: "my-class",
      },
    });

    expect(wrapper.get("img").attributes("class")).toContain("my-class");
  });

  it("supports style props", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        isHidden: true,
      } as Record<string, unknown>,
    });

    expect(wrapper.get("img").attributes("hidden")).toBeDefined();
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        "data-testid": "test-avatar",
      } as Record<string, unknown>,
    });

    expect(wrapper.get("[data-testid=\"test-avatar\"]").attributes("data-testid")).toBe(
      "test-avatar"
    );
  });

  it("supports disabled state", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        isDisabled: true,
      },
    });

    expect(wrapper.get("img").attributes("class")).toContain("is-disabled");
  });

  it("exposes UNSAFE_getDOMNode through component refs", () => {
    const avatarRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const App = defineComponent({
      name: "AvatarRefTestApp",
      setup() {
        return () =>
          h(Avatar, {
            ref: avatarRef,
            src: "http://localhost/some_image.png",
          });
      },
    });

    const wrapper = mount(App);
    const avatar = wrapper.findComponent(Avatar);
    expect(avatarRef.value?.UNSAFE_getDOMNode()).toBe(avatar.element);
  });
});
