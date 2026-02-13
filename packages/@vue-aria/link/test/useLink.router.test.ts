import { effectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

const { router } = vi.hoisted(() => ({
  router: {
    isNative: false,
    open: vi.fn(),
    useHref: vi.fn((href: string) => href),
  },
}));

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/utils")>("@vue-aria/utils");
  return {
    ...actual,
    useRouter: () => router,
  };
});

import { useLink } from "../src";
import { useRouter } from "@vue-aria/utils";

function createMouseEvent(target: HTMLAnchorElement, defaultPrevented: boolean = false): MouseEvent {
  const event = {
    currentTarget: target,
    defaultPrevented,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
  } as unknown as MouseEvent;

  return event;
}

describe("useLink router integration", () => {
  afterEach(() => {
    router.open.mockClear();
    router.useHref.mockClear();
  });

  it("routes click navigation through non-native router when href is client-navigable", () => {
    const anchor = document.createElement("a");
    anchor.href = new URL("/next", window.location.href).href;
    expect(anchor.origin).toBe(window.location.origin);

    const scope = effectScope();
    const { linkProps } = scope.run(() =>
      useLink({
        href: "/next",
        routerOptions: { from: "test" },
      })
    )!;
    expect(useRouter().isNative).toBe(false);

    const event = createMouseEvent(anchor);
    (linkProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(router.open).toHaveBeenCalledTimes(1);
    expect(router.open).toHaveBeenCalledWith(anchor, event, "/next", { from: "test" });
    scope.stop();
  });

  it("does not route click when event is already default-prevented", () => {
    const anchor = document.createElement("a");
    anchor.href = new URL("/next", window.location.href).href;

    const scope = effectScope();
    const { linkProps } = scope.run(() =>
      useLink({
        href: "/next",
      })
    )!;

    const event = createMouseEvent(anchor, true);
    (linkProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);

    expect(router.open).not.toHaveBeenCalled();
    scope.stop();
  });

  it("does not route click when modifier keys are pressed", () => {
    const anchor = document.createElement("a");
    anchor.href = new URL("/next", window.location.href).href;

    const scope = effectScope();
    const { linkProps } = scope.run(() =>
      useLink({
        href: "/next",
      })
    )!;

    const event = createMouseEvent(anchor);
    Object.assign(event, { metaKey: true });
    (linkProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);

    expect(router.open).not.toHaveBeenCalled();
    scope.stop();
  });

  it("does not route click for cross-origin links", () => {
    const anchor = document.createElement("a");
    anchor.href = "https://example.com/next";
    expect(anchor.origin).not.toBe(window.location.origin);

    const scope = effectScope();
    const { linkProps } = scope.run(() =>
      useLink({
        href: "/next",
      })
    )!;

    const event = createMouseEvent(anchor);
    (linkProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);

    expect(router.open).not.toHaveBeenCalled();
    scope.stop();
  });
});
