import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useToast, type UseToastResult } from "../src";

describe("useToast", () => {
  it("handles default semantics", () => {
    const scope = effectScope();
    let result!: UseToastResult;

    scope.run(() => {
      result = useToast(
        {
          toast: {
            key: "a",
            content: "Saved",
          },
        },
        {
          close: vi.fn(),
        },
        ref(null)
      );
    });

    expect(result.toastProps.value.role).toBe("alertdialog");
    expect(result.contentProps.value.role).toBe("alert");
    expect(result.closeButtonProps.value["aria-label"]).toBe("Close");
    expect(typeof result.closeButtonProps.value.onPress).toBe("function");
    expect(result.toastProps.value["aria-labelledby"]).toBe(result.titleProps.value.id);

    scope.stop();
  });

  it("closes using close button props", () => {
    const close = vi.fn();
    const scope = effectScope();
    let result!: UseToastResult;

    scope.run(() => {
      result = useToast(
        {
          toast: {
            key: "toast-1",
            content: "Saved",
          },
        },
        {
          close,
        },
        ref(null)
      );
    });

    (result.closeButtonProps.value.onPress as () => void)();
    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith("toast-1");

    scope.stop();
  });

  it("passes through dom data attributes", () => {
    const scope = effectScope();
    let result!: UseToastResult;

    scope.run(() => {
      result = useToast(
        {
          toast: {
            key: "a",
            content: "Saved",
          },
          "data-test-id": "toast",
        },
        {
          close: vi.fn(),
        },
        ref(null)
      );
    });

    expect(result.toastProps.value["data-test-id"]).toBe("toast");

    scope.stop();
  });

  it("resets and pauses timers", () => {
    const timer = {
      reset: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };

    const scope = effectScope();
    scope.run(() => {
      useToast(
        {
          toast: {
            key: "a",
            content: "Saved",
            timeout: 5000,
            timer,
          },
        },
        {
          close: vi.fn(),
        },
        ref(null)
      );
    });

    expect(timer.reset).toHaveBeenCalledWith(5000);

    scope.stop();
    expect(timer.pause).toHaveBeenCalledTimes(1);
  });
});
