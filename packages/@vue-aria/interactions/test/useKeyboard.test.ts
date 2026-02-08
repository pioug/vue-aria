import { describe, expect, it, vi } from "vitest";
import { useKeyboard } from "../src/useKeyboard";

interface KeyboardHandlers {
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
}

describe("useKeyboard", () => {
  it("handles keyboard events", () => {
    const events: string[] = [];
    const { keyboardProps } = useKeyboard({
      onKeydown: () => events.push("keydown"),
      onKeyup: () => events.push("keyup"),
    });
    const handlers = keyboardProps as KeyboardHandlers;

    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "A", bubbles: true }));
    handlers.onKeyup?.(new KeyboardEvent("keyup", { key: "A", bubbles: true }));

    expect(events).toEqual(["keydown", "keyup"]);
  });

  it("does not handle events when disabled", () => {
    const onKeydown = vi.fn();
    const onKeyup = vi.fn();
    const { keyboardProps } = useKeyboard({
      isDisabled: true,
      onKeydown,
      onKeyup,
    });
    const handlers = keyboardProps as KeyboardHandlers;

    handlers.onKeydown?.(new KeyboardEvent("keydown", { key: "A", bubbles: true }));
    handlers.onKeyup?.(new KeyboardEvent("keyup", { key: "A", bubbles: true }));

    expect(onKeydown).not.toHaveBeenCalled();
    expect(onKeyup).not.toHaveBeenCalled();
  });

  it("events do not bubble by default", () => {
    const onWrapperKeydown = vi.fn();
    const onWrapperKeyup = vi.fn();
    const onInnerKeydown = vi.fn();
    const onInnerKeyup = vi.fn();

    const wrapper = document.createElement("div");
    const inner = document.createElement("div");
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    wrapper.addEventListener("keydown", onWrapperKeydown);
    wrapper.addEventListener("keyup", onWrapperKeyup);

    const { keyboardProps } = useKeyboard({
      onKeydown: onInnerKeydown,
      onKeyup: onInnerKeyup,
    });
    const handlers = keyboardProps as KeyboardHandlers;

    inner.addEventListener("keydown", (event) => handlers.onKeydown?.(event));
    inner.addEventListener("keyup", (event) => handlers.onKeyup?.(event));

    inner.dispatchEvent(new KeyboardEvent("keydown", { key: "A", bubbles: true }));
    inner.dispatchEvent(new KeyboardEvent("keyup", { key: "A", bubbles: true }));

    expect(onInnerKeydown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyup).toHaveBeenCalledTimes(1);
    expect(onWrapperKeydown).not.toHaveBeenCalled();
    expect(onWrapperKeyup).not.toHaveBeenCalled();
  });

  it("events bubble when continuePropagation is called", () => {
    const onWrapperKeydown = vi.fn();
    const onWrapperKeyup = vi.fn();
    const onInnerKeydown = vi.fn((event: KeyboardEvent & { continuePropagation?: () => void }) =>
      event.continuePropagation?.()
    );
    const onInnerKeyup = vi.fn((event: KeyboardEvent & { continuePropagation?: () => void }) =>
      event.continuePropagation?.()
    );

    const wrapper = document.createElement("div");
    const inner = document.createElement("div");
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    wrapper.addEventListener("keydown", onWrapperKeydown);
    wrapper.addEventListener("keyup", onWrapperKeyup);

    const { keyboardProps } = useKeyboard({
      onKeydown: onInnerKeydown,
      onKeyup: onInnerKeyup,
    });
    const handlers = keyboardProps as KeyboardHandlers;

    inner.addEventListener("keydown", (event) => handlers.onKeydown?.(event));
    inner.addEventListener("keyup", (event) => handlers.onKeyup?.(event));

    inner.dispatchEvent(new KeyboardEvent("keydown", { key: "A", bubbles: true }));
    inner.dispatchEvent(new KeyboardEvent("keyup", { key: "A", bubbles: true }));

    expect(onInnerKeydown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyup).toHaveBeenCalledTimes(1);
    expect(onWrapperKeydown).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyup).toHaveBeenCalledTimes(1);
  });
});
