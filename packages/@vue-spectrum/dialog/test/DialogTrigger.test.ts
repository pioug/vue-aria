import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type PropType } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog, DialogTrigger } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountDialogTrigger(
  props: Record<string, unknown> = {}
) {
  return mount(DialogTrigger, {
    attachTo: document.body,
    props,
    slots: {
      default: () => [
        h("button", { type: "button" }, "Trigger"),
        h(Dialog, null, () => "contents"),
      ],
    },
  });
}

function mockMatchMedia(matches: boolean): () => void {
  const originalMatchMedia = window.matchMedia;
  const mock = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: mock,
  });

  return () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  };
}

describe("DialogTrigger", () => {
  let warnMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnMock = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnMock.mockRestore();
  });

  it("triggers a modal by default", async () => {
    const wrapper = mountDialogTrigger();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("triggers a tray", async () => {
    const wrapper = mountDialogTrigger({
      type: "tray",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"tray\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("triggers a popover", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"popover\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("positions popovers relative to the trigger", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
      placement: "top",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    const popover = document.body.querySelector("[data-testid=\"popover\"]") as HTMLElement;
    expect(popover).not.toBeNull();
    expect(popover.getAttribute("data-placement")).not.toBeNull();
    expect(popover.style.position.length).toBeGreaterThan(0);
    expect(popover.style.zIndex).toBe("100000");

    wrapper.unmount();
  });

  it("hides the dialog when pressing escape", async () => {
    const wrapper = mountDialogTrigger();

    await wrapper.get("button").trigger("click");
    await flushOverlay();
    const overlay = document.body.querySelector("[data-testid=\"modal\"]");
    expect(overlay).not.toBeNull();

    overlay?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();

    wrapper.unmount();
  });

  it("triggers a modal instead of a popover on mobile", async () => {
    const restore = mockMatchMedia(true);
    const wrapper = mountDialogTrigger({
      type: "popover",
    });

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();
      expect(document.body.querySelector("[data-testid=\"popover\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      restore();
    }
  });

  it("triggers a tray instead of a popover on mobile when mobileType is tray", async () => {
    const restore = mockMatchMedia(true);
    const wrapper = mountDialogTrigger({
      type: "popover",
      mobileType: "tray",
    });

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      expect(document.body.querySelector("[data-testid=\"tray\"]")).not.toBeNull();
      expect(document.body.querySelector("[data-testid=\"popover\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      restore();
    }
  });

  it.each(["modal", "popover", "tray"] as const)(
    "contains focus within the dialog when rendered as %s",
    async (type) => {
      const wrapper = mount(DialogTrigger, {
        attachTo: document.body,
        props: {
          type,
        },
        slots: {
          default: () => [
            h("button", { type: "button" }, "Trigger"),
            h(Dialog, null, () => [
              h("input", { "data-testid": "input1" }),
              h("input", { "data-testid": "input2" }),
            ]),
          ],
        },
      });

      try {
        await wrapper.get("button").trigger("click");
        await flushOverlay();

        const dialog = document.body.querySelector("[role=\"dialog\"]") as HTMLElement;
        const input1 = document.body.querySelector(
          "[data-testid=\"input1\"]"
        ) as HTMLInputElement;
        const input2 = document.body.querySelector(
          "[data-testid=\"input2\"]"
        ) as HTMLInputElement;

        expect(document.activeElement).toBe(dialog);

        (document.activeElement as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
        );
        await flushOverlay();
        expect(document.activeElement).toBe(input1);

        (document.activeElement as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
        );
        await flushOverlay();
        expect(document.activeElement).toBe(input2);

        (document.activeElement as HTMLElement).dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true })
        );
        await flushOverlay();
        expect(document.activeElement).toBe(input1);
      } finally {
        wrapper.unmount();
      }
    }
  );

  it("forces dismissable modal behavior for popover mobile fallback", async () => {
    const restore = mockMatchMedia(true);
    const wrapper = mountDialogTrigger({
      type: "popover",
      isDismissable: false,
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      restore();
    }
  });

  it("dismissable modals close when clicking outside", async () => {
    const wrapper = mountDialogTrigger({
      type: "modal",
      isDismissable: true,
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("non-dismissable modals do not close when clicking outside", async () => {
    const wrapper = mountDialogTrigger({
      type: "modal",
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("non-modal popovers close on outside click even when isDismissable is false", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
      isDismissable: false,
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[data-testid=\"popover\"]")).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("popover trigger toggles open and close when pressed twice", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
    });

    try {
      const trigger = wrapper.get("button");
      await trigger.trigger("click");
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();

      await trigger.trigger("click");
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("supports controlled open state via isOpen and onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const ControlledHarness = defineComponent({
      setup() {
        const isOpen = ref(false);
        const handleOpenChange = (nextOpen: boolean): void => {
          onOpenChange(nextOpen);
          isOpen.value = nextOpen;
        };

        return () =>
          h(
            DialogTrigger,
            {
              type: "popover",
              isOpen: isOpen.value,
              onOpenChange: handleOpenChange,
            },
            {
              default: () => [
                h("button", { type: "button" }, "Trigger"),
                h(Dialog, null, () => "contents"),
              ],
            }
          );
      },
    });

    const wrapper = mount(ControlledHarness, {
      attachTo: document.body,
    });

    try {
      const trigger = wrapper.get("button");
      await trigger.trigger("click");
      await flushOverlay();
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();

      await trigger.trigger("click");
      await flushOverlay();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("supports uncontrolled defaultOpen", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();

      await wrapper.get("button").trigger("click");
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("does not close via escape when keyboard dismiss is disabled", async () => {
    const wrapper = mountDialogTrigger({
      type: "modal",
      defaultOpen: true,
      isKeyboardDismissDisabled: true,
    });

    try {
      await flushOverlay();
      const overlay = document.body.querySelector("[data-testid=\"modal\"]");
      expect(overlay).not.toBeNull();

      overlay?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("can be closed by a custom button using injected close callback", async () => {
    const ClosableDialog = defineComponent({
      name: "ClosableDialog",
      props: {
        close: {
          type: Function as PropType<(() => void) | undefined>,
          default: undefined,
        },
      },
      setup(props) {
        return () =>
          h(Dialog, null, () =>
            h(
              "button",
              {
                type: "button",
                onClick: () => {
                  props.close?.();
                },
              },
              "Close"
            )
          );
      },
    });

    const wrapper = mount(DialogTrigger, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("button", { type: "button" }, "Trigger"),
          h(ClosableDialog),
        ],
      },
    });

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();

      const closeButton = Array.from(document.body.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Close"
      );
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("restores focus to trigger when closed from hidden dismiss button", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
    });

    try {
      const trigger = wrapper.get("button").element as HTMLButtonElement;
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      const dismissButtons = document.body.querySelectorAll(
        "button[aria-label=\"Dismiss\"]"
      );
      expect(dismissButtons.length).toBeGreaterThan(0);

      (dismissButtons[0] as HTMLButtonElement).click();
      await flushOverlay();

      expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      wrapper.unmount();
    }
  });

  it("renders overlays in a custom portal container", async () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.append(customContainer);

    const wrapper = mountDialogTrigger({
      type: "popover",
      container: customContainer,
    });

    try {
      await wrapper.get("button").trigger("click");
      await flushOverlay();

      const dialog = document.body.querySelector("[role=\"dialog\"]");
      expect(dialog).not.toBeNull();
      expect(dialog?.closest("[data-testid=\"custom-container\"]")).toBe(customContainer);
    } finally {
      wrapper.unmount();
      customContainer.remove();
    }
  });

  it("warns when unmounting while a non-popover dialog is open", async () => {
    const wrapper = mountDialogTrigger({
      type: "modal",
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
      expect(warnMock).toHaveBeenCalledWith(
        "A DialogTrigger unmounted while open. This is likely due to being placed within a trigger that unmounts or inside a conditional. Consider using a DialogContainer instead."
      );
    }
  });
});
