import { getOwnerDocument, getOwnerWindow, isMac, isVirtualClick, openLink } from "@vue-aria/utils";
import { useIsSSR } from "@vue-aria/ssr";
import { onScopeDispose, ref } from "vue";
import { ignoreFocusEvent } from "./utils";

export type PointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";
export type Modality = "keyboard" | "pointer" | "virtual";
type HandlerEvent = PointerEvent | MouseEvent | KeyboardEvent | FocusEvent | null;
type Handler = (modality: Modality, e: HandlerEvent) => void;

export type FocusVisibleHandler = (isFocusVisible: boolean) => void;
export interface FocusVisibleProps {
  isTextInput?: boolean;
  autoFocus?: boolean;
}

export interface FocusVisibleResult {
  isFocusVisible: boolean;
}

let currentModality: Modality | null = null;
let currentPointerType: PointerType = "keyboard";
export const changeHandlers = new Set<Handler>();
interface GlobalListenerData {
  focus: typeof HTMLElement.prototype.focus;
}

export const hasSetupGlobalListeners: Map<Window, GlobalListenerData> = new Map();
let hasEventBeforeFocus = false;
let hasBlurredWindowRecently = false;

const FOCUS_VISIBLE_INPUT_KEYS: Record<string, boolean> = {
  Tab: true,
  Escape: true,
};

function triggerChangeHandlers(modality: Modality, e: HandlerEvent) {
  for (const handler of changeHandlers) {
    handler(modality, e);
  }
}

function isValidKey(e: KeyboardEvent) {
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  );
}

function handleKeyboardEvent(e: KeyboardEvent) {
  hasEventBeforeFocus = true;
  if (!(openLink as { isOpening?: boolean }).isOpening && isValidKey(e)) {
    currentModality = "keyboard";
    currentPointerType = "keyboard";
    triggerChangeHandlers("keyboard", e);
  }
}

function handlePointerEvent(e: PointerEvent | MouseEvent) {
  currentModality = "pointer";
  currentPointerType = "pointerType" in e ? (e.pointerType as PointerType) : "mouse";

  if (e.type === "mousedown" || e.type === "pointerdown") {
    hasEventBeforeFocus = true;
    triggerChangeHandlers("pointer", e);
  }
}

function handleClickEvent(e: MouseEvent) {
  if (!(openLink as { isOpening?: boolean }).isOpening && isVirtualClick(e)) {
    hasEventBeforeFocus = true;
    currentModality = "virtual";
    currentPointerType = "virtual";
    triggerChangeHandlers("virtual", e);
  }
}

function handleFocusEvent(e: FocusEvent) {
  if (e.target === window || e.target === document || ignoreFocusEvent || !e.isTrusted) {
    return;
  }

  if (!hasEventBeforeFocus && !hasBlurredWindowRecently) {
    currentModality = "virtual";
    currentPointerType = "virtual";
    triggerChangeHandlers("virtual", e);
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = false;
}

function handleWindowBlur() {
  if (ignoreFocusEvent) {
    return;
  }

  hasEventBeforeFocus = false;
  hasBlurredWindowRecently = true;
}

function setupGlobalFocusEvents(element?: HTMLElement | null) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const win = getOwnerWindow(element);
  if (hasSetupGlobalListeners.get(win)) {
    return;
  }

  const doc = getOwnerDocument(element);
  const focus = win.HTMLElement.prototype.focus;

  win.HTMLElement.prototype.focus = function focusPatched(...args: [options?: FocusOptions]) {
    hasEventBeforeFocus = true;
    focus.apply(this, args);
  };

  doc.addEventListener("keydown", handleKeyboardEvent, true);
  doc.addEventListener("keyup", handleKeyboardEvent, true);
  doc.addEventListener("click", handleClickEvent, true);

  win.addEventListener("focus", handleFocusEvent, true);
  win.addEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    doc.addEventListener("pointerdown", handlePointerEvent, true);
    doc.addEventListener("pointermove", handlePointerEvent, true);
    doc.addEventListener("pointerup", handlePointerEvent, true);
  } else {
    doc.addEventListener("mousedown", handlePointerEvent, true);
    doc.addEventListener("mousemove", handlePointerEvent, true);
    doc.addEventListener("mouseup", handlePointerEvent, true);
  }

  win.addEventListener(
    "beforeunload",
    () => {
      tearDownWindowFocusTracking(element);
    },
    { once: true }
  );

  hasSetupGlobalListeners.set(win, { focus });
}

const tearDownWindowFocusTracking = (element?: HTMLElement | null, loadListener?: () => void) => {
  const win = getOwnerWindow(element);
  const doc = getOwnerDocument(element);

  if (loadListener) {
    doc.removeEventListener("DOMContentLoaded", loadListener);
  }

  if (!hasSetupGlobalListeners.has(win)) {
    return;
  }

  win.HTMLElement.prototype.focus = hasSetupGlobalListeners.get(win)!.focus;

  doc.removeEventListener("keydown", handleKeyboardEvent, true);
  doc.removeEventListener("keyup", handleKeyboardEvent, true);
  doc.removeEventListener("click", handleClickEvent, true);

  win.removeEventListener("focus", handleFocusEvent, true);
  win.removeEventListener("blur", handleWindowBlur, false);

  if (typeof PointerEvent !== "undefined") {
    doc.removeEventListener("pointerdown", handlePointerEvent, true);
    doc.removeEventListener("pointermove", handlePointerEvent, true);
    doc.removeEventListener("pointerup", handlePointerEvent, true);
  } else {
    doc.removeEventListener("mousedown", handlePointerEvent, true);
    doc.removeEventListener("mousemove", handlePointerEvent, true);
    doc.removeEventListener("mouseup", handlePointerEvent, true);
  }

  hasSetupGlobalListeners.delete(win);
};

export function addWindowFocusTracking(element?: HTMLElement | null): () => void {
  const doc = getOwnerDocument(element);
  let loadListener: (() => void) | undefined;

  if (doc.readyState !== "loading") {
    setupGlobalFocusEvents(element);
  } else {
    loadListener = () => {
      setupGlobalFocusEvents(element);
    };

    doc.addEventListener("DOMContentLoaded", loadListener);
  }

  return () => tearDownWindowFocusTracking(element, loadListener);
}

if (typeof document !== "undefined") {
  addWindowFocusTracking();
}

export function isFocusVisible(): boolean {
  return currentModality !== "pointer";
}

export function getInteractionModality(): Modality | null {
  return currentModality;
}

export function setInteractionModality(modality: Modality): void {
  currentModality = modality;
  currentPointerType = modality === "pointer" ? "mouse" : modality;
  triggerChangeHandlers(modality, null);
}

export function getPointerType(): PointerType {
  return currentPointerType;
}

export function useInteractionModality(): Modality | null {
  setupGlobalFocusEvents();
  const modality = ref<Modality | null>(currentModality);

  const handler = () => {
    modality.value = currentModality;
  };

  changeHandlers.add(handler);
  onScopeDispose(() => {
    changeHandlers.delete(handler);
  });

  return useIsSSR() ? null : modality.value;
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

function isKeyboardFocusEvent(isTextInput: boolean, modality: Modality, e: HandlerEvent) {
  const doc = getOwnerDocument(e?.target as Element);
  const activeElement = doc.activeElement as HTMLElement | null;

  isTextInput =
    isTextInput ||
    !!(
      activeElement instanceof HTMLInputElement
        ? !nonTextInputTypes.has(activeElement.type)
        : activeElement instanceof HTMLTextAreaElement ||
          (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    );

  return !(
    isTextInput &&
    modality === "keyboard" &&
    e instanceof KeyboardEvent &&
    !FOCUS_VISIBLE_INPUT_KEYS[e.key]
  );
}

export function useFocusVisible(props: FocusVisibleProps = {}): FocusVisibleResult {
  const { isTextInput, autoFocus } = props;
  const state = ref(autoFocus || isFocusVisible());

  useFocusVisibleListener(
    (nextFocusVisible) => {
      state.value = nextFocusVisible;
    },
    [],
    { isTextInput }
  );

  return { isFocusVisible: state.value };
}

export function useFocusVisibleListener(
  fn: FocusVisibleHandler,
  _deps: ReadonlyArray<unknown>,
  opts?: { enabled?: boolean; isTextInput?: boolean }
): void {
  setupGlobalFocusEvents();

  if (opts?.enabled === false) {
    return;
  }

  const handler = (modality: Modality, e: HandlerEvent) => {
    if (!isKeyboardFocusEvent(Boolean(opts?.isTextInput), modality, e)) {
      return;
    }

    fn(isFocusVisible());
  };

  changeHandlers.add(handler);
  onScopeDispose(() => {
    changeHandlers.delete(handler);
  });
}
