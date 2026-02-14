import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogTrigger } from "../src/DialogTrigger";

describe("DialogTrigger", () => {
  it("opens and closes dialog content", async () => {
    const wrapper = mount(DialogTrigger as any, {
      slots: {
        trigger: () => h("button", { "data-testid": "trigger" }, "Trigger"),
        default: ({ close }: { close: () => void }) =>
          h(Dialog as any, null, {
            default: () => [
              h("p", "contents"),
              h("button", { "data-testid": "close", onClick: close }, "Close"),
            ],
          }),
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.get('[data-testid="trigger"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('[data-testid="close"]').trigger("click");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DialogTrigger as any, {
      props: {
        isOpen: false,
        onOpenChange,
      },
      slots: {
        trigger: () => h("button", { "data-testid": "trigger" }, "Trigger"),
        default: ({ close }: { close: () => void }) =>
          h(Dialog as any, null, {
            default: () => [
              h("p", "contents"),
              h("button", { "data-testid": "close", onClick: close }, "Close"),
            ],
          }),
      },
      attachTo: document.body,
    });

    await wrapper.get('[data-testid="trigger"]').trigger("click");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.setProps({ isOpen: true });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it("applies tray and fullscreen trigger type markers", async () => {
    const tray = mount(DialogTrigger as any, {
      props: {
        type: "tray",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "tray-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await tray.get('[data-testid="tray-trigger"]').trigger("click");
    expect(tray.find('[data-testid="tray"]').exists()).toBe(true);

    const fullscreen = mount(DialogTrigger as any, {
      props: {
        type: "fullscreen",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "fullscreen-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await fullscreen.get('[data-testid="fullscreen-trigger"]').trigger("click");
    expect(fullscreen.find('[data-testid="fullscreen"]').exists()).toBe(true);
  });
});
