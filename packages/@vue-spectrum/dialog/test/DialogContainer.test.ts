import { mount } from "@vue/test-utils";
import { UNSAFE_PortalProvider } from "@vue-aria/overlays";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogContainer } from "../src/DialogContainer";
import { useDialogContainer } from "../src/useDialogContainer";

function dispatchOutsideInteraction() {
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
  document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
  document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }));
}

const ExampleDialog = defineComponent({
  name: "ExampleDialog",
  setup() {
    const container = useDialogContainer();
    return () =>
      h(Dialog as any, null, {
        default: () => [
          h("p", "contents"),
          h("button", { "data-testid": "confirm", onClick: () => container.dismiss() }, "Confirm"),
        ],
      });
  },
});

describe("DialogContainer", () => {
  it("opens and closes from controlled child state", async () => {
    const onDismiss = vi.fn();
    const isOpen = ref(true);
    const Host = defineComponent({
      setup() {
        return () =>
          h(DialogContainer as any, {
            onDismiss: () => {
              onDismiss();
              isOpen.value = false;
            },
          }, {
            default: () => (isOpen.value ? [h(ExampleDialog)] : []),
          });
      },
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
    });
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('[data-testid="confirm"]').trigger("click");
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("renders dialog content inside portal provider containers", () => {
    const portalContainer = document.createElement("div");
    portalContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(portalContainer);

    const wrapper = mount(UNSAFE_PortalProvider as any, {
      props: {
        getContainer: () => portalContainer,
      },
      slots: {
        default: () =>
          h(DialogContainer as any, { onDismiss: vi.fn() }, {
            default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
          }),
      },
      attachTo: document.body,
    });

    expect(portalContainer.querySelector('[role="dialog"]')).toBeTruthy();
    wrapper.unmount();
    portalContainer.remove();
  });

  it("supports outside-interaction dismissal semantics by container type", () => {
    const modalDismiss = vi.fn();
    const modal = mount(DialogContainer as any, {
      props: {
        type: "modal",
        onDismiss: modalDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    dispatchOutsideInteraction();
    expect(modalDismiss).not.toHaveBeenCalled();
    modal.unmount();

    const dismissableModalDismiss = vi.fn();
    const dismissableModal = mount(DialogContainer as any, {
      props: {
        type: "modal",
        isDismissable: true,
        onDismiss: dismissableModalDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    dispatchOutsideInteraction();
    expect(dismissableModalDismiss).toHaveBeenCalledTimes(1);
    dismissableModal.unmount();

    const popoverDismiss = vi.fn();
    const popover = mount(DialogContainer as any, {
      props: {
        type: "popover",
        isDismissable: false,
        onDismiss: popoverDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    dispatchOutsideInteraction();
    expect(popoverDismiss).toHaveBeenCalledTimes(1);
    popover.unmount();
  });

  it("honors container keyboard dismiss disablement", async () => {
    const escapeEnabledDismiss = vi.fn();
    const escapeEnabled = mount(DialogContainer as any, {
      props: {
        onDismiss: escapeEnabledDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await escapeEnabled.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
    expect(escapeEnabledDismiss).toHaveBeenCalledTimes(1);
    escapeEnabled.unmount();

    const escapeDisabledDismiss = vi.fn();
    const escapeDisabled = mount(DialogContainer as any, {
      props: {
        onDismiss: escapeDisabledDismiss,
        isKeyboardDismissDisabled: true,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    await escapeDisabled.get('[role="dialog"]').trigger("keydown", { key: "Escape" });
    expect(escapeDisabledDismiss).not.toHaveBeenCalled();
    escapeDisabled.unmount();
  });

  it("propagates container type to nested dialog sizing", () => {
    const onDismiss = vi.fn();
    const modal = mount(DialogContainer as any, {
      props: {
        type: "modal",
        onDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    const popover = mount(DialogContainer as any, {
      props: {
        type: "popover",
        onDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    const tray = mount(DialogContainer as any, {
      props: {
        type: "tray",
        onDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    const fullscreen = mount(DialogContainer as any, {
      props: {
        type: "fullscreen",
        onDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    const takeover = mount(DialogContainer as any, {
      props: {
        type: "fullscreenTakeover",
        onDismiss,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    expect(modal.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--large");
    expect(popover.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--small");
    expect(tray.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--large");
    expect(fullscreen.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--fullscreen");
    expect(takeover.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--fullscreenTakeover");
  });

  it("propagates dismissable context to nested dialogs", async () => {
    const onDismiss = vi.fn();
    const wrapper = mount(DialogContainer as any, {
      props: {
        onDismiss,
        isDismissable: true,
      },
      slots: {
        default: () => h(Dialog as any, null, { default: () => h("p", "contents") }),
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[data-testid="dialog-close-button"]').exists()).toBe(true);
    await wrapper.get('[data-testid="dialog-close-button"]').trigger("click");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("throws when multiple children are passed", () => {
    const onDismiss = vi.fn();
    expect(() =>
      mount(DialogContainer as any, {
        props: {
          onDismiss,
        },
        slots: {
          default: () => [h("div", "one"), h("div", "two")],
        },
      })
    ).toThrow("Only a single child can be passed to DialogContainer.");
  });

  it("exposes container type through useDialogContainer", () => {
    const TypeReader = defineComponent({
      setup() {
        const container = useDialogContainer();
        return () => h("p", { "data-testid": "container-type" }, container.type ?? "none");
      },
    });

    const wrapper = mount(DialogContainer as any, {
      props: {
        type: "tray",
        onDismiss: vi.fn(),
      },
      slots: {
        default: () => h(TypeReader),
      },
    });

    expect(wrapper.get('[data-testid="container-type"]').text()).toBe("tray");
  });
});
