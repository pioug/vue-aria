import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Image } from "../src";

describe("Image", () => {
  it("renders correctly", () => {
    const wrapper = mount(Image, {
      props: {
        src: "https://i.imgur.com/Z7AzH2c.png",
        alt: "Sky and roof",
      },
    });

    expect(wrapper.get("img").attributes("alt")).toBe("Sky and roof");
    expect(wrapper.get("img").attributes("src")).toBe(
      "https://i.imgur.com/Z7AzH2c.png"
    );
  });

  it("calls onError callback", async () => {
    const onError = vi.fn();
    const wrapper = mount(Image, {
      props: {
        src: "https://i.imgur.com/Z7AzH2c.png",
        alt: "Sky and roof",
        onError,
      },
    });

    await wrapper.get("img").trigger("error");
    expect(onError).toHaveBeenCalled();
  });

  it("supports crossOrigin anonymous", () => {
    const wrapper = mount(Image, {
      props: {
        src: "https://i.imgur.com/Z7AzH2c.png",
        alt: "Sky and roof",
        crossOrigin: "anonymous",
      },
    });

    expect(wrapper.get("img").attributes("crossorigin")).toBe("anonymous");
  });

  it("supports crossOrigin use-credentials", () => {
    const wrapper = mount(Image, {
      props: {
        src: "https://i.imgur.com/Z7AzH2c.png",
        alt: "Sky and roof",
        crossOrigin: "use-credentials",
      },
    });

    expect(wrapper.get("img").attributes("crossorigin")).toBe("use-credentials");
  });

  it("does not include crossOrigin when unset", () => {
    const wrapper = mount(Image, {
      props: {
        src: "https://i.imgur.com/Z7AzH2c.png",
        alt: "Sky and roof",
      },
    });

    expect(wrapper.get("img").attributes("crossorigin")).toBeUndefined();
  });
});
