import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideI18n } from "@vue-aria/i18n";
import { useOverlayPosition } from "../src";

interface Scenario {
  target: HTMLButtonElement;
  container: HTMLDivElement;
  overlay: HTMLDivElement;
}

function mockRect(
  element: Element,
  rect: Partial<DOMRectReadOnly>
): void {
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      top: rect.top ?? 0,
      left: rect.left ?? 0,
      right: rect.right ?? ((rect.left ?? 0) + (rect.width ?? 0)),
      bottom: rect.bottom ?? ((rect.top ?? 0) + (rect.height ?? 0)),
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      toJSON: () => ({}),
    }),
    configurable: true,
  });
}

function setOffsetParent(element: HTMLElement, offsetParent: Element | null): void {
  Object.defineProperty(element, "offsetParent", {
    configurable: true,
    get() {
      return offsetParent;
    },
  });
}

function createVisualViewport(): VisualViewport {
  const visualViewport = new EventTarget() as VisualViewport;
  Object.assign(visualViewport, {
    offsetTop: 0,
    height: 768,
    offsetLeft: 0,
    scale: 1,
    width: 500,
    pageLeft: 0,
    pageTop: 0,
    onresize: null,
    onscroll: null,
  });
  return visualViewport;
}

function createScenario(options: {
  triggerTop?: number;
  containerRect?: Partial<DOMRectReadOnly>;
  containerPosition?: string;
} = {}): Scenario {
  const target = document.createElement("button");
  const container = document.createElement("div");
  const overlay = document.createElement("div");

  overlay.style.width = "300px";
  overlay.style.height = "200px";

  if (options.containerPosition) {
    container.style.position = options.containerPosition;
  }

  document.body.append(target, container);
  container.appendChild(overlay);

  setOffsetParent(overlay, container);

  const triggerTop = options.triggerTop ?? 250;
  const containerRect = options.containerRect ?? {
    left: 0,
    top: 0,
    width: 600,
    height: 600,
  };

  mockRect(target, { left: 10, top: triggerTop, width: 100, height: 100 });
  mockRect(container, {
    left: containerRect.left ?? 0,
    top: containerRect.top ?? 0,
    width: containerRect.width ?? 600,
    height: containerRect.height ?? 600,
  });
  mockRect(overlay, { left: 0, top: 0, width: 300, height: 200 });

  return {
    target,
    container,
    overlay,
  };
}

beforeEach(() => {
  document.body.style.margin = "0";

  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    value: 768,
  });
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: 500,
  });

  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: createVisualViewport(),
  });

  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return parseInt(this.style.width, 10) || 0;
  });

  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return parseInt(this.style.height, 10) || 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("useOverlayPosition", () => {
  it("positions the overlay relative to the trigger", () => {
    const { target, overlay } = createScenario();

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        arrowSize: 8,
      });
    });

    const style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style).toMatchObject({
      position: "absolute",
      zIndex: 100000,
      left: 12,
      top: 350,
      maxHeight: 406,
    });
    expect(result.placement.value).toBe("bottom");

    const arrowStyle = result.arrowProps.value.style as Record<string, unknown>;
    expect(arrowStyle.left).toBe(48);

    scope.stop();
  });

  it("positions the overlay relative to the trigger at top", () => {
    const { target, overlay } = createScenario();

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        placement: "top",
        isOpen: true,
        arrowSize: 8,
      });
    });

    const style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style).toMatchObject({
      position: "absolute",
      zIndex: 100000,
      left: 12,
      bottom: 350,
      maxHeight: 238,
    });
    expect(result.placement.value).toBe("top");

    const arrowStyle = result.arrowProps.value.style as Record<string, unknown>;
    expect(arrowStyle.left).toBe(48);

    scope.stop();
  });

  it("updates the position on window resize", () => {
    const { target, overlay } = createScenario({ triggerTop: 400 });

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        arrowSize: 8,
      });
    });

    let style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.left).toBe(12);
    expect(style.top).toBe(500);
    expect(style.maxHeight).toBe(256);

    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 1000,
    });
    (window.visualViewport as unknown as { height: number }).height = 1000;

    window.dispatchEvent(new Event("resize"));

    style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.left).toBe(12);
    expect(style.top).toBe(500);
    expect(style.maxHeight).toBe(488);

    scope.stop();
  });

  it("updates the position on props change", () => {
    const { target, overlay } = createScenario();
    const offset = ref(0);

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        offset,
        isOpen: true,
        arrowSize: 8,
      });
    });

    let style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.left).toBe(12);
    expect(style.top).toBe(350);
    expect(style.maxHeight).toBe(406);

    offset.value = 20;

    style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.left).toBe(12);
    expect(style.top).toBe(370);
    expect(style.maxHeight).toBe(386);

    scope.stop();
  });

  it("limits maxHeight when user value is smaller than viewport space", () => {
    const { target, overlay } = createScenario();
    const maxHeight = ref(450);

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        maxHeight,
        isOpen: true,
        arrowSize: 8,
      });
    });

    let style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.maxHeight).toBe(406);

    maxHeight.value = 150;

    style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style.maxHeight).toBe(150);

    scope.stop();
  });

  it("closes the overlay when the trigger scrolls", () => {
    const scrollable = document.createElement("div");
    const { target, container, overlay } = createScenario();

    scrollable.append(target, container);
    document.body.appendChild(scrollable);

    const onClose = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        onClose,
      });
    });

    scrollable.dispatchEvent(new Event("scroll"));
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("does not close when adjacent scrollable region scrolls", () => {
    const wrapper = document.createElement("div");
    const adjacent = document.createElement("div");
    const { target, container, overlay } = createScenario();

    wrapper.append(target, container, adjacent);
    document.body.appendChild(wrapper);

    const onClose = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        onClose,
      });
    });

    adjacent.dispatchEvent(new Event("scroll"));
    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
  });

  it("closes when body scrolls", () => {
    const { target, overlay } = createScenario();
    const onClose = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        onClose,
      });
    });

    document.body.dispatchEvent(new Event("scroll"));
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("closes when document scrolls", () => {
    const { target, overlay } = createScenario();
    const onClose = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        onClose,
      });
    });

    document.dispatchEvent(new Event("scroll"));
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("closes when window is the scroll target", () => {
    const { target, overlay } = createScenario();
    const onClose = vi.fn();

    const scope = effectScope();
    scope.run(() => {
      useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        onClose,
      });
    });

    window.dispatchEvent(new Event("scroll"));
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
  });

  it("maps start placement to left for ltr locale", () => {
    const { target, overlay } = createScenario();
    let result!: ReturnType<typeof useOverlayPosition>;
    const Child = defineComponent({
      setup() {
        result = useOverlayPosition({
          targetRef: target,
          overlayRef: overlay,
          placement: "start",
          shouldFlip: false,
          isOpen: true,
        });
        return () => h("div");
      },
    });
    const App = defineComponent({
      setup() {
        provideI18n({ locale: "en-US" });
        return () => h(Child);
      },
    });

    const wrapper = mount(App);
    const style = result.overlayProps.value.style as Record<string, unknown>;

    expect(result.placement.value).toBe("left");
    expect(style.right).toBeTypeOf("number");
    expect(style.left).toBeUndefined();

    wrapper.unmount();
  });

  it("maps start placement to right for rtl locale", () => {
    const { target, overlay } = createScenario();
    let result!: ReturnType<typeof useOverlayPosition>;
    const Child = defineComponent({
      setup() {
        result = useOverlayPosition({
          targetRef: target,
          overlayRef: overlay,
          placement: "start",
          shouldFlip: false,
          isOpen: true,
        });
        return () => h("div");
      },
    });
    const App = defineComponent({
      setup() {
        provideI18n({ locale: "ar-EG" });
        return () => h(Child);
      },
    });

    const wrapper = mount(App);
    const style = result.overlayProps.value.style as Record<string, unknown>;

    expect(result.placement.value).toBe("right");
    expect(style.left).toBeTypeOf("number");
    expect(style.right).toBeUndefined();

    wrapper.unmount();
  });

  it("hides arrow from assistive technologies", () => {
    const { target, overlay } = createScenario();

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
      });
    });

    expect(result.arrowProps.value["aria-hidden"]).toBe("true");
    expect(result.arrowProps.value.role).toBe("presentation");

    scope.stop();
  });
});

describe("useOverlayPosition with positioned container", () => {
  it("positions relative to positioned container", () => {
    const { target, overlay } = createScenario({
      containerRect: { left: 0, top: 150, width: 400, height: 400 },
      containerPosition: "relative",
    });

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        isOpen: true,
        arrowSize: 8,
      });
    });

    const style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style).toMatchObject({
      position: "absolute",
      zIndex: 100000,
      left: 12,
      top: 200,
      maxHeight: 406,
    });
    expect(result.placement.value).toBe("bottom");

    const arrowStyle = result.arrowProps.value.style as Record<string, unknown>;
    expect(arrowStyle.left).toBe(48);

    scope.stop();
  });

  it("positions top placement relative to positioned container", () => {
    const { target, overlay } = createScenario({
      containerRect: { left: 0, top: 150, width: 400, height: 400 },
      containerPosition: "relative",
    });

    const scope = effectScope();
    let result!: ReturnType<typeof useOverlayPosition>;

    scope.run(() => {
      result = useOverlayPosition({
        targetRef: target,
        overlayRef: overlay,
        placement: "top",
        isOpen: true,
        arrowSize: 8,
      });
    });

    const style = result.overlayProps.value.style as Record<string, unknown>;
    expect(style).toMatchObject({
      position: "absolute",
      zIndex: 100000,
      left: 12,
      bottom: 300,
      maxHeight: 238,
    });
    expect(result.placement.value).toBe("top");

    const arrowStyle = result.arrowProps.value.style as Record<string, unknown>;
    expect(arrowStyle.left).toBe(48);

    scope.stop();
  });
});
