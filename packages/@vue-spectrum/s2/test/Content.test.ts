import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import {
  Content,
  Footer,
  Header,
  Heading,
  Keyboard,
  Text,
} from "../src/Content";

describe("@vue-spectrum/s2 Content primitives", () => {
  it("renders baseline class names for content wrappers", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h("section", [
            h(Header, { id: "heading-slot" }, { default: () => "Header text" }),
            h(Heading, { level: 2 }, { default: () => "Section heading" }),
            h(Content, { role: "group" }, { default: () => "Main content" }),
            h(Text, null, { default: () => "Body copy" }),
            h(Keyboard, null, { default: () => "Ctrl+K" }),
            h(Footer, null, { default: () => "Footer note" }),
          ]),
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".s2-Header").exists()).toBe(true);
    expect(wrapper.find(".s2-Heading").exists()).toBe(true);
    expect(wrapper.find(".s2-Content").exists()).toBe(true);
    expect(wrapper.find(".s2-Text").exists()).toBe(true);
    expect(wrapper.find(".s2-Keyboard").exists()).toBe(true);
    expect(wrapper.find(".s2-Footer").exists()).toBe(true);
  });

  it("supports isHidden by unmounting hidden elements", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h("section", [
            h(Heading, { isHidden: true }, { default: () => "Hidden heading" }),
            h(Content, { isHidden: true }, { default: () => "Hidden content" }),
            h(Text, null, { default: () => "Visible text" }),
          ]),
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".s2-Heading").exists()).toBe(false);
    expect(wrapper.find(".s2-Content").exists()).toBe(false);
    expect(wrapper.find(".s2-Text").exists()).toBe(true);
    expect(wrapper.text()).toContain("Visible text");
    expect(wrapper.text()).not.toContain("Hidden heading");
  });
});
