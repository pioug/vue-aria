import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Content, Footer, Header, View } from "../src";

describe("View", () => {
  it("renders", () => {
    const wrapper = mount(View);
    expect(wrapper.find("div").exists()).toBe(true);
  });

  it("supports elementType overrides", () => {
    const wrapper = mount(View, {
      props: {
        elementType: "section",
      },
    });

    expect(wrapper.find("section").exists()).toBe(true);
  });
});

describe("Content", () => {
  it("renders a section", () => {
    const wrapper = mount(Content);
    expect(wrapper.find("section").exists()).toBe(true);
  });
});

describe("Header", () => {
  it("renders a header", () => {
    const wrapper = mount(Header);
    expect(wrapper.find("header").exists()).toBe(true);
  });
});

describe("Footer", () => {
  it("renders a footer", () => {
    const wrapper = mount(Footer);
    expect(wrapper.find("footer").exists()).toBe(true);
  });
});
