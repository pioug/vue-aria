import { changeHandlers, getInteractionModality, type Modality } from "@vue-aria/interactions";
import { nodeContains, useEffectEvent, useLayoutEffect, useResizeObserver } from "@vue-aria/utils";
import { computed, onScopeDispose, ref } from "vue";

export interface SafelyMouseToSubmenuOptions {
  menuRef: { current: Element | null };
  submenuRef: { current: Element | null };
  isOpen: boolean;
  isDisabled?: boolean;
}

const ALLOWED_INVALID_MOVEMENTS = 2;
const THROTTLE_TIME = 50;
const TIMEOUT_TIME = 1000;
const ANGLE_PADDING = Math.PI / 12;

export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions): void {
  const { menuRef, submenuRef, isOpen, isDisabled } = options;
  const prevPointerPos = ref<{ x: number; y: number } | undefined>(undefined);
  const submenuRect = ref<DOMRect | undefined>(undefined);
  const lastProcessedTime = ref(0);
  const timeout = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoCloseTimeout = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
  const submenuSide = ref<"left" | "right" | undefined>(undefined);
  const movementsTowardsSubmenuCount = ref(ALLOWED_INVALID_MOVEMENTS);
  const preventPointerEvents = ref(false);
  const modality = ref<Modality | null>(getInteractionModality());

  const handleModalityChange = (nextModality: Modality) => {
    modality.value = nextModality;
  };
  changeHandlers.add(handleModalityChange);
  onScopeDispose(() => {
    changeHandlers.delete(handleModalityChange);
  });

  const applyPointerEvents = () => {
    if (!menuRef.current) {
      return;
    }
    (menuRef.current as HTMLElement).style.pointerEvents = preventPointerEvents.value ? "none" : "";
  };

  const updateSubmenuRect = () => {
    if (submenuRef.current) {
      submenuRect.value = submenuRef.current.getBoundingClientRect();
      submenuSide.value = undefined;
    }
  };

  useResizeObserver({
    ref: computed(() => submenuRef.current) as any,
    onResize: updateSubmenuRect,
  });

  const reset = () => {
    preventPointerEvents.value = false;
    movementsTowardsSubmenuCount.value = ALLOWED_INVALID_MOVEMENTS;
    prevPointerPos.value = undefined;
    applyPointerEvents();
  };

  const onPointerDown = useEffectEvent((event: PointerEvent) => {
    if (preventPointerEvents.value) {
      event.preventDefault();
    }
  });

  useLayoutEffect(() => {
    const submenu = submenuRef.current;
    const menu = menuRef.current;

    if (isDisabled || !submenu || !isOpen || modality.value !== "pointer" || !menu) {
      reset();
      return;
    }

    submenuRect.value = submenu.getBoundingClientRect();

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastProcessedTime.value < THROTTLE_TIME) {
        return;
      }

      clearTimeout(timeout.value);
      clearTimeout(autoCloseTimeout.value);

      const { clientX: mouseX, clientY: mouseY } = event;
      if (!prevPointerPos.value) {
        prevPointerPos.value = { x: mouseX, y: mouseY };
        return;
      }

      if (!submenuRect.value) {
        return;
      }

      if (!submenuSide.value) {
        submenuSide.value = mouseX > submenuRect.value.right ? "left" : "right";
      }

      const menuRect = menu.getBoundingClientRect();
      if (
        mouseX < menuRect.left ||
        mouseX > menuRect.right ||
        mouseY < menuRect.top ||
        mouseY > menuRect.bottom
      ) {
        reset();
        return;
      }

      const prevMouseX = prevPointerPos.value.x;
      const prevMouseY = prevPointerPos.value.y;
      const toSubmenuX =
        submenuSide.value === "right" ? submenuRect.value.left - prevMouseX : prevMouseX - submenuRect.value.right;
      const angleTop = Math.atan2(prevMouseY - submenuRect.value.top, toSubmenuX) + ANGLE_PADDING;
      const angleBottom = Math.atan2(prevMouseY - submenuRect.value.bottom, toSubmenuX) - ANGLE_PADDING;
      const anglePointer = Math.atan2(
        prevMouseY - mouseY,
        submenuSide.value === "left" ? -(mouseX - prevMouseX) : mouseX - prevMouseX
      );
      const isMovingTowardsSubmenu = anglePointer < angleTop && anglePointer > angleBottom;

      movementsTowardsSubmenuCount.value = isMovingTowardsSubmenu
        ? Math.min(movementsTowardsSubmenuCount.value + 1, ALLOWED_INVALID_MOVEMENTS)
        : Math.max(movementsTowardsSubmenuCount.value - 1, 0);

      preventPointerEvents.value = movementsTowardsSubmenuCount.value >= ALLOWED_INVALID_MOVEMENTS;
      applyPointerEvents();

      lastProcessedTime.value = currentTime;
      prevPointerPos.value = { x: mouseX, y: mouseY };

      if (isMovingTowardsSubmenu) {
        timeout.value = setTimeout(() => {
          reset();
          autoCloseTimeout.value = setTimeout(() => {
            const target = document.elementFromPoint(mouseX, mouseY);
            if (target && nodeContains(menu, target)) {
              const pointerOverEvent =
                typeof PointerEvent !== "undefined"
                  ? new PointerEvent("pointerover", { bubbles: true, cancelable: true })
                  : new Event("pointerover", { bubbles: true, cancelable: true });
              target.dispatchEvent(pointerOverEvent);
            }
          }, 100);
        }, TIMEOUT_TIME);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    if (process.env.NODE_ENV !== "test") {
      window.addEventListener("pointerdown", onPointerDown, true);
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (process.env.NODE_ENV !== "test") {
        window.removeEventListener("pointerdown", onPointerDown, true);
      }
      clearTimeout(timeout.value);
      clearTimeout(autoCloseTimeout.value);
      reset();
    };
  }, [
    () => isDisabled,
    () => isOpen,
    () => menuRef.current,
    () => submenuRef.current,
    modality,
  ]);
}
