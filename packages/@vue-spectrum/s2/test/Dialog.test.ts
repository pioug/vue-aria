import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import {
  AlertDialog,
  Dialog,
  DialogContainer,
  DialogTrigger,
  useDialogContainer,
} from "../src/Dialog";
import { Provider } from "../src/Provider";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("@vue-spectrum/s2 Dialog", () => {
  it("renders alert dialog baseline class and primary action", async () => {
    const onPrimaryAction = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            AlertDialog,
            {
              variant: "confirmation",
              title: "Title",
              primaryActionLabel: "Confirm",
              onPrimaryAction,
            },
            {
              default: () => "Body",
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    const dialog = wrapper.get(".s2-AlertDialog");
    expect(dialog.attributes("role")).toBe("alertdialog");
    await wrapper.get("[data-testid=\"rsp-AlertDialog-confirmButton\"]").trigger("click");
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it("opens dialog from trigger and applies baseline classes", async () => {
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            DialogTrigger,
            null,
            {
              default: () => [
                h("button", { type: "button" }, "Trigger"),
                h(Dialog, { "aria-label": "Dialog title" }, () => "Contents"),
              ],
            }
          ),
      },
    });

    await wrapper.vm.$nextTick();
    wrapper.get(".s2-DialogTrigger");
    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector(".s2-Dialog")).not.toBeNull();
    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    wrapper.unmount();
  });

  it("dismisses through useDialogContainer", async () => {
    const App = defineComponent({
      name: "S2UseDialogContainerTestApp",
      setup() {
        const isOpen = ref(true);
        const DialogContent = defineComponent({
          name: "S2DialogContent",
          setup() {
            const container = useDialogContainer();
            return () =>
              h(
                Dialog,
                {
                  "aria-label": "Dialog body",
                },
                () =>
                  h(
                    "button",
                    {
                      type: "button",
                      onClick: container.dismiss,
                    },
                    "Close"
                  )
              );
          },
        });

        return () =>
          h(
            Provider,
            {
              theme: defaultTheme,
            },
            {
              default: () =>
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
                ),
            }
          );
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    await flushOverlay();
    const closeButton = Array.from(document.body.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Close"
    );
    closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    wrapper.unmount();
  });
});
