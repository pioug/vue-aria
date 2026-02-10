import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContainer, useDialogContainer } from "../src";

describe("useDialogContainer", () => {
  it("reports an error when used outside dialog container context", () => {
    const App = defineComponent({
      name: "OutsideDialogContainerHookApp",
      setup() {
        let message = "";
        try {
          useDialogContainer();
        } catch (error) {
          message = (error as Error).message;
        }
        return () => h("div", { "data-testid": "error" }, message);
      },
    });

    const wrapper = mount(App);
    expect(wrapper.get("[data-testid=\"error\"]").text()).toBe(
      "Cannot call useDialogContainer outside a <DialogTrigger> or <DialogContainer>."
    );
  });

  it("dismisses via dialog container context", async () => {
    const App = defineComponent({
      name: "UseDialogContainerApp",
      setup() {
        const isOpen = ref(true);
        const DialogContent = defineComponent({
          name: "DialogContent",
          setup() {
            const container = useDialogContainer();
            return () =>
              h(
                Dialog,
                null,
                () =>
                  h("button", {
                    type: "button",
                    onClick: container.dismiss,
                  }, "Close")
              );
          },
        });

        return () =>
          h(
            DialogContainer,
            {
              onDismiss: () => {
                isOpen.value = false;
              },
            },
            {
              default: () => (isOpen.value ? h(DialogContent) : null),
            }
          );
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    await nextTick();
    const closeButton = Array.from(document.body.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Close"
    );
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    wrapper.unmount();
  });
});
