import { mount } from "@vue/test-utils";
import { UNSAFE_PortalProvider } from "@vue-aria/overlays";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogTrigger } from "../src/DialogTrigger";

function dispatchOutsideInteraction() {
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
  document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
  document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
}

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

  it("renders dialog content inside portal provider containers", async () => {
    const portalContainer = document.createElement("div");
    portalContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(portalContainer);

    const wrapper = mount(UNSAFE_PortalProvider as any, {
      props: {
        getContainer: () => portalContainer,
      },
      slots: {
        default: () =>
          h(DialogTrigger as any, null, {
            trigger: () => h("button", { "data-testid": "trigger" }, "Trigger"),
            default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
          }),
      },
      attachTo: document.body,
    });

    await wrapper.get('[data-testid="trigger"]').trigger("click");
    expect(portalContainer.querySelector('[role="dialog"]')).toBeTruthy();
    wrapper.unmount();
    portalContainer.remove();
  });

  it("supports outside-interaction dismissal semantics by type", async () => {
    const nonDismissableModal = mount(DialogTrigger as any, {
      props: {
        type: "modal",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "modal-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await nonDismissableModal.get('[data-testid="modal-trigger"]').trigger("click");
    expect(nonDismissableModal.find('[role="dialog"]').exists()).toBe(true);
    dispatchOutsideInteraction();
    await nonDismissableModal.vm.$nextTick();
    expect(nonDismissableModal.find('[role="dialog"]').exists()).toBe(true);
    nonDismissableModal.unmount();

    const dismissableModal = mount(DialogTrigger as any, {
      props: {
        type: "modal",
        isDismissable: true,
      },
      slots: {
        trigger: () => h("button", { "data-testid": "dismissable-modal-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await dismissableModal.get('[data-testid="dismissable-modal-trigger"]').trigger("click");
    expect(dismissableModal.find('[role="dialog"]').exists()).toBe(true);
    dispatchOutsideInteraction();
    await dismissableModal.vm.$nextTick();
    expect(dismissableModal.find('[role="dialog"]').exists()).toBe(false);
    dismissableModal.unmount();

    const popover = mount(DialogTrigger as any, {
      props: {
        type: "popover",
        isDismissable: false,
      },
      slots: {
        trigger: () => h("button", { "data-testid": "popover-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await popover.get('[data-testid="popover-trigger"]').trigger("click");
    expect(popover.find('[role="dialog"]').exists()).toBe(true);
    dispatchOutsideInteraction();
    await popover.vm.$nextTick();
    expect(popover.find('[role="dialog"]').exists()).toBe(false);
    popover.unmount();
  });

  it("honors keyboard dismiss disablement", async () => {
    const escapeEnabled = mount(DialogTrigger as any, {
      props: {
        defaultOpen: true,
      },
      slots: {
        trigger: () => h("button", { "data-testid": "escape-enabled-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    expect(escapeEnabled.find('[role="dialog"]').exists()).toBe(true);
    await escapeEnabled.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
    await escapeEnabled.vm.$nextTick();
    expect(escapeEnabled.find('[role="dialog"]').exists()).toBe(false);
    escapeEnabled.unmount();

    const escapeDisabled = mount(DialogTrigger as any, {
      props: {
        defaultOpen: true,
        isKeyboardDismissDisabled: true,
      },
      slots: {
        trigger: () => h("button", { "data-testid": "escape-disabled-trigger" }, "Trigger"),
        default: ({ close }: { close: () => void }) =>
          h(Dialog as any, null, {
            default: () => h("button", { "data-testid": "dialog-close", onClick: close }, "Close"),
          }),
      },
      attachTo: document.body,
    });

    expect(escapeDisabled.find('[role="dialog"]').exists()).toBe(true);
    await escapeDisabled.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
    await escapeDisabled.vm.$nextTick();
    expect(escapeDisabled.find('[role="dialog"]').exists()).toBe(true);
    await escapeDisabled.get('[data-testid="dialog-close"]').trigger("click");
    expect(escapeDisabled.find('[role="dialog"]').exists()).toBe(false);
    escapeDisabled.unmount();
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

  it("supports defaultOpen and close transition callbacks", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(DialogTrigger as any, {
      props: {
        defaultOpen: true,
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

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();

    await wrapper.get('[data-testid="close"]').trigger("click");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("propagates trigger type to nested dialog sizing", async () => {
    const popover = mount(DialogTrigger as any, {
      props: {
        type: "popover",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "popover-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await popover.get('[data-testid="popover-trigger"]').trigger("click");
    expect(popover.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--small");

    const tray = mount(DialogTrigger as any, {
      props: {
        type: "tray",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "tray-size-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await tray.get('[data-testid="tray-size-trigger"]').trigger("click");
    expect(tray.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--large");

    const modal = mount(DialogTrigger as any, {
      props: {
        type: "modal",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "modal-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await modal.get('[data-testid="modal-trigger"]').trigger("click");
    expect(modal.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--large");

    const fullscreen = mount(DialogTrigger as any, {
      props: {
        type: "fullscreen",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "fullscreen-size-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await fullscreen.get('[data-testid="fullscreen-size-trigger"]').trigger("click");
    expect(fullscreen.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--fullscreen");

    const takeover = mount(DialogTrigger as any, {
      props: {
        type: "fullscreenTakeover",
      },
      slots: {
        trigger: () => h("button", { "data-testid": "takeover-trigger" }, "Trigger"),
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await takeover.get('[data-testid="takeover-trigger"]').trigger("click");
    expect(takeover.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--fullscreenTakeover");
  });
});
