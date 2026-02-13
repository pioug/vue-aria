import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToast } from "../src";

describe("useToast", () => {
  const run = (props: Record<string, unknown>, state: { close: (key: unknown) => void }) => {
    const scope = effectScope();
    const result = scope.run(() => useToast(props as any, state as any, { current: document.createElement("div") }))!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const close = vi.fn();
    const { closeButtonProps, toastProps, contentProps, titleProps } = run(
      { toast: { key: "toast-1" } },
      { close }
    );

    expect(toastProps.role).toBe("alertdialog");
    expect(contentProps.role).toBe("alert");
    expect(closeButtonProps["aria-label"]).toBe("Close");
    expect(typeof closeButtonProps.onPress).toBe("function");
    expect(titleProps.id).toBe(toastProps["aria-labelledby"]);
  });

  it("handles close button", () => {
    const close = vi.fn();
    const { closeButtonProps } = run({ toast: { key: 1 } }, { close });
    (closeButtonProps.onPress as () => void)();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
  });

  it("passes through data attributes", () => {
    const close = vi.fn();
    const { toastProps } = run({ toast: { key: "toast-1" }, "data-test-id": "toast" }, { close });
    expect(toastProps["data-test-id"]).toBe("toast");
  });
});
