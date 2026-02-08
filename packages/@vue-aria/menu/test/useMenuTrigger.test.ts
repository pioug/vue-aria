import { describe, expect, it, vi } from "vitest";
import { useMenuTrigger, useMenuTriggerState } from "../src";

describe("useMenuTrigger", () => {
  it("returns trigger and menu aria props", () => {
    const state = useMenuTriggerState();
    const { menuTriggerProps, menuProps } = useMenuTrigger({}, state);

    expect(menuTriggerProps.value["aria-controls"]).toBeUndefined();
    expect(menuTriggerProps.value["aria-expanded"]).toBe(false);
    expect(menuTriggerProps.value["aria-haspopup"]).toBe("menu");
    expect(menuProps.value["aria-labelledby"]).toBe(menuTriggerProps.value.id);
    expect(menuProps.value.id).toBeTypeOf("string");
  });

  it("links trigger to menu id when open", () => {
    const state = useMenuTriggerState({ defaultOpen: true });
    const { menuTriggerProps, menuProps } = useMenuTrigger({}, state);

    expect(menuTriggerProps.value["aria-expanded"]).toBe(true);
    expect(menuTriggerProps.value["aria-controls"]).toBe(menuProps.value.id);
  });

  it("opens with pointer press and keyboard arrows", () => {
    const state = useMenuTriggerState();
    const { menuTriggerProps } = useMenuTrigger({}, state);

    (
      menuTriggerProps.value.onPressStart as (event: {
        pointerType: string;
        target: HTMLElement;
      }) => void
    )({
      pointerType: "mouse",
      target: document.createElement("button"),
    });

    expect(state.isOpen.value).toBe(true);
    expect(state.focusStrategy.value).toBeNull();

    (
      menuTriggerProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowUp",
      altKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusStrategy.value).toBe("last");

    (
      menuTriggerProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "ArrowDown",
      altKey: false,
      defaultPrevented: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(state.focusStrategy.value).toBe("first");
  });

  it("does not open when disabled", () => {
    const state = useMenuTriggerState();
    const { menuTriggerProps } = useMenuTrigger({ isDisabled: true }, state);

    (
      menuTriggerProps.value.onPressStart as (event: {
        pointerType: string;
        target: HTMLElement;
      }) => void
    )({
      pointerType: "mouse",
      target: document.createElement("button"),
    });

    (
      menuTriggerProps.value.onPress as (event: {
        pointerType: string;
        target: HTMLElement;
      }) => void
    )({
      pointerType: "touch",
      target: document.createElement("button"),
    });

    expect(state.isOpen.value).toBe(false);
  });

  it("opens on contextmenu when trigger is longPress", () => {
    const state = useMenuTriggerState();
    const { menuTriggerProps } = useMenuTrigger({ trigger: "longPress" }, state);
    const preventDefault = vi.fn();
    const target = document.createElement("button");
    document.body.appendChild(target);

    (
      menuTriggerProps.value.onContextmenu as (event: MouseEvent) => void
    )({
      preventDefault,
      target,
    } as unknown as MouseEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(state.isOpen.value).toBe(true);
    expect(state.focusStrategy.value).toBe("first");
    expect(document.activeElement).toBe(target);
    target.remove();
  });

  it("does not open on contextmenu when longPress trigger is disabled", () => {
    const state = useMenuTriggerState();
    const { menuTriggerProps } = useMenuTrigger(
      { trigger: "longPress", isDisabled: true },
      state
    );
    const preventDefault = vi.fn();

    (
      menuTriggerProps.value.onContextmenu as (event: MouseEvent) => void
    )({
      preventDefault,
      target: document.createElement("button"),
    } as unknown as MouseEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(state.isOpen.value).toBe(false);
  });
});
