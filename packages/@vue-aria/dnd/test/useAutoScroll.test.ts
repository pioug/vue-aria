import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useAutoScroll } from "../src/useAutoScroll";

function setupScrollableContainer(): HTMLElement {
  const container = document.createElement("div");
  container.style.overflowX = "auto";
  container.style.overflowY = "auto";
  container.scrollLeft = 40;
  container.scrollTop = 40;

  Object.defineProperty(container, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    }),
  });

  document.body.appendChild(container);
  return container;
}

describe("useAutoScroll", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("scrolls when pointer moves near container edge", () => {
    const container = setupScrollableContainer();

    let rafCallback: ((time: number) => void) | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const scope = effectScope();
    let autoScroll: ReturnType<typeof useAutoScroll> | undefined;

    scope.run(() => {
      autoScroll = useAutoScroll(ref(container));
    });

    autoScroll?.move(5, 5);
    expect(rafCallback).not.toBeNull();
    (rafCallback as unknown as (time: number) => void)(0);

    expect(container.scrollLeft).toBeLessThan(40);
    expect(container.scrollTop).toBeLessThan(40);

    scope.stop();
  });

  it("stops scrolling when pointer moves away from edge", () => {
    const container = setupScrollableContainer();

    let rafCallback: ((time: number) => void) | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    const cancelSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    const scope = effectScope();
    let autoScroll: ReturnType<typeof useAutoScroll> | undefined;

    scope.run(() => {
      autoScroll = useAutoScroll(ref(container));
    });

    autoScroll?.move(5, 5);
    expect(rafCallback).not.toBeNull();
    (rafCallback as unknown as (time: number) => void)(0);

    autoScroll?.move(50, 50);

    expect(cancelSpy).toHaveBeenCalled();

    scope.stop();
  });

  it("stops on explicit stop call", () => {
    const container = setupScrollableContainer();

    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    const cancelSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    const scope = effectScope();
    let autoScroll: ReturnType<typeof useAutoScroll> | undefined;

    scope.run(() => {
      autoScroll = useAutoScroll(ref(container));
    });

    autoScroll?.move(5, 5);
    autoScroll?.stop();

    expect(cancelSpy).toHaveBeenCalled();

    scope.stop();
  });
});
