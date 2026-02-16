import { act } from "./testing";
import { UserOpts } from "./types";

export const DEFAULT_LONG_PRESS_TIME = 500;

function testPlatform(re: RegExp) {
  return typeof window !== "undefined" && window.navigator != null
    ? re.test((window.navigator.userAgentData as { platform?: string } | undefined)?.platform || window.navigator.platform)
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }

  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

const isMac = cached(function (): boolean {
  return testPlatform(/^Mac/i);
});

export function getAltKey(): "Alt" | "ControlLeft" {
  return isMac() ? "Alt" : "ControlLeft";
}

export function getMetaKey(): "MetaLeft" | "ControlLeft" {
  return isMac() ? "MetaLeft" : "ControlLeft";
}

type PointerDispatchInit = Record<string, unknown>;

function createEvent(type: string, target: Element, init: PointerDispatchInit = {}) {
  const ctor = typeof PointerEvent === "function" ? PointerEvent : MouseEvent;
  return new ctor(type, {
    bubbles: true,
    cancelable: true,
    ...init,
  });
}

function dispatch(type: string, target: Element, init: PointerDispatchInit = {}) {
  return target.dispatchEvent(createEvent(type, target, init));
}

function dispatchTouchEvent(type: string, target: Element, init: PointerDispatchInit = {}) {
  const ctor = window.TouchEvent ?? window.Event;
  return target.dispatchEvent(new ctor(type, {
    bubbles: true,
    cancelable: true,
    ...init,
  }));
}

export async function triggerLongPress(opts: {
  element: HTMLElement,
  advanceTimer: (time: number) => unknown | Promise<unknown>,
  pointerOpts?: Record<string, unknown>,
}): Promise<void> {
  let { element, advanceTimer, pointerOpts = {} } = opts;
  let pointerType = (pointerOpts.pointerType ?? "mouse") as string;
  let shouldFireCompatibilityEvents = dispatch("pointerdown", element, {pointerType, ...pointerOpts});
  let shouldFocus = true;

  if (shouldFireCompatibilityEvents) {
    if (pointerType === "touch") {
      shouldFocus = dispatchTouchEvent("touchstart", element, {
        targetTouches: [{identifier: (pointerOpts.pointerId as number), clientX: pointerOpts.clientX, clientY: pointerOpts.clientY}],
      });
    } else if (pointerType === "mouse") {
      shouldFocus = dispatch("mousedown", element, pointerOpts);
      if (shouldFocus) {
        act(() => element.focus());
      }
    }
  }

  await act(async () => {
    await Promise.resolve(advanceTimer(DEFAULT_LONG_PRESS_TIME));
  });

  dispatch("pointerup", element, {pointerType, ...pointerOpts});
  if (shouldFireCompatibilityEvents) {
    if (pointerType === "touch") {
      shouldFocus = dispatchTouchEvent("touchend", element, {
        targetTouches: [{identifier: (pointerOpts.pointerId as number), clientX: pointerOpts.clientX, clientY: pointerOpts.clientY}],
      });
      shouldFocus = dispatch("mousedown", element, pointerOpts);
      if (shouldFocus) {
        act(() => element.focus());
      }
      dispatch("mouseup", element, pointerOpts);
    } else if (pointerType === "mouse") {
      dispatch("mouseup", element, pointerOpts);
    }
  }
  dispatch("click", element, {detail: 1, ...pointerOpts});
}

export async function pressElement(
  user: { click: (element: Element) => Promise<void>; keyboard: (keys: string) => Promise<void>; pointer: (opts: {target: Element; keys: string; coords?: Record<string, unknown>}) => Promise<void> },
  element: HTMLElement,
  interactionType: UserOpts["interactionType"],
): Promise<void> {
  if (interactionType === "mouse") {
    await user.pointer({target: element, keys: "[MouseLeft]", coords: {pressure: 0.5}});
  } else if (interactionType === "keyboard") {
    act(() => element.focus());
    await user.keyboard("[Space]");
  } else {
    await user.pointer({target: element, keys: "[TouchA]"});
  }
}
