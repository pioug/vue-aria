import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideRouter } from "@vue-aria/utils";
import { useLink } from "../src/useLink";

describe("useLink", () => {
  it("handles defaults", () => {
    const { linkProps } = useLink({});

    expect(linkProps.value.role).toBeUndefined();
    expect(linkProps.value.tabindex).toBe(0);
    expect(typeof linkProps.value.onKeydown).toBe("function");
  });

  it("handles custom element type", () => {
    const { linkProps } = useLink({ elementType: "div" });

    expect(linkProps.value.role).toBe("link");
    expect(linkProps.value.tabindex).toBe(0);
  });

  it("handles isDisabled", () => {
    const { linkProps } = useLink({ elementType: "span", isDisabled: true });

    expect(linkProps.value.role).toBe("link");
    expect(linkProps.value["aria-disabled"]).toBe(true);
    expect(linkProps.value.tabindex).toBeUndefined();
    expect(typeof linkProps.value.onKeydown).toBe("function");
  });

  it("uses provided router for client-side anchor navigation", async () => {
    const navigate = vi.fn();

    const LinkWithRouter = defineComponent({
      setup() {
        const { linkProps } = useLink({
          href: "/settings",
          routerOptions: { from: "test-link" },
        });

        return () => h("a", linkProps.value, "Settings");
      },
    });

    const App = defineComponent({
      setup() {
        provideRouter({
          navigate,
          useHref: (href) => `/app${href}`,
        });

        return () => h(LinkWithRouter);
      },
    });

    const wrapper = mount(App);
    const anchor = wrapper.get("a");

    expect(anchor.attributes("href")).toBe("/app/settings");
    await anchor.trigger("click");

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/settings", { from: "test-link" });
  });

  it("does not navigate when disabled even with router provider", async () => {
    const navigate = vi.fn();

    const LinkWithRouter = defineComponent({
      setup() {
        const { linkProps } = useLink({
          href: "/billing",
          isDisabled: true,
        });

        return () => h("a", linkProps.value, "Billing");
      },
    });

    const App = defineComponent({
      setup() {
        provideRouter({ navigate });
        return () => h(LinkWithRouter);
      },
    });

    const wrapper = mount(App);
    await wrapper.get("a").trigger("click");

    expect(navigate).not.toHaveBeenCalled();
  });
});
