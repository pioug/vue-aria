import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useTooltip, useTooltipTrigger } from "../src";
import { useTooltipTriggerState } from "@vue-stately/tooltip";

describe("useTooltip", () => {
  it("sets tooltip role", () => {
    const scope = effectScope();
    const { tooltipProps } = scope.run(() => useTooltip({}))!;
    expect(tooltipProps.role).toBe("tooltip");
    scope.stop();
  });

  it("opens and closes state on hover handlers", () => {
    const open = vi.fn();
    const close = vi.fn();
    const scope = effectScope();
    const { tooltipProps } = scope.run(() =>
      useTooltip({}, { isOpen: false, open, close } as any)
    )!;

    const target = document.createElement("span");
    (tooltipProps.onMouseenter as ((event: MouseEvent) => void) | undefined)?.({
      currentTarget: target,
      target,
    } as unknown as MouseEvent);
    (tooltipProps.onMouseleave as ((event: MouseEvent) => void) | undefined)?.({
      currentTarget: target,
      target,
    } as unknown as MouseEvent);

    expect(open).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    scope.stop();
  });
});

describe("useTooltipTrigger", () => {
  it("wires aria-describedby when open", () => {
    const scope = effectScope();
    const state = scope.run(() => useTooltipTriggerState({ delay: 0 }))!;
    state.open(true);
    const { triggerProps, tooltipProps } = scope.run(() =>
      useTooltipTrigger({}, state, { current: document.createElement("button") })
    )!;

    expect(triggerProps["aria-describedby"]).toBe(tooltipProps.id);
    scope.stop();
  });
});
