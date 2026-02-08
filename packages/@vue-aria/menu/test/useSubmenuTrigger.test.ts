import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import {
  useMenuTriggerState,
  useSubmenuTrigger,
  useSubmenuTriggerState,
} from "../src";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

interface SubmenuSetup {
  cleanup: () => void;
  submenuState: ReturnType<typeof useSubmenuTriggerState>;
  submenuTriggerProps: Record<string, unknown>;
  submenuProps: Record<string, unknown>;
  popoverProps: Record<string, unknown>;
  parentMenu: HTMLElement;
  trigger: HTMLElement;
  submenu: HTMLElement;
}

function setupSubmenu(options: {
  direction?: "ltr" | "rtl";
  delay?: number;
  shouldUseVirtualFocus?: boolean;
} = {}): SubmenuSetup {
  const parentMenu = document.createElement("ul");
  const trigger = document.createElement("li");
  const sibling = document.createElement("li");
  const submenu = document.createElement("ul");

  trigger.tabIndex = 0;
  sibling.tabIndex = 0;
  submenu.tabIndex = -1;

  parentMenu.append(trigger, sibling);
  document.body.append(parentMenu, submenu);

  let submenuState!: ReturnType<typeof useSubmenuTriggerState>;
  let submenuTriggerProps!: Record<string, unknown>;
  let submenuProps!: Record<string, unknown>;
  let popoverProps!: Record<string, unknown>;

  const scope = effectScope();
  scope.run(() => {
    const rootState = useMenuTriggerState({ defaultOpen: true });
    submenuState = useSubmenuTriggerState({ triggerKey: "file" }, rootState);

    const result = useSubmenuTrigger(
      {
        parentMenuRef: parentMenu,
        submenuRef: submenu,
        direction: options.direction,
        delay: options.delay,
        shouldUseVirtualFocus: options.shouldUseVirtualFocus,
      },
      submenuState,
      trigger
    );

    submenuTriggerProps = result.submenuTriggerProps.value;
    submenuProps = result.submenuProps.value;
    popoverProps = result.popoverProps.value;
  });

  return {
    cleanup: () => {
      scope.stop();
      parentMenu.remove();
      submenu.remove();
    },
    submenuState,
    submenuTriggerProps,
    submenuProps,
    popoverProps,
    parentMenu,
    trigger,
    submenu,
  };
}

describe("useSubmenuTrigger", () => {
  it("returns trigger, submenu, and popover semantics", () => {
    const {
      cleanup,
      submenuTriggerProps,
      submenuProps,
      popoverProps,
      trigger,
    } = setupSubmenu();

    expect(submenuTriggerProps["aria-controls"]).toBeUndefined();
    expect(submenuTriggerProps["aria-expanded"]).toBe("false");
    expect(submenuTriggerProps["aria-haspopup"]).toBe("menu");
    expect(submenuProps["aria-labelledby"]).toBe(submenuTriggerProps.id);
    expect(submenuProps.submenuLevel).toBe(0);
    expect(popoverProps.isNonModal).toBe(true);
    expect(
      (
        popoverProps.shouldCloseOnInteractOutside as (target: Element) => boolean
      )(trigger)
    ).toBe(false);

    cleanup();
  });

  it("opens on ArrowRight and closes on ArrowLeft in ltr mode", () => {
    const { cleanup, submenuState, submenuTriggerProps } = setupSubmenu({
      direction: "ltr",
    });
    const preventDefault = vi.fn();

    (
      submenuTriggerProps.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowRight",
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(submenuState.isOpen.value).toBe(true);
    expect(submenuState.focusStrategy.value).toBe("first");

    (
      submenuTriggerProps.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowLeft",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(submenuState.isOpen.value).toBe(false);

    cleanup();
  });

  it("opens on keyboard press start and touch press", () => {
    const { cleanup, submenuState, submenuTriggerProps } = setupSubmenu();

    (
      submenuTriggerProps.onPressStart as (event: { pointerType: string }) => void
    )({
      pointerType: "keyboard",
    });

    expect(submenuState.isOpen.value).toBe(true);
    expect(submenuState.focusStrategy.value).toBe("first");

    submenuState.close();
    (
      submenuTriggerProps.onPress as (event: { pointerType: string }) => void
    )({
      pointerType: "touch",
    });

    expect(submenuState.isOpen.value).toBe(true);

    cleanup();
  });

  it("opens after hover delay", () => {
    vi.useFakeTimers();

    const { cleanup, submenuState, submenuTriggerProps } = setupSubmenu({
      delay: 50,
    });

    (
      submenuTriggerProps.onHoverChange as (isHovered: boolean) => void
    )(true);
    expect(submenuState.isOpen.value).toBe(false);

    vi.advanceTimersByTime(50);
    expect(submenuState.isOpen.value).toBe(true);

    cleanup();
  });

  it("closes on submenu Escape and restores trigger focus", () => {
    const { cleanup, submenuState, submenuProps, trigger, submenu } = setupSubmenu();

    const submenuItem = document.createElement("button");
    submenu.appendChild(submenuItem);

    submenuState.open();
    submenuItem.focus();

    (
      submenuProps.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "Escape",
      target: submenuItem,
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(submenuState.isOpen.value).toBe(false);
    expect(document.activeElement).toBe(trigger);

    cleanup();
  });

  it("closes when focus moves to a different item in parent menu", () => {
    const { cleanup, submenuState, parentMenu } = setupSubmenu();

    submenuState.open();
    expect(submenuState.isOpen.value).toBe(true);

    const nextItem = parentMenu.querySelectorAll("li")[1]!;
    nextItem.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

    expect(submenuState.isOpen.value).toBe(false);

    cleanup();
  });
});
