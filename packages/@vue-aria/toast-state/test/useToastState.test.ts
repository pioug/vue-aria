import { describe, expect, it, vi } from "vitest";
import { useToastState } from "../src";

describe("useToastState", () => {
  it("adds a toast via add", () => {
    const state = useToastState<string>();
    expect(state.visibleToasts).toStrictEqual([]);

    state.add("Toast Message", { timeout: 0 });
    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("Toast Message");
    expect(state.visibleToasts[0].timeout).toBe(0);
    expect(state.visibleToasts[0].timer).toBeUndefined();
    expect(state.visibleToasts[0]).toHaveProperty("key");
  });

  it("adds a toast with a timer", () => {
    const state = useToastState<string>();
    expect(state.visibleToasts).toStrictEqual([]);

    state.add("Test", { timeout: 5000 });
    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("Test");
    expect(state.visibleToasts[0].timeout).toBe(5000);
    expect(state.visibleToasts[0].timer).toBeDefined();
  });

  it("supports multiple visible toasts when configured", () => {
    const state = useToastState<string>({ maxVisibleToasts: 2 });
    state.add("First", { timeout: 0 });
    state.add("Second", { timeout: 0 });

    expect(state.visibleToasts).toHaveLength(2);
    expect(state.visibleToasts[0].content).toBe("Second");
    expect(state.visibleToasts[1].content).toBe("First");
  });

  it("queues toasts when maxVisibleToasts is 1", () => {
    const state = useToastState<string>();
    state.add("First", { timeout: 0 });
    state.add("Second", { timeout: 0 });

    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("Second");

    state.close(state.visibleToasts[0].key);
    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("First");
  });

  it("uses timeout timers when resumed", () => {
    vi.useFakeTimers();
    const state = useToastState<string>();
    state.add("Timed", { timeout: 1000 });

    state.resumeAll();
    expect(state.visibleToasts).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(state.visibleToasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it("removes a middle visible toast after timeout and preserves queue order", () => {
    vi.useFakeTimers();
    const state = useToastState<string>({ maxVisibleToasts: 3 });

    state.add("First Toast", { timeout: 0 });
    state.add("Second Toast", { timeout: 1000 });
    state.resumeAll();
    state.add("Third Toast", { timeout: 0 });

    expect(state.visibleToasts).toHaveLength(3);
    expect(state.visibleToasts[0].content).toBe("Third Toast");
    expect(state.visibleToasts[1].content).toBe("Second Toast");
    expect(state.visibleToasts[2].content).toBe("First Toast");

    vi.advanceTimersByTime(500);
    expect(state.visibleToasts).toHaveLength(3);

    vi.advanceTimersByTime(1000);
    expect(state.visibleToasts).toHaveLength(2);
    expect(state.visibleToasts[0].content).toBe("Third Toast");
    expect(state.visibleToasts[1].content).toBe("First Toast");

    state.close(state.visibleToasts[0].key);
    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("First Toast");
    vi.useRealTimers();
  });

  it("preserves partial remaining durations across pause/resume for multiple visible timers", () => {
    vi.useFakeTimers();
    const state = useToastState<string>({ maxVisibleToasts: 2 });

    state.add("First Timed", { timeout: 1000 });
    state.add("Second Timed", { timeout: 2000 });
    state.resumeAll();

    expect(state.visibleToasts).toHaveLength(2);
    expect(state.visibleToasts[0].content).toBe("Second Timed");
    expect(state.visibleToasts[1].content).toBe("First Timed");

    vi.advanceTimersByTime(600);
    state.pauseAll();

    vi.advanceTimersByTime(2000);
    expect(state.visibleToasts).toHaveLength(2);

    state.resumeAll();
    vi.advanceTimersByTime(350);
    expect(state.visibleToasts).toHaveLength(2);

    vi.advanceTimersByTime(100);
    expect(state.visibleToasts).toHaveLength(1);
    expect(state.visibleToasts[0].content).toBe("Second Timed");

    vi.advanceTimersByTime(900);
    expect(state.visibleToasts).toHaveLength(1);

    vi.advanceTimersByTime(100);
    expect(state.visibleToasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it("uses wrapUpdate on add and close", () => {
    const wrapUpdate = vi.fn((fn: () => void) => fn());
    const state = useToastState<string>({ wrapUpdate });
    state.add("Toast A", { timeout: 0 });
    state.add("Toast B", { timeout: 0 });
    state.close(state.visibleToasts[0].key);

    expect(wrapUpdate).toHaveBeenCalledTimes(3);
  });
});
