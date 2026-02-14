import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "../src/AlertDialog";

describe("AlertDialog", () => {
  it("renders and handles primary action", async () => {
    const onPrimaryAction = vi.fn();
    const wrapper = mount(AlertDialog as any, {
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        onPrimaryAction,
      },
      slots: {
        default: () => "Content body",
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true);
    await wrapper.get('[data-testid="rsp-AlertDialog-confirmButton"]').trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("renders cancel and secondary actions", async () => {
    const onCancel = vi.fn();
    const onSecondaryAction = vi.fn();
    const wrapper = mount(AlertDialog as any, {
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        cancelLabel: "cancel",
        secondaryActionLabel: "secondary",
        onCancel,
        onSecondaryAction,
      },
      slots: {
        default: () => "Content body",
      },
      attachTo: document.body,
    });

    await wrapper.get('[data-testid="rsp-AlertDialog-cancelButton"]').trigger("click");
    expect(onCancel).toHaveBeenCalledTimes(1);

    await wrapper.get('[data-testid="rsp-AlertDialog-secondaryButton"]').trigger("click");
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("maps destructive variant to negative confirm button styling", () => {
    const wrapper = mount(AlertDialog as any, {
      props: {
        variant: "destructive",
        title: "Danger",
        primaryActionLabel: "Delete",
      },
      slots: {
        default: () => "This cannot be undone.",
      },
      attachTo: document.body,
    });

    expect(wrapper.get('[data-testid="rsp-AlertDialog-confirmButton"]').attributes("data-variant")).toBe("negative");
  });

  it("respects disabled primary and secondary action states", async () => {
    const onPrimaryAction = vi.fn();
    const onSecondaryAction = vi.fn();
    const wrapper = mount(AlertDialog as any, {
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        secondaryActionLabel: "secondary",
        isPrimaryActionDisabled: true,
        isSecondaryActionDisabled: true,
        onPrimaryAction,
        onSecondaryAction,
      },
      slots: {
        default: () => "Content body",
      },
      attachTo: document.body,
    });

    await wrapper.get('[data-testid="rsp-AlertDialog-confirmButton"]').trigger("click");
    await wrapper.get('[data-testid="rsp-AlertDialog-secondaryButton"]').trigger("click");
    expect(onPrimaryAction).not.toHaveBeenCalled();
    expect(onSecondaryAction).not.toHaveBeenCalled();
  });
});
