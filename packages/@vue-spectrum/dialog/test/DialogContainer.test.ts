import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { Dialog } from "../src/Dialog";
import { DialogContainer } from "../src/DialogContainer";
import { useDialogContainer } from "../src/useDialogContainer";

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

  it("propagates container type to nested dialog sizing", () => {
    const onDismiss = vi.fn();
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

    expect(popover.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--small");
    expect(fullscreen.get('[role="dialog"]').classes()).toContain("spectrum-Dialog--fullscreen");
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
