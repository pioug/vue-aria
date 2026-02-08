import { readonly, ref } from "vue";

const isFocusVisibleRef = ref(true);

let initialized = false;

function onKeyDown(event: KeyboardEvent) {
  if (event.metaKey || event.altKey || event.ctrlKey) {
    return;
  }
  isFocusVisibleRef.value = true;
}

function onPointerEvent() {
  isFocusVisibleRef.value = false;
}

function ensureSetup() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("mousedown", onPointerEvent, true);
  window.addEventListener("pointerdown", onPointerEvent, true);
  window.addEventListener("touchstart", onPointerEvent, true);
  initialized = true;
}

export function useFocusVisible() {
  ensureSetup();
  return readonly(isFocusVisibleRef);
}
