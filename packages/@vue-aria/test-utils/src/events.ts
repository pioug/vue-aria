export const DEFAULT_LONG_PRESS_TIME = 500;

type TriggerLongPressOpts = {
  element: HTMLElement;
  advanceTimer: (time: number) => unknown | Promise<unknown>;
  pointerOpts?: Record<string, unknown>;
};

function dispatchIfPossible(name: keyof HTMLElementEventMap | "pointerdown" | "pointerup" | "pointercancel", element: Element, init?: Record<string, unknown>) {
  try {
    const EventCtor = typeof PointerEvent !== "undefined" ? PointerEvent : MouseEvent;
    element.dispatchEvent(new EventCtor(name, {bubbles: true, cancelable: true, ...init} as any));
  } catch {}
}

export async function triggerLongPress(opts: TriggerLongPressOpts): Promise<void> {
  const pointerType = opts.pointerOpts?.pointerType ?? "mouse";
  dispatchIfPossible("pointerdown", opts.element, {pointerType});
  await opts.advanceTimer(DEFAULT_LONG_PRESS_TIME);
  dispatchIfPossible("pointerup", opts.element, {pointerType});
}

export async function pressElement(
  user: { click: (element: Element) => Promise<void> },
  element: HTMLElement,
  interactionType?: "mouse" | "touch" | "keyboard"
) {
  if (interactionType === "keyboard") {
    await user.click(element);
    return;
  }

  await user.click(element);
}
