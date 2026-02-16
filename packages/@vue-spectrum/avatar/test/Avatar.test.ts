import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Avatar } from "../src";

describe("Avatar", () => {
  it("renders an avatar image", () => {
    const wrapper = mount(Avatar, {
      props: { src: "http://localhost/some_image.png" },
    });
    const img = wrapper.get("img");
    expect(img.attributes("src")).toBe("http://localhost/some_image.png");
  });

  it("renders an avatar image with an alt", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        alt: "Test avatar",
      },
    });
    const img = wrapper.get('img[alt="Test avatar"]');
    expect(img.exists()).toBe(true);
  });

  it("supports custom size in units", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        size: "80px",
      },
    });
    const img = wrapper.get("img").element as HTMLImageElement;
    expect(img.style.height).toBe("80px");
    expect(img.style.width).toBe("80px");
  });

  it("supports custom size in numbers", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        size: 80,
      },
    });
    const img = wrapper.get("img").element as HTMLImageElement;
    expect(img.style.height).toBe("80px");
    expect(img.style.width).toBe("80px");
  });

  it("supports custom class names", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        UNSAFE_className: "my-class",
      },
    });
    expect(wrapper.get("img").classes()).toContain("my-class");
  });

  it("supports style props", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        UNSAFE_style: {
          display: "none",
        },
      },
    });
    const img = wrapper.get("img").element as HTMLImageElement;
    expect(img.style.display).toBe("none");
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        "data-testid": "Test avatar",
      } as any,
    });
    expect(wrapper.get('[data-testid="Test avatar"]')).toBeDefined();
  });

  it("renders a disabled avatar image", () => {
    const wrapper = mount(Avatar, {
      props: {
        src: "http://localhost/some_image.png",
        isDisabled: true,
      },
    });
    expect(wrapper.get("img").classes()).toContain("is-disabled");
  });
});
