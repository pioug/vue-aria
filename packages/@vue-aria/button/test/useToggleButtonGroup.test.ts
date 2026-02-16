import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToggleGroupState } from "@vue-stately/toggle";
import { useToggleButtonGroup, useToggleButtonGroupItem } from "../src";

describe("useToggleButtonGroup", () => {
  it("returns radiogroup role for single selection", () => {
    const scope = effectScope();
    const root = document.createElement("div");
    const state = scope.run(() => useToggleGroupState({ selectionMode: "single", isDisabled: true }))!;
    const result = scope.run(() => useToggleButtonGroup({ selectionMode: "single", isDisabled: true }, state, { current: root }))!;

    expect(result.groupProps.role).toBe("radiogroup");
    expect(result.groupProps["aria-disabled"]).toBe(true);
    expect(result.groupProps["aria-orientation"]).toBe("horizontal");

    scope.stop();
  });

  it("moves focus with arrow keys in toolbar mode", () => {
    const scope = effectScope();
    const root = document.createElement("div");
    const first = document.createElement("button");
    const second = document.createElement("button");
    const third = document.createElement("button");
    root.append(first, second, third);
    document.body.appendChild(root);

    try {
      const state = scope.run(() => useToggleGroupState({ selectionMode: "multiple" }))!;
      const result = scope.run(() => useToggleButtonGroup({ selectionMode: "multiple" }, state, { current: root }))!;
      expect(result.groupProps.role).toBe("toolbar");

      first.focus();
      expect(document.activeElement).toBe(first);

      const rightEvent = {
        key: "ArrowRight",
        currentTarget: root,
        target: first,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      };
      (result.groupProps.onKeydownCapture as (event: unknown) => void)?.(rightEvent);
      expect(document.activeElement).toBe(second);
      expect(rightEvent.stopPropagation).toHaveBeenCalled();
      expect(rightEvent.preventDefault).toHaveBeenCalled();

      const leftEvent = {
        key: "ArrowLeft",
        currentTarget: root,
        target: second,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      };
      (result.groupProps.onKeydownCapture as (event: unknown) => void)?.(leftEvent);
      expect(document.activeElement).toBe(first);
      expect(leftEvent.stopPropagation).toHaveBeenCalled();
      expect(leftEvent.preventDefault).toHaveBeenCalled();

      first.focus();
      const tabEvent = {
        key: "Tab",
        shiftKey: false,
        currentTarget: root,
        target: first,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      };
      (result.groupProps.onKeydownCapture as (event: unknown) => void)?.(tabEvent);
      expect(document.activeElement).toBe(third);
      expect(tabEvent.stopPropagation).toHaveBeenCalled();
      expect(tabEvent.preventDefault).not.toHaveBeenCalled();
    } finally {
      root.remove();
      scope.stop();
    }
  });
});

describe("useToggleButtonGroupItem", () => {
  it("maps single selection mode to radio semantics", () => {
    const scope = effectScope();
    const button = document.createElement("button");
    document.body.appendChild(button);

    try {
      const state = scope.run(() =>
        useToggleGroupState({
          selectionMode: "single",
          defaultSelectedKeys: ["bold"],
        }))!;
      const result = scope.run(() =>
        useToggleButtonGroupItem(
          { id: "bold", elementType: "button" },
          state,
          { current: button }
        ))!;

      expect(result.isSelected).toBe(true);
      expect(result.buttonProps.role).toBe("radio");
      expect(result.buttonProps["aria-checked"]).toBe(true);
      expect(result.buttonProps["aria-pressed"]).toBeUndefined();
    } finally {
      button.remove();
      scope.stop();
    }
  });

  it("inherits disabled state from toggle group", () => {
    const scope = effectScope();
    const button = document.createElement("button");
    document.body.appendChild(button);

    try {
      const state = scope.run(() =>
        useToggleGroupState({
          selectionMode: "multiple",
          isDisabled: true,
        }))!;
      const result = scope.run(() =>
        useToggleButtonGroupItem(
          { id: "italic", elementType: "button" },
          state,
          { current: button }
        ))!;

      expect(result.isDisabled).toBe(true);
      expect(result.buttonProps["aria-pressed"]).toBe(false);
    } finally {
      button.remove();
      scope.stop();
    }
  });
});
