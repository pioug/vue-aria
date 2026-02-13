import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  handleLinkClick,
  provideRouter,
  shouldClientNavigate,
  useLinkProps,
} from "../src";

describe("router utilities", () => {
  it("detects client navigation links", () => {
    const sameOrigin = document.createElement("a");
    sameOrigin.href = "/dashboard";

    expect(
      shouldClientNavigate(sameOrigin, {
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      })
    ).toBe(true);

    const external = document.createElement("a");
    external.href = "https://example.com";

    expect(
      shouldClientNavigate(external, {
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      })
    ).toBe(false);

    expect(
      shouldClientNavigate(sameOrigin, {
        metaKey: false,
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
      })
    ).toBe(false);
  });

  it("forwards anchor clicks to custom router", () => {
    const open = vi.fn();
    const router = {
      isNative: false,
      open,
      useHref: (href: string) => href,
    };

    const anchor = document.createElement("a");
    anchor.href = "/projects";

    anchor.addEventListener("click", (event) => {
      handleLinkClick(event as MouseEvent, router, "/projects", {
        from: "router-test",
      });
    });

    anchor.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      anchor,
      expect.objectContaining({ type: "click" }),
      "/projects",
      { from: "router-test" }
    );
  });

  it("maps href values with router provider", () => {
    let resolvedHref: string | undefined;

    const Child = defineComponent({
      setup() {
        const linkProps = useLinkProps({ href: "/reports" });
        resolvedHref = linkProps.href;
        return () => h("div");
      },
    });

    const App = defineComponent({
      setup() {
        provideRouter({
          navigate: vi.fn(),
          useHref: (href) => `/app${href}`,
        });

        return () => h(Child);
      },
    });

    mount(App);
    expect(resolvedHref).toBe("/app/reports");
  });
});
