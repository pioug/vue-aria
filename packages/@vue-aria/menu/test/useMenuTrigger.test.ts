import { describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
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
});
