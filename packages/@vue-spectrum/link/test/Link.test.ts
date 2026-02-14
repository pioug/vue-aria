import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { Provider } from "@vue-spectrum/provider";
import { theme } from "@vue-spectrum/theme";
import { Link } from "../src/Link";

describe("Link", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("handles defaults", async () => {
    const onPress = vi.fn();
    const wrapper = mount(Link as any, {
      props: {
        onPress,
      },
      slots: {
        default: () => "Click me",
      },
      attachTo: document.body,
    });

    const link = wrapper.get('[role="link"]');
    await link.trigger("click");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(Link as any, {
      props: {
        UNSAFE_className: "test-class",
      },
      slots: {
        default: () => "Click me",
      },
    });

    const link = wrapper.get('[role="link"]');
    expect(link.classes()).toContain("test-class");
  });

  it("wraps string content to a span link when href is absent", () => {
    const wrapper = mount(Link as any, {
      slots: {
        default: () => "Click me",
      },
    });

    const link = wrapper.get('[role="link"]');
    expect(link.element.nodeName).toBe("SPAN");
    expect(link.attributes("tabindex")).toBe("0");
  });

  it("supports href", () => {
    const wrapper = mount(Link as any, {
      props: {
        href: "https://adobe.com",
      },
      slots: {
        default: () => "Click me",
      },
    });

    const link = wrapper.get('a[href]');
    expect(link.element.nodeName).toBe("A");
    expect((link.element as HTMLAnchorElement).href).toBe("https://adobe.com/");
  });

  it("wraps custom child element", async () => {
    const onPress = vi.fn();
    const wrapper = mount(Link as any, {
      props: {
        UNSAFE_className: "test-class",
        onPress,
      },
      slots: {
        default: () => h("a", { href: "#only-hash-in-jsdom" }, "Click me"),
      },
      attachTo: document.body,
    });

    const link = wrapper.get('a[href="#only-hash-in-jsdom"]');
    expect(link.classes()).toContain("test-class");
    await link.trigger("click");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Link as any, {
      attrs: {
        "data-testid": "test",
      },
      slots: {
        default: () => "Click me",
      },
    });

    const link = wrapper.get('[data-testid="test"]');
    expect(link.attributes("data-testid")).toBe("test");
  });

  it("supports autofocus", async () => {
    const wrapper = mount(Link as any, {
      props: {
        autoFocus: true,
      },
      slots: {
        default: () => "Click me",
      },
      attachTo: document.body,
    });

    await nextTick();
    const link = wrapper.get('[role="link"]');
    expect(document.activeElement).toBe(link.element);
  });

  it("supports RouterProvider", () => {
    const navigate = vi.fn();
    const useHref = (href: string) => `/base${href}`;
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider as any,
              {
                theme,
                router: { navigate, useHref },
              },
              () =>
                h(
                  Link as any,
                  {
                    href: "/foo",
                    routerOptions: { foo: "bar" },
                  },
                  { default: () => "Click me" }
                )
            );
        },
      }),
      { attachTo: document.body }
    );

    const link = wrapper.get('a[href="/base/foo"]');
    expect(link.attributes("href")).toBe("/base/foo");
    expect(navigate).not.toHaveBeenCalled();
  });
});
