export interface SafelyMouseToSubmenuOptions {
  menuRef: { current: Element | null };
  submenuRef: { current: Element | null };
  isOpen: boolean;
  isDisabled?: boolean;
}

import { getInteractionModality } from "@vue-aria/interactions";
import { nodeContains, useLayoutEffect, useResizeObserver } from "@vue-aria/utils";

const ALLOWED_INVALID_MOVEMENTS = 2;
const THROTTLE_TIME = 50;
const TIMEOUT_TIME = 1000;
const ANGLE_PADDING = Math.PI / 12;

export function useSafelyMouseToSubmenu(options: SafelyMouseToSubmenuOptions): void {
  const { menuRef, submenuRef, isOpen, isDisabled } = options;

  let prevPointerPos: { x: number; y: number } | undefined;
  let submenuRect: DOMRect | undefined;
  let lastProcessedTime = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let autoCloseTimeout: ReturnType<typeof setTimeout> | undefined;
  let submenuSide: "left" | "right" | undefined;
  let movementsTowardsSubmenuCount = ALLOWED_INVALID_MOVEMENTS;
  let preventPointerEvents = false;

  const applyPointerEvents = () => {
    if (!menuRef.current) {
      return;
    }

    (menuRef.current as HTMLElement).style.pointerEvents = preventPointerEvents ? "none" : "";
  };

  const submenuRefObject = {
    get value() {
      return submenuRef.current;
    },
  };

  const updateSubmenuRect = () => {
    if (submenuRef.current) {
      submenuRect = submenuRef.current.getBoundingClientRect();
      submenuSide = undefined;
    }
  };

  useResizeObserver({
    ref: submenuRefObject as any,
    onResize: updateSubmenuRect,
  });

  const reset = () => {
    preventPointerEvents = false;
    movementsTowardsSubmenuCount = ALLOWED_INVALID_MOVEMENTS;
    prevPointerPos = undefined;
    applyPointerEvents();
  };

  useLayoutEffect(() => {
    const submenu = submenuRef.current;
    const menu = menuRef.current;
    const modality = getInteractionModality();

    if (isDisabled || !submenu || !isOpen || modality !== "pointer" || !menu) {
      reset();
      return;
    }

    submenuRect = submenu.getBoundingClientRect();

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastProcessedTime < THROTTLE_TIME) {
        return;
      }

      clearTimeout(timeout);
      clearTimeout(autoCloseTimeout);

      const { clientX: mouseX, clientY: mouseY } = event;
      if (!prevPointerPos) {
        prevPointerPos = { x: mouseX, y: mouseY };
        return;
      }

      if (!submenuRect) {
        return;
      }

      if (!submenuSide) {
        submenuSide = mouseX > submenuRect.right ? "left" : "right";
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

      const prevMouseX = prevPointerPos.x;
      const prevMouseY = prevPointerPos.y;
      const toSubmenuX =
        submenuSide === "right" ? submenuRect.left - prevMouseX : prevMouseX - submenuRect.right;
      const angleTop = Math.atan2(prevMouseY - submenuRect.top, toSubmenuX) + ANGLE_PADDING;
      const angleBottom = Math.atan2(prevMouseY - submenuRect.bottom, toSubmenuX) - ANGLE_PADDING;
      const anglePointer = Math.atan2(
        prevMouseY - mouseY,
        submenuSide === "left" ? -(mouseX - prevMouseX) : mouseX - prevMouseX
      );
      const isMovingTowardsSubmenu = anglePointer < angleTop && anglePointer > angleBottom;

      movementsTowardsSubmenuCount = isMovingTowardsSubmenu
        ? Math.min(movementsTowardsSubmenuCount + 1, ALLOWED_INVALID_MOVEMENTS)
        : Math.max(movementsTowardsSubmenuCount - 1, 0);

      preventPointerEvents = movementsTowardsSubmenuCount >= ALLOWED_INVALID_MOVEMENTS;
      applyPointerEvents();

      lastProcessedTime = currentTime;
      prevPointerPos = { x: mouseX, y: mouseY };

      if (isMovingTowardsSubmenu) {
        timeout = setTimeout(() => {
          reset();
          autoCloseTimeout = setTimeout(() => {
            const target = document.elementFromPoint(mouseX, mouseY);
            if (target && nodeContains(menu, target)) {
              target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, cancelable: true }));
            }
          }, 100);
        }, TIMEOUT_TIME);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (preventPointerEvents) {
        event.preventDefault();
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
      clearTimeout(timeout);
      clearTimeout(autoCloseTimeout);
      reset();
    };
  }, [
    () => isDisabled,
    () => isOpen,
    () => menuRef.current,
    () => submenuRef.current,
  ]);
}
