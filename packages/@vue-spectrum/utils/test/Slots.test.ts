import { createApp, defineComponent, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClearSlots, cssModuleToSlots, SlotProvider, useSlotProps } from "../src/Slots";

function mount(component: unknown) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component as Parameters<typeof createApp>[0]);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("Slots utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("maps css module keys into slot props", () => {
    expect(cssModuleToSlots({ icon: "_icon", label: "_label" })).toEqual({
      icon: { UNSAFE_className: "_icon" },
      label: { UNSAFE_className: "_label" },
    });
  });

  it("merges slot props with local props", () => {
    const onSlotClick = vi.fn();
    const onLocalClick = vi.fn();
    const Probe = defineComponent({
      setup() {
        const merged = useSlotProps({
          slot: "action",
          id: "local-id",
          class: "local",
          onClick: () => onLocalClick(),
        });

        return () => h("button", { ...merged, "data-testid": "probe" }, "action");
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SlotProvider,
              {
                slots: {
                  action: {
                    class: "from-slot",
                    "data-slot": "yes",
                    onClick: () => onSlotClick(),
                  },
                },
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLButtonElement | null;
    expect(probe?.className).toContain("from-slot");
    expect(probe?.className).toContain("local");
    expect(probe?.dataset.slot).toBe("yes");
    expect(probe?.id).toBe("local-id");

    probe?.click();
    expect(onSlotClick).toHaveBeenCalledTimes(1);
    expect(onLocalClick).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("allows clearing inherited slot context", () => {
    const Probe = defineComponent({
      setup() {
        const merged = useSlotProps({
          slot: "action",
          class: "local",
        });

        return () => h("button", { ...merged, "data-testid": "probe" }, "action");
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              SlotProvider,
              {
                slots: {
                  action: {
                    class: "parent",
                    "data-parent": "true",
                  },
                },
              },
              () => h(ClearSlots, null, () => h(Probe))
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLButtonElement | null;
    expect(probe?.className).toContain("local");
    expect(probe?.className).not.toContain("parent");
    expect(probe?.dataset.parent).toBeUndefined();
    unmount();
  });
});
