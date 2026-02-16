import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
const { useLongPressMock, longPressProps } = vi.hoisted(() => {
  const longPressProps = {
    onPressStart: vi.fn(),
    onPressEnd: vi.fn(),
  };

  return {
    useLongPressMock: vi.fn(() => ({
      longPressProps,
    })),
    longPressProps,
  };
});

vi.mock("@vue-aria/interactions", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/interactions")>("@vue-aria/interactions");
  return {
    ...actual,
    useLongPress: useLongPressMock,
  };
});

import { useMenuTrigger } from "../src/useMenuTrigger";

function createState() {
  return {
    isOpen: false,
    focusStrategy: null as "first" | "last" | null,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
  };
}

function createKeyEvent(key: string, options: { altKey?: boolean; defaultPrevented?: boolean } = {}) {
  return {
    key,
    altKey: options.altKey ?? false,
    defaultPrevented: options.defaultPrevented ?? false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as KeyboardEvent;
}

describe("useMenuTrigger", () => {
  beforeEach(() => {
    useLongPressMock.mockClear();
    longPressProps.onPressStart.mockClear();
    longPressProps.onPressEnd.mockClear();
  });

  it("returns default aria props when menu is closed", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    let menuProps: any = {};
    scope.run(() => {
      ({ menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref));
    });

    expect(menuTriggerProps["aria-controls"]).toBeFalsy();
    expect(menuTriggerProps["aria-expanded"]).toBeFalsy();
    expect(menuTriggerProps["aria-haspopup"]).toBeTruthy();
    expect(menuProps["aria-labelledby"]).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
    scope.stop();
  });

  it("returns expanded aria props when menu is open", () => {
    const state = createState();
    state.isOpen = true;
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    let menuProps: any = {};
    scope.run(() => {
      ({ menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref));
    });

    expect(menuTriggerProps["aria-controls"]).toBe(menuProps.id);
    expect(menuTriggerProps["aria-expanded"]).toBe(true);
    expect(menuProps["aria-labelledby"]).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
    scope.stop();
  });

  it("toggles first/last focus strategy on arrow keys", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({}, state, ref));
    });
    const onKeyDown = (menuTriggerProps.onKeyDown ?? menuTriggerProps.onKeydown) as
      | ((event: KeyboardEvent) => void)
      | undefined;

    onKeyDown?.(createKeyEvent("ArrowDown"));
    onKeyDown?.(createKeyEvent("ArrowUp"));

    expect(state.toggle).toHaveBeenNthCalledWith(1, "first");
    expect(state.toggle).toHaveBeenNthCalledWith(2, "last");
    scope.stop();
  });

  it("gates longPress trigger keyboard handling unless alt is pressed", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ trigger: "longPress" }, state, ref));
    });
    const onKeyDown = (menuTriggerProps.onKeyDown ?? menuTriggerProps.onKeydown) as
      | ((event: KeyboardEvent) => void)
      | undefined;

    onKeyDown?.(createKeyEvent("Enter"));
    onKeyDown?.(createKeyEvent("ArrowDown"));
    onKeyDown?.(createKeyEvent("ArrowDown", { altKey: true }));

    expect(state.toggle).toHaveBeenCalledTimes(1);
    expect(state.toggle).toHaveBeenCalledWith("first");
    scope.stop();
  });

  it("wires long-press callbacks through useLongPress with accessibility description", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ trigger: "longPress" }, state, ref));
    });

    expect(menuTriggerProps.onPressStart).toBe(longPressProps.onPressStart);
    const longPressOptions = (useLongPressMock as any).mock.calls.at(-1)?.[0] as
      | {
          isDisabled: boolean;
          accessibilityDescription: string;
          onLongPressStart?: () => void;
          onLongPress?: () => void;
        }
      | undefined;
    expect(longPressOptions?.isDisabled).toBe(false);
    expect(longPressOptions?.accessibilityDescription).toBe(
      "Long press or press Alt + ArrowDown to open menu"
    );

    longPressOptions?.onLongPressStart?.();
    expect(state.close).toHaveBeenCalledTimes(1);
    longPressOptions?.onLongPress?.();
    expect(state.open).toHaveBeenCalledWith("first");

    scope.stop();
  });

  it("disables long-press behavior when menu trigger is disabled", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    scope.run(() => {
      useMenuTrigger({ trigger: "longPress", isDisabled: true }, state, ref);
    });

    const longPressOptions = (useLongPressMock as any).mock.calls.at(-1)?.[0] as
      | { isDisabled: boolean }
      | undefined;
    expect(longPressOptions?.isDisabled).toBe(true);
    scope.stop();
  });

  it("wires trigger and menu props", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    let menuProps: any = {};
    scope.run(() => {
      ({ menuTriggerProps, menuProps } = useMenuTrigger({ type: "menu" }, state, ref));
    });

    expect(typeof menuTriggerProps.id).toBe("string");
    expect(menuTriggerProps["aria-haspopup"]).toBe(true);
    expect(menuTriggerProps.onPress).toBeTypeOf("function");
    expect(menuProps["aria-labelledby"]).toBe(menuTriggerProps.id);
    expect(menuProps.onClose).toBe(state.close);
    expect(menuProps.autoFocus).toBe(true);
    scope.stop();
  });

  it("does not toggle on Enter when disabled or already defaultPrevented", () => {
    const state = createState();
    const ref = { current: document.createElement("button") as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ isDisabled: true }, state, ref));
    });
    const onKeyDown = (menuTriggerProps.onKeyDown ?? menuTriggerProps.onKeydown) as
      | ((event: KeyboardEvent) => void)
      | undefined;
    onKeyDown?.(createKeyEvent("Enter"));
    scope.stop();
    expect(state.toggle).not.toHaveBeenCalled();

    const state2 = createState();
    const scope2 = effectScope();
    let menuTriggerProps2: Record<string, unknown> = {};
    scope2.run(() => {
      ({ menuTriggerProps: menuTriggerProps2 } = useMenuTrigger({}, state2, ref));
    });
    const onKeyDown2 = (menuTriggerProps2.onKeyDown ?? menuTriggerProps2.onKeydown) as
      | ((event: KeyboardEvent) => void)
      | undefined;
    onKeyDown2?.(createKeyEvent("Enter", { defaultPrevented: true }));
    scope2.stop();
    expect(state2.toggle).not.toHaveBeenCalled();
  });

  it("opens on press start for non-touch pointers and respects disabled state", () => {
    const state = createState();
    const target = document.createElement("button");
    const focusSpy = vi.spyOn(target, "focus");
    const ref = { current: target as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ type: "menu" }, state, ref));
    });

    (menuTriggerProps.onPressStart as ((event: any) => void))?.({
      pointerType: "mouse",
      target,
    });
    expect(state.open).toHaveBeenCalledTimes(1);
    expect(state.open).toHaveBeenCalledWith(null);
    expect(focusSpy).toHaveBeenCalledTimes(1);
    scope.stop();

    const disabledState = createState();
    const disabledScope = effectScope();
    let disabledProps: Record<string, unknown> = {};
    disabledScope.run(() => {
      ({ menuTriggerProps: disabledProps } = useMenuTrigger({ isDisabled: true }, disabledState, ref));
    });
    (disabledProps.onPressStart as ((event: any) => void))?.({
      pointerType: "mouse",
      target,
    });
    expect(disabledState.open).not.toHaveBeenCalled();
    disabledScope.stop();
  });

  it("opens with first focus strategy for virtual press start", () => {
    const state = createState();
    const target = document.createElement("button");
    const focusSpy = vi.spyOn(target, "focus");
    const ref = { current: target as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ type: "menu" }, state, ref));
    });

    (menuTriggerProps.onPressStart as ((event: any) => void))?.({
      pointerType: "virtual",
      target,
    });
    expect(state.open).toHaveBeenCalledTimes(1);
    expect(state.open).toHaveBeenCalledWith("first");
    expect(focusSpy).toHaveBeenCalledTimes(1);
    scope.stop();
  });

  it("toggles on touch press and ignores touch press when disabled", () => {
    const state = createState();
    const target = document.createElement("button");
    const focusSpy = vi.spyOn(target, "focus");
    const ref = { current: target as Element | null };

    const scope = effectScope();
    let menuTriggerProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ menuTriggerProps } = useMenuTrigger({ type: "menu" }, state, ref));
    });

    (menuTriggerProps.onPress as ((event: any) => void))?.({
      pointerType: "touch",
      target,
    });
    expect(state.toggle).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);
    scope.stop();

    const disabledState = createState();
    const disabledScope = effectScope();
    let disabledProps: Record<string, unknown> = {};
    disabledScope.run(() => {
      ({ menuTriggerProps: disabledProps } = useMenuTrigger({ isDisabled: true }, disabledState, ref));
    });
    (disabledProps.onPress as ((event: any) => void))?.({
      pointerType: "touch",
      target,
    });
    expect(disabledState.toggle).not.toHaveBeenCalled();
    disabledScope.stop();
  });
});
