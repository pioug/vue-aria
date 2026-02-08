import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToastState } from "../src";

describe("useToastState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("adds and closes toasts", () => {
    const state = useToastState<string>();

    expect(state.visibleToasts.value).toEqual([]);

    const key = state.add("Toast Message", { timeout: 0 });
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0]?.content).toBe("Toast Message");
    expect(state.visibleToasts.value[0]?.key).toBe(key);
    expect(state.visibleToasts.value[0]?.timer).toBeUndefined();

    state.close(key);
    expect(state.visibleToasts.value).toEqual([]);
  });

  it("queues toasts by max visible count", () => {
    const state = useToastState<string>();

    state.add("First", { timeout: 0 });
    expect(state.visibleToasts.value[0]?.content).toBe("First");

    state.add("Second", { timeout: 0 });
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0]?.content).toBe("Second");

    state.close(state.visibleToasts.value[0]!.key);
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0]?.content).toBe("First");
  });

  it("supports timers with pause/resume", () => {
    const state = useToastState<string>({
      maxVisibleToasts: 3,
    });

    state.add("First", { timeout: 1000 });
    state.add("Second", { timeout: 1000 });

    expect(state.visibleToasts.value).toHaveLength(2);

    state.resumeAll();
    vi.advanceTimersByTime(400);
    state.pauseAll();
    vi.advanceTimersByTime(800);

    expect(state.visibleToasts.value).toHaveLength(2);

    state.resumeAll();
    vi.advanceTimersByTime(700);

    expect(state.visibleToasts.value).toHaveLength(0);
  });

  it("calls wrapUpdate for add/remove/clear", () => {
    const wrapUpdate = vi.fn((fn: () => void) => fn());
    const onClose = vi.fn();

    const state = useToastState<string>({
      wrapUpdate,
      maxVisibleToasts: 3,
    });

    const firstKey = state.add("First", { timeout: 0, onClose });
    state.add("Second", { timeout: 0 });
    state.close(firstKey);
    state.clear();

    expect(wrapUpdate).toHaveBeenCalledTimes(4);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
