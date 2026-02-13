import { isMac } from "./platform";

interface EventLike {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export function isCtrlKeyPressed(e: EventLike): boolean {
  if (isMac()) {
    return e.metaKey;
  }

  return e.ctrlKey;
}

const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

export function willOpenKeyboard(target: Element): boolean {
  return Boolean(
    (target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type))
    || target instanceof HTMLTextAreaElement
    || (target instanceof HTMLElement && target.isContentEditable)
  );
}
