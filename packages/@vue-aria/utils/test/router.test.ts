import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  getSyntheticLinkProps,
  handleLinkClick,
  openLink,
  provideRouter,
  shouldClientNavigate,
  useLinkProps,
  useSyntheticLinkProps,
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

  it("resolves synthetic link href through router useHref", () => {
    let dataHref: unknown;

    const Child = defineComponent({
      setup() {
        const props = useSyntheticLinkProps({ href: "/reports" });
        dataHref = props["data-href"];
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
    expect(dataHref).toBe("/app/reports");
  });

  it("keeps deprecated getSyntheticLinkProps href unmapped", () => {
    const props = getSyntheticLinkProps({
      href: "/reports",
      target: "_blank",
      rel: "noopener",
      download: true,
      ping: "/ping",
      referrerPolicy: "origin",
    });

    expect(props["data-href"]).toBe("/reports");
    expect(props["data-target"]).toBe("_blank");
    expect(props["data-rel"]).toBe("noopener");
    expect(props["data-download"]).toBe(true);
    expect(props["data-ping"]).toBe("/ping");
    expect(props["data-referrer-policy"]).toBe("origin");
  });

  it("tracks openLink.isOpening during dispatch", () => {
    const anchor = document.createElement("a");
    anchor.href = "/reports";

    const openingStates: boolean[] = [];
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      openingStates.push(openLink.isOpening);
      expect(event.metaKey).toBe(true);
    });

    expect(openLink.isOpening).toBe(false);
    openLink(anchor, { metaKey: true });
    expect(openingStates).toEqual([true]);
    expect(openLink.isOpening).toBe(false);
  });

  it("supports openLink calls that do not mark opening state", () => {
    const anchor = document.createElement("a");
    anchor.href = "/reports";

    const openingStates: boolean[] = [];
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      openingStates.push(openLink.isOpening);
    });

    openLink(anchor, {}, false);
    expect(openingStates).toEqual([false]);
    expect(openLink.isOpening).toBe(false);
  });
});
