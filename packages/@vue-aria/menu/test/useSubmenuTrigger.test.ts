import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSubmenuTrigger } from "../src/useSubmenuTrigger";

function createState(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    isOpen: false,
    submenuLevel: 1,
    focusStrategy: null,
    open: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
    ...overrides,
  } as any;
}

function createKeyboardEvent(
  key: string,
  currentTarget: HTMLElement,
  target: HTMLElement,
  extras: Partial<Record<string, unknown>> = {}
) {
  return {
    key,
    currentTarget,
    target,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    continuePropagation: vi.fn(),
    ...extras,
  } as unknown as KeyboardEvent & { continuePropagation: () => void };
}

describe("useSubmenuTrigger", () => {
  it("opens submenu on ArrowRight in ltr", () => {
    const parent = document.createElement("ul");
    const trigger = document.createElement("li");
    const submenu = document.createElement("ul");
    parent.appendChild(trigger);
    document.body.append(parent, submenu);

    const state = createState();
    const parentMenuRef = { current: parent as HTMLElement | null };
    const submenuRef = { current: submenu as HTMLElement | null };
    const triggerRef = { current: trigger as HTMLElement | null };

    const scope = effectScope();
    let submenuTriggerProps: any = null;
    scope.run(() => {
      ({ submenuTriggerProps } = useSubmenuTrigger(
        { parentMenuRef, submenuRef },
        state,
        triggerRef
      ));
    });

    submenuTriggerProps.onKeyDown(createKeyboardEvent("ArrowRight", trigger, trigger));
    expect(state.open).toHaveBeenCalledWith("first");

    scope.stop();
    parent.remove();
    submenu.remove();
  });

  it("opens on hover after delay and closes on outside interaction", () => {
    vi.useFakeTimers();
    const parent = document.createElement("ul");
    const trigger = document.createElement("li");
    const submenu = document.createElement("ul");
    parent.appendChild(trigger);
    document.body.append(parent, submenu);

    const state = createState();
    const parentMenuRef = { current: parent as HTMLElement | null };
    const submenuRef = { current: submenu as HTMLElement | null };
    const triggerRef = { current: trigger as HTMLElement | null };

    const scope = effectScope();
    let submenuTriggerProps: any = null;
    let popoverProps: any = null;
    scope.run(() => {
      ({ submenuTriggerProps, popoverProps } = useSubmenuTrigger(
        { parentMenuRef, submenuRef, delay: 150 },
        state,
        triggerRef
      ));
    });

    submenuTriggerProps.onHoverChange(true);
    vi.advanceTimersByTime(149);
    expect(state.open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(state.open).toHaveBeenCalled();

    expect(popoverProps.shouldCloseOnInteractOutside(trigger)).toBe(false);
    expect(popoverProps.shouldCloseOnInteractOutside(document.createElement("div"))).toBe(true);

    scope.stop();
    parent.remove();
    submenu.remove();
    vi.useRealTimers();
  });

  it("closes submenu on Escape from submenu and restores focus to trigger", () => {
    const parent = document.createElement("ul");
    const trigger = document.createElement("li");
    const submenu = document.createElement("ul");
    const submenuItem = document.createElement("li");
    submenuItem.tabIndex = -1;
    submenu.appendChild(submenuItem);
    parent.appendChild(trigger);
    document.body.append(parent, submenu);

    const focusSpy = vi.spyOn(trigger, "focus");
    const state = createState({ isOpen: true });
    const parentMenuRef = { current: parent as HTMLElement | null };
    const submenuRef = { current: submenu as HTMLElement | null };
    const triggerRef = { current: trigger as HTMLElement | null };

    const scope = effectScope();
    let submenuProps: any = null;
    scope.run(() => {
      ({ submenuProps } = useSubmenuTrigger(
        { parentMenuRef, submenuRef },
        state,
        triggerRef
      ));
    });

    submenuItem.focus();
    submenuProps.onKeyDown(createKeyboardEvent("Escape", submenu, submenuItem));
    expect(state.close).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();

    scope.stop();
    parent.remove();
    submenu.remove();
  });
});
