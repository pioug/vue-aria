import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useOverlay } from "../src";

interface OverlaySetup {
  overlay: HTMLElement;
  underlay: HTMLElement;
  result: ReturnType<typeof useOverlay>;
  cleanup: () => void;
}

function setupOverlay(
  options: Parameters<typeof useOverlay>[0] = {}
): OverlaySetup {
  const underlay = document.createElement("div");
  const overlay = document.createElement("div");
  underlay.appendChild(overlay);
  document.body.appendChild(underlay);

  const scope = effectScope();
  let result!: ReturnType<typeof useOverlay>;

  scope.run(() => {
    result = useOverlay(
      {
        isOpen: true,
        ...options,
      },
      overlay
    );
  });

  overlay.addEventListener(
    "keydown",
    result.overlayProps.value.onKeydown as EventListener
  );
  underlay.addEventListener(
    "pointerdown",
    result.underlayProps.value.onPointerdown as EventListener
  );

  return {
    overlay,
    underlay,
    result,
    cleanup: () => {
      scope.stop();
      underlay.remove();
    },
  };
}

function dispatchOutsideInteract(): void {
  if (typeof PointerEvent !== "undefined") {
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 })
    );
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  } else {
    document.body.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 })
    );
    document.body.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 })
    );
  }
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useOverlay", () => {
  it("closes when interacting outside if dismissable", () => {
    const onClose = vi.fn();
    const { cleanup } = setupOverlay({
      isDismissable: true,
      onClose,
    });

    dispatchOutsideInteract();

    expect(onClose).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("does not close when not dismissable", () => {
    const onClose = vi.fn();
    const { cleanup } = setupOverlay({
      isDismissable: false,
      onClose,
    });

    dispatchOutsideInteract();

    expect(onClose).not.toHaveBeenCalled();

    cleanup();
  });

  it("respects shouldCloseOnInteractOutside filter", () => {
    const onClose = vi.fn();
    const { cleanup } = setupOverlay({
      isDismissable: true,
      onClose,
      shouldCloseOnInteractOutside: (element) => element === document.body,
    });

    dispatchOutsideInteract();

    expect(onClose).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("only closes top-most overlay", () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();

    const first = setupOverlay({
      isDismissable: true,
      onClose: onCloseFirst,
    });

    const second = setupOverlay({
      isDismissable: true,
      onClose: onCloseSecond,
    });

    dispatchOutsideInteract();

    expect(onCloseSecond).toHaveBeenCalledTimes(1);
    expect(onCloseFirst).not.toHaveBeenCalled();

    second.cleanup();

    dispatchOutsideInteract();

    expect(onCloseFirst).toHaveBeenCalledTimes(1);

    first.cleanup();
  });

  it("closes on escape even if not dismissable", () => {
    const onClose = vi.fn();
    const { overlay, cleanup } = setupOverlay({
      isDismissable: false,
      onClose,
    });

    overlay.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it("prevents underlay default pointer down when target is underlay", () => {
    const { result, cleanup } = setupOverlay();
    const preventDefault = vi.fn();
    const event = {
      target: document.createElement("div"),
      currentTarget: document.createElement("div"),
      preventDefault,
    } as unknown as PointerEvent;
    Object.defineProperty(event, "target", { value: event.currentTarget });

    (
      result.underlayProps.value.onPointerdown as (event: PointerEvent) => void
    )(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);

    cleanup();
  });
});
