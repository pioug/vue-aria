import { effectScope, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useDisclosure } from "../src";
import { useDisclosureState } from "@vue-aria/disclosure-state";

describe("useDisclosure", () => {
  const createRef = () => ({ current: document.createElement("div") });

  it("returns correct aria attributes when collapsed", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    const disclosure = scope.run(() => useDisclosure({}, state, ref))!;

    expect(disclosure.buttonProps["aria-expanded"]).toBe(false);
    expect(disclosure.panelProps["aria-hidden"]).toBe(true);
    scope.stop();
  });

  it("returns correct aria attributes when expanded", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({ defaultExpanded: true }))!;
    const disclosure = scope.run(() => useDisclosure({}, state, ref))!;

    expect(disclosure.buttonProps["aria-expanded"]).toBe(true);
    expect(disclosure.panelProps["aria-hidden"]).toBe(false);
    scope.stop();
  });

  it("expands on press (mouse)", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    const disclosure = scope.run(() => useDisclosure({}, state, ref))!;

    (disclosure.buttonProps.onPress as (e: { pointerType: string }) => void)({ pointerType: "mouse" });
    expect(state.isExpanded).toBe(true);
    scope.stop();
  });

  it("expands on press start (keyboard)", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    const disclosure = scope.run(() => useDisclosure({}, state, ref))!;

    (disclosure.buttonProps.onPressStart as (e: { pointerType: string }) => void)({
      pointerType: "keyboard",
    });
    expect(state.isExpanded).toBe(true);
    scope.stop();
  });

  it("does not toggle when disabled", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    const disclosure = scope.run(() => useDisclosure({ isDisabled: true }, state, ref))!;

    (disclosure.buttonProps.onPress as (e: { pointerType: string }) => void)({ pointerType: "mouse" });
    expect(state.isExpanded).toBe(false);
    scope.stop();
  });

  it("sets correct IDs for accessibility", () => {
    const ref = createRef();
    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    const disclosure = scope.run(() => useDisclosure({}, state, ref))!;

    expect(disclosure.buttonProps["aria-controls"]).toBe(disclosure.panelProps.id);
    expect(disclosure.panelProps["aria-labelledby"]).toBe(disclosure.buttonProps.id);
    scope.stop();
  });

  it("handles beforematch by expanding", async () => {
    const ref = createRef();
    const addEventListener = vi.spyOn(ref.current, "addEventListener");
    const listeners: Record<string, EventListener> = {};
    addEventListener.mockImplementation((name: any, listener: any) => {
      listeners[name] = listener;
    });

    const scope = effectScope();
    const state = scope.run(() => useDisclosureState({}))!;
    scope.run(() => useDisclosure({}, state, ref))!;

    expect(state.isExpanded).toBe(false);
    listeners.beforematch?.(new Event("beforematch"));
    await nextTick();
    expect(state.isExpanded).toBe(true);
    scope.stop();
  });
});
