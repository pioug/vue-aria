import { describe, expect, it, vi } from "vitest";
import { useTooltipTriggerState } from "../src";
import { __resetTooltipGlobalStateForTests } from "../src/useTooltipTriggerState";

describe("useTooltipTriggerState", () => {
  it("opens immediately when requested", () => {
    __resetTooltipGlobalStateForTests();
    const state = useTooltipTriggerState({ delay: 1000 });
    state.open(true);
    expect(state.isOpen).toBe(true);
  });

  it("closes immediately when requested", () => {
    __resetTooltipGlobalStateForTests();
    const state = useTooltipTriggerState({ delay: 0 });
    state.open(true);
    expect(state.isOpen).toBe(true);
    state.close(true);
    expect(state.isOpen).toBe(false);
  });

  it("respects warmup delay", () => {
    __resetTooltipGlobalStateForTests();
    vi.useFakeTimers();
    const state = useTooltipTriggerState({ delay: 500, closeDelay: 0 });
    state.open();
    expect(state.isOpen).toBe(false);
    vi.runAllTimers();
    expect(state.isOpen).toBe(true);
    vi.useRealTimers();
  });
});
