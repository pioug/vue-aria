import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../src";

describe("Dialog", () => {
  it("auto focuses the dialog itself", async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("input", { "data-testid": "input1" }),
          h("input", { "data-testid": "input2" }),
        ],
      },
    });

    await nextTick();
    await Promise.resolve();

    const dialog = wrapper.get("[role=\"dialog\"]").element as HTMLElement;
    expect(document.activeElement).toBe(dialog);

    wrapper.unmount();
  });

  it("autofocuses an element with autofocus", async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("input", { "data-testid": "input1" }),
          h("input", { "data-testid": "input2", autofocus: true }),
        ],
      },
    });

    await nextTick();
    await Promise.resolve();

    const input2 = wrapper.get("[data-testid=\"input2\"]").element as HTMLElement;
    expect(document.activeElement).toBe(input2);

    wrapper.unmount();
  });

  it("supports aria-label", () => {
    const wrapper = mount(Dialog, {
      props: {
        "aria-label": "robin",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[role=\"dialog\"]");
    expect(dialog.attributes("aria-label")).toBe("robin");
  });

  it("supports custom data attributes", () => {
    const wrapper = mount(Dialog, {
      props: {
        "data-testid": "test",
      } as Record<string, unknown>,
      slots: {
        default: () => "contents",
      },
    });

    const dialog = wrapper.get("[data-testid=\"test\"]");
    expect(dialog.attributes("data-testid")).toBe("test");
  });

  it("renders dismiss button when dismissable", async () => {
    const onDismiss = vi.fn();
    const wrapper = mount(Dialog, {
      props: {
        isDismissable: true,
        onDismiss,
      },
      slots: {
        default: () => "contents",
      },
    });

    await wrapper.get("button[aria-label=\"Dismiss\"]").trigger("click");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
