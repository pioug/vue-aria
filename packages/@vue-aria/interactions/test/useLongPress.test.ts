import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { useLongPress, type UseLongPressOptions } from "../src/useLongPress";
import { usePress, type UsePressOptions } from "../src/usePress";
import { mergeProps } from "@vue-aria/utils";

type HookProps = Record<string, unknown>;

function createPointerEvent(
  type: string,
  pointerType: "touch" | "mouse" | "pen",
  button = 0
): PointerEvent {
  const event = new PointerEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  Object.defineProperty(event, "button", { value: button });
  return event;
}

function bindHandlers(element: HTMLElement, props: HookProps): () => void {
  const cleanup: Array<() => void> = [];

  for (const [name, handler] of Object.entries(props)) {
    if (!name.startsWith("on") || typeof handler !== "function") {
      continue;
    }

    const eventName = name.slice(2).toLowerCase();
    const listener = handler as EventListener;
    element.addEventListener(eventName, listener);
    cleanup.push(() => {
      element.removeEventListener(eventName, listener);
    });
  }

  return () => {
    for (const remove of cleanup) {
      remove();
    }
  };
}

function createExample(options: {
  longPressOptions: UseLongPressOptions;
  pressOptions?: UsePressOptions;
}): {
  element: HTMLElement;
  props: HookProps;
  cleanup: () => void;
} {
  const scope = effectScope();
  let props: HookProps = {};

  scope.run(() => {
    const { longPressProps } = useLongPress(options.longPressOptions);
    if (!options.pressOptions) {
      props = longPressProps;
      return;
    }

    const { pressProps } = usePress(options.pressOptions);
    props = mergeProps(longPressProps, pressProps);
  });

  const element = document.createElement("div");
  document.body.appendChild(element);
  const unbind = bindHandlers(element, props);

  return {
    element,
    props,
    cleanup: () => {
      unbind();
      element.remove();
      scope.stop();
    },
  };
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("performs a long press after threshold", () => {
    const events: string[] = [];
    const example = createExample({
      longPressOptions: {
        onLongPressStart: () => events.push("start"),
        onLongPressEnd: () => events.push("end"),
        onLongPress: () => events.push("longpress"),
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(400);
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(200);
    expect(events).toEqual(["start", "end", "longpress"]);

    example.element.dispatchEvent(createPointerEvent("pointerup", "touch"));
    expect(events).toEqual(["start", "end", "longpress"]);
    example.cleanup();
  });

  it("cancels when pointer ends before threshold", () => {
    const events: string[] = [];
    const example = createExample({
      longPressOptions: {
        onLongPressStart: () => events.push("start"),
        onLongPressEnd: () => events.push("end"),
        onLongPress: () => events.push("longpress"),
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    vi.advanceTimersByTime(200);
    example.element.dispatchEvent(createPointerEvent("pointerup", "touch"));
    vi.advanceTimersByTime(800);

    expect(events).toEqual(["start", "end"]);
    example.cleanup();
  });

  it("allows changing the threshold", () => {
    const events: string[] = [];
    const example = createExample({
      longPressOptions: {
        threshold: 800,
        onLongPressStart: () => events.push("start"),
        onLongPressEnd: () => events.push("end"),
        onLongPress: () => events.push("longpress"),
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    vi.advanceTimersByTime(600);
    expect(events).toEqual(["start"]);

    vi.advanceTimersByTime(300);
    expect(events).toEqual(["start", "end", "longpress"]);
    example.cleanup();
  });

  it("ignores non mouse/touch pointer types", () => {
    const onLongPressStart = vi.fn();
    const onLongPress = vi.fn();
    const example = createExample({
      longPressOptions: {
        onLongPressStart,
        onLongPress,
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "pen"));
    vi.advanceTimersByTime(1000);

    expect(onLongPressStart).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    example.cleanup();
  });

  it("supports accessibilityDescription when long press is enabled", () => {
    const example = createExample({
      longPressOptions: {
        accessibilityDescription: "Long press to open menu",
        onLongPress: () => {},
      },
    });

    const descriptionId = example.props["aria-describedby"] as string | undefined;
    expect(descriptionId).toBeDefined();
    const descriptionNode = descriptionId
      ? document.getElementById(descriptionId)
      : null;
    expect(descriptionNode?.textContent).toBe("Long press to open menu");
    example.cleanup();
  });

  it("does not expose accessibilityDescription when disabled", () => {
    const example = createExample({
      longPressOptions: {
        isDisabled: true,
        accessibilityDescription: "Long press to open menu",
        onLongPress: () => {},
      },
    });

    expect(example.props["aria-describedby"]).toBeUndefined();
    example.cleanup();
  });

  it("does not expose accessibilityDescription without onLongPress", () => {
    const example = createExample({
      longPressOptions: {
        accessibilityDescription: "Long press to open menu",
      },
    });

    expect(example.props["aria-describedby"]).toBeUndefined();
    example.cleanup();
  });

  it("prevents touch context menu after threshold", () => {
    const example = createExample({
      longPressOptions: {
        onLongPress: () => {},
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    vi.advanceTimersByTime(600);
    const defaultActionHappened = example.element.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(defaultActionHappened).toBe(false);
    example.element.dispatchEvent(createPointerEvent("pointerup", "touch"));
    example.cleanup();
  });

  it("does not fire long press events for keyboard interactions", () => {
    const onLongPressStart = vi.fn();
    const onLongPressEnd = vi.fn();
    const onLongPress = vi.fn();
    const example = createExample({
      longPressOptions: {
        onLongPressStart,
        onLongPressEnd,
        onLongPress,
      },
    });

    example.element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    vi.advanceTimersByTime(1000);
    example.element.dispatchEvent(
      new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true })
    );

    expect(onLongPressStart).not.toHaveBeenCalled();
    expect(onLongPressEnd).not.toHaveBeenCalled();
    expect(onLongPress).not.toHaveBeenCalled();
    example.cleanup();
  });

  it("cancels merged press on completed long press", () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPress = vi.fn();
    const onLongPress = vi.fn();
    const example = createExample({
      longPressOptions: {
        onLongPressStart: () => {},
        onLongPressEnd: () => {},
        onLongPress,
      },
      pressOptions: {
        onPressStart,
        onPressEnd,
        onPress,
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    vi.advanceTimersByTime(600);
    example.element.dispatchEvent(createPointerEvent("pointerup", "touch"));

    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(onLongPress).toHaveBeenCalledTimes(1);
    example.cleanup();
  });

  it("does not cancel merged press if released before threshold", () => {
    const onPress = vi.fn();
    const onLongPress = vi.fn();
    const example = createExample({
      longPressOptions: {
        onLongPress,
      },
      pressOptions: {
        onPress,
      },
    });

    example.element.dispatchEvent(createPointerEvent("pointerdown", "touch"));
    vi.advanceTimersByTime(300);
    example.element.dispatchEvent(createPointerEvent("pointerup", "touch"));
    vi.advanceTimersByTime(500);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
    example.cleanup();
  });
});
