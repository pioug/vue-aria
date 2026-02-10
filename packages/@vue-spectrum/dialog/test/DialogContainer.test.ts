import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Dialog, DialogContainer } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("DialogContainer", () => {
  it("opens and closes a dialog based on controlled state", async () => {
    const App = defineComponent({
      name: "DialogContainerExample",
      setup() {
        const isOpen = ref(false);
        return () =>
          h("div", null, [
            h("button", {
              type: "button",
              onClick: () => {
                isOpen.value = true;
              },
            }, "Open dialog"),
            h(
              DialogContainer,
              {
                onDismiss: () => {
                  isOpen.value = false;
                },
              },
              {
                default: () =>
                  isOpen.value
                    ? h(
                        Dialog,
                        null,
                        () =>
                          h("button", {
                            type: "button",
                            onClick: () => {
                              isOpen.value = false;
                            },
                          }, "Confirm")
                      )
                    : null,
              }
            ),
          ]);
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();

    await wrapper.get("button").trigger("click");
    await flushOverlay();
    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();

    const confirm = Array.from(document.body.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Confirm"
    );
    confirm?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    wrapper.unmount();
  });

  it("closes on escape and calls onDismiss", async () => {
    const onDismiss = vi.fn();
    const wrapper = mount(DialogContainer, {
      attachTo: document.body,
      props: {
        onDismiss,
      },
      slots: {
        default: () => h(Dialog, null, () => "contents"),
      },
    });

    await flushOverlay();
    const overlay = document.body.querySelector("[data-testid=\"modal\"]");
    expect(overlay).not.toBeNull();

    overlay?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flushOverlay();

    expect(onDismiss).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it("throws when more than one child is passed", () => {
    expect(() =>
      mount(DialogContainer, {
        slots: {
          default: () => [h(Dialog, null, () => "one"), h(Dialog, null, () => "two")],
        },
      })
    ).toThrow("Only a single child can be passed to DialogContainer.");
  });
});
