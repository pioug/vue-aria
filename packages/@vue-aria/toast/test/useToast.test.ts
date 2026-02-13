import { effectScope, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToast } from "../src";

describe("useToast", () => {
  const run = (props: Record<string, unknown>, state: { close: (key: unknown) => void }) => {
    const scope = effectScope();
    const result = scope.run(() => useToast(props as any, state as any, { current: document.createElement("div") }))!;
    return {
      result,
      cleanup() {
        scope.stop();
      },
    };
  };

  it("handles defaults", () => {
    const close = vi.fn();
    const { result, cleanup } = run(
      { toast: { key: "toast-1" } },
      { close }
    );
    const { closeButtonProps, toastProps, contentProps, titleProps } = result;

    expect(toastProps.role).toBe("alertdialog");
    expect(contentProps.role).toBe("alert");
    expect(closeButtonProps["aria-label"]).toBe("Close");
    expect(typeof closeButtonProps.onPress).toBe("function");
    expect(titleProps.id).toBe(toastProps["aria-labelledby"]);
    cleanup();
  });

  it("handles close button", () => {
    const close = vi.fn();
    const { result, cleanup } = run({ toast: { key: 1 } }, { close });
    const { closeButtonProps } = result;
    (closeButtonProps.onPress as () => void)();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
    cleanup();
  });

  it("passes through data attributes", () => {
    const close = vi.fn();
    const { result, cleanup } = run({ toast: { key: "toast-1" }, "data-test-id": "toast" }, { close });
    const { toastProps } = result;
    expect(toastProps["data-test-id"]).toBe("toast");
    cleanup();
  });

  it("resets and pauses timers when toast timeout is configured", async () => {
    const close = vi.fn();
    const reset = vi.fn();
    const pause = vi.fn();
    const timer = { reset, pause };
    const { cleanup } = run({ toast: { key: "toast-1", timer, timeout: 3000 } }, { close });

    await nextTick();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledWith(3000);

    cleanup();
    expect(pause).toHaveBeenCalledTimes(1);
  });
});
