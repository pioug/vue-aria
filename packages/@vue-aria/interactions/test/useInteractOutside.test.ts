import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useInteractOutside } from "../src/useInteractOutside";

describe("useInteractOutside", () => {
  it("fires interact outside for outside mouse down/up", () => {
    const onInteractOutside = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({ ref, onInteractOutside });
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    expect(onInteractOutside).toHaveBeenCalledTimes(1);

    scope.stop();
    ref.current.remove();
  });

  it("does not fire when interaction starts inside", () => {
    const onInteractOutside = vi.fn();
    const ref = { current: document.createElement("div") };
    const inner = document.createElement("button");
    ref.current.appendChild(inner);
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({ ref, onInteractOutside });
    });

    inner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    inner.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    expect(onInteractOutside).not.toHaveBeenCalled();

    scope.stop();
    ref.current.remove();
  });

  it("only responds to left mouse button", () => {
    const onInteractOutside = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({ ref, onInteractOutside });
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 1 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 1 }));

    expect(onInteractOutside).not.toHaveBeenCalled();

    scope.stop();
    ref.current.remove();
  });

  it("does nothing when disabled", () => {
    const onInteractOutside = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({ ref, onInteractOutside, isDisabled: true });
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    expect(onInteractOutside).not.toHaveBeenCalled();

    scope.stop();
    ref.current.remove();
  });

  it("fires interact outside start before interact outside", () => {
    const onInteractOutside = vi.fn();
    const onInteractOutsideStart = vi.fn();
    const ref = { current: document.createElement("div") };
    document.body.appendChild(ref.current);

    const scope = effectScope();
    scope.run(() => {
      useInteractOutside({ ref, onInteractOutside, onInteractOutsideStart });
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));

    expect(onInteractOutsideStart).toHaveBeenCalledTimes(1);
    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    expect(onInteractOutsideStart.mock.invocationCallOrder[0]).toBeLessThan(
      onInteractOutside.mock.invocationCallOrder[0]
    );

    scope.stop();
    ref.current.remove();
  });
});
