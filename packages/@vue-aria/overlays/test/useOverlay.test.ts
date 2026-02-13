import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useOverlay } from "../src/useOverlay";

describe("useOverlay", () => {
  it("hides overlay when clicking outside if dismissable", () => {
    const onClose = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    let overlayProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ overlayProps } = useOverlay({ isOpen: true, onClose, isDismissable: true }, ref));
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(typeof overlayProps.onKeydown).toBe("function");

    scope.stop();
    ref.current.remove();
  });

  it("does not hide overlay when not dismissable", () => {
    const onClose = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useOverlay({ isOpen: true, onClose, isDismissable: false }, ref);
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
    ref.current.remove();
  });

  it("only hides the top-most overlay", () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();

    const first = { current: document.createElement("div") };
    const second = { current: document.createElement("div") };
    document.body.append(first.current, second.current);

    const scope = effectScope();
    scope.run(() => {
      useOverlay({ isOpen: true, onClose: onCloseFirst, isDismissable: true }, first);
      useOverlay({ isOpen: true, onClose: onCloseSecond, isDismissable: true }, second);
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));

    expect(onCloseFirst).toHaveBeenCalledTimes(0);
    expect(onCloseSecond).toHaveBeenCalledTimes(1);

    scope.stop();
    first.current.remove();
    second.current.remove();
  });
});
