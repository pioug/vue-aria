import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useOverlayTriggerState } from "@vue-aria/overlays-state";
import { useModalOverlay } from "../src";

interface ModalOverlaySetup {
  cleanup: () => void;
  onOpenChange: ReturnType<typeof vi.fn>;
}

function setupModalOverlay(options: {
  shouldCloseOnInteractOutside: (element: Element) => boolean;
}): ModalOverlaySetup {
  const underlay = document.createElement("div");
  const overlay = document.createElement("div");
  underlay.appendChild(overlay);
  document.body.appendChild(underlay);

  const onOpenChange = vi.fn();

  const scope = effectScope();
  scope.run(() => {
    const state = useOverlayTriggerState({
      isOpen: true,
      onOpenChange,
    });

    const { modalProps, underlayProps } = useModalOverlay(
      {
        isDismissable: true,
        shouldCloseOnInteractOutside: options.shouldCloseOnInteractOutside,
      },
      state,
      overlay
    );

    overlay.addEventListener(
      "keydown",
      modalProps.value.onKeydown as EventListener
    );

    underlay.addEventListener(
      "pointerdown",
      underlayProps.value.onPointerdown as EventListener
    );
  });

  return {
    cleanup: () => {
      scope.stop();
      underlay.remove();
    },
    onOpenChange,
  };
}

function dispatchPointerOutside(): void {
  document.body.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerId: 1,
    })
  );
  document.body.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      button: 0,
      pointerId: 1,
    })
  );
  document.body.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true })
  );
}

function dispatchMouseOutside(): void {
  document.body.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
  );
  document.body.dispatchEvent(
    new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
  );
  document.body.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true })
  );
}

function dispatchTouchOutside(): void {
  const touchStart = new Event("touchstart", {
    bubbles: true,
    cancelable: true,
  });
  const touchEnd = new Event("touchend", {
    bubbles: true,
    cancelable: true,
  });

  document.body.dispatchEvent(touchStart as TouchEvent);
  document.body.dispatchEvent(touchEnd as TouchEvent);
  document.body.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true })
  );
}

function withPointerEventsDisabled(run: () => void): void {
  const originalPointerEvent = (globalThis as { PointerEvent?: unknown }).PointerEvent;
  Object.defineProperty(globalThis, "PointerEvent", {
    configurable: true,
    value: undefined,
  });

  try {
    run();
  } finally {
    Object.defineProperty(globalThis, "PointerEvent", {
      configurable: true,
      value: originalPointerEvent,
    });
  }
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useModalOverlay", () => {
  it("closes on outside pointer interactions when predicate allows", () => {
    const { onOpenChange, cleanup } = setupModalOverlay({
      shouldCloseOnInteractOutside: (target) => target === document.body,
    });

    dispatchPointerOutside();

    expect(onOpenChange).toHaveBeenCalledWith(false);

    cleanup();
  });

  it("does not close on outside pointer interactions when predicate blocks", () => {
    const { onOpenChange, cleanup } = setupModalOverlay({
      shouldCloseOnInteractOutside: (target) => target !== document.body,
    });

    dispatchPointerOutside();

    expect(onOpenChange).not.toHaveBeenCalled();

    cleanup();
  });

  it("closes on outside mouse interactions when predicate allows", () => {
    withPointerEventsDisabled(() => {
      const { onOpenChange, cleanup } = setupModalOverlay({
        shouldCloseOnInteractOutside: (target) => target === document.body,
      });

      dispatchMouseOutside();

      expect(onOpenChange).toHaveBeenCalledWith(false);

      cleanup();
    });
  });

  it("does not close on outside mouse interactions when predicate blocks", () => {
    withPointerEventsDisabled(() => {
      const { onOpenChange, cleanup } = setupModalOverlay({
        shouldCloseOnInteractOutside: (target) => target !== document.body,
      });

      dispatchMouseOutside();

      expect(onOpenChange).not.toHaveBeenCalled();

      cleanup();
    });
  });

  it("closes on outside touch interactions when predicate allows", () => {
    withPointerEventsDisabled(() => {
      const { onOpenChange, cleanup } = setupModalOverlay({
        shouldCloseOnInteractOutside: (target) => target === document.body,
      });

      dispatchTouchOutside();

      expect(onOpenChange).toHaveBeenCalledWith(false);

      cleanup();
    });
  });

  it("does not close on outside touch interactions when predicate blocks", () => {
    withPointerEventsDisabled(() => {
      const { onOpenChange, cleanup } = setupModalOverlay({
        shouldCloseOnInteractOutside: (target) => target !== document.body,
      });

      dispatchTouchOutside();

      expect(onOpenChange).not.toHaveBeenCalled();

      cleanup();
    });
  });

  it("contains focus with Tab and Shift+Tab inside the overlay", () => {
    const previouslyFocused = document.createElement("button");
    previouslyFocused.textContent = "outside";
    document.body.appendChild(previouslyFocused);
    previouslyFocused.focus();

    const underlay = document.createElement("div");
    const overlay = document.createElement("div");
    const first = document.createElement("button");
    const last = document.createElement("button");
    first.textContent = "first";
    last.textContent = "last";
    overlay.append(first, last);
    underlay.appendChild(overlay);
    document.body.appendChild(underlay);

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({
        isOpen: true,
      });

      useModalOverlay(
        {
          isDismissable: true,
        },
        state,
        overlay
      );
    });

    expect(document.activeElement).toBe(first);

    last.focus();
    last.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      })
    );
    expect(document.activeElement).toBe(first);

    first.focus();
    first.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      })
    );
    expect(document.activeElement).toBe(last);

    scope.stop();
    underlay.remove();
    previouslyFocused.remove();
  });

  it("restores focus to the previously focused element on cleanup", () => {
    const previouslyFocused = document.createElement("button");
    previouslyFocused.textContent = "outside";
    document.body.appendChild(previouslyFocused);
    previouslyFocused.focus();

    const underlay = document.createElement("div");
    const overlay = document.createElement("div");
    const first = document.createElement("button");
    first.textContent = "first";
    overlay.appendChild(first);
    underlay.appendChild(overlay);
    document.body.appendChild(underlay);

    const scope = effectScope();
    scope.run(() => {
      const state = useOverlayTriggerState({
        isOpen: true,
      });

      useModalOverlay(
        {
          isDismissable: true,
        },
        state,
        overlay
      );
    });

    expect(document.activeElement).toBe(first);

    scope.stop();

    expect(document.activeElement).toBe(previouslyFocused);

    underlay.remove();
    previouslyFocused.remove();
  });
});
