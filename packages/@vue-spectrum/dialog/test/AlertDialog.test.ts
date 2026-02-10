import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "../src";

describe("AlertDialog", () => {
  it("renders alert dialog with onPrimaryAction", async () => {
    const onPrimaryAction = vi.fn();
    const wrapper = mount(AlertDialog, {
      attachTo: document.body,
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        onPrimaryAction,
      },
      slots: {
        default: () => "Content body",
      },
    });

    const dialog = wrapper.get("[role=\"alertdialog\"]");
    expect(document.activeElement).toBe(dialog.element);

    await wrapper.get("[data-testid=\"rsp-AlertDialog-confirmButton\"]").trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("renders two button alert dialog with onPrimaryAction and onCancel", async () => {
    const onCancel = vi.fn();
    const onPrimaryAction = vi.fn();
    const wrapper = mount(AlertDialog, {
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        cancelLabel: "cancel",
        onPrimaryAction,
        onCancel,
      },
      slots: {
        default: () => "Content body",
      },
    });

    await wrapper.get("[data-testid=\"rsp-AlertDialog-cancelButton\"]").trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
    expect(onCancel).toHaveBeenCalledTimes(1);

    await wrapper.get("[data-testid=\"rsp-AlertDialog-confirmButton\"]").trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("supports autofocus options", async () => {
    const wrapper = mount(AlertDialog, {
      attachTo: document.body,
      props: {
        variant: "confirmation",
        title: "the title",
        primaryActionLabel: "confirm",
        secondaryActionLabel: "secondary",
        autoFocusButton: "secondary",
      },
      slots: {
        default: () => "Content body",
      },
    });

    await Promise.resolve();
    const secondary = wrapper.get("[data-testid=\"rsp-AlertDialog-secondaryButton\"]");
    expect(secondary.attributes("data-testid")).toBe("rsp-AlertDialog-secondaryButton");
    wrapper.unmount();
  });

  it("supports disabled primary and secondary actions", async () => {
    const onPrimaryAction = vi.fn();
    const onSecondaryAction = vi.fn();
    const wrapper = mount(AlertDialog, {
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
    });

    await wrapper.get("[data-testid=\"rsp-AlertDialog-secondaryButton\"]").trigger("click");
    await wrapper.get("[data-testid=\"rsp-AlertDialog-confirmButton\"]").trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
    expect(onSecondaryAction).toHaveBeenCalledTimes(0);
  });
});
