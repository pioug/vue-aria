import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { useHasChild } from "../src/useHasChild";

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

describe("useHasChild", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns true when a matching descendant exists", async () => {
    const Probe = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null);
        const hasChild = useHasChild(".target", rootRef);
        return () =>
          h("div", { ref: rootRef, "data-testid": "root", "data-has-child": String(hasChild.value) }, [
            h("span", { class: "target" }),
          ]);
      },
    });

    const { container, unmount } = mount(Probe);
    await nextTick();

    const root = container.querySelector('[data-testid="root"]') as HTMLElement | null;
    expect(root?.dataset.hasChild).toBe("true");
    unmount();
  });

  it("returns false when no matching descendant exists", async () => {
    const Probe = defineComponent({
      setup() {
        const rootRef = ref<HTMLElement | null>(null);
        const hasChild = useHasChild(".target", rootRef);
        return () =>
          h("div", { ref: rootRef, "data-testid": "root", "data-has-child": String(hasChild.value) }, [
            h("span", { class: "other" }),
          ]);
      },
    });

    const { container, unmount } = mount(Probe);
    await nextTick();

    const root = container.querySelector('[data-testid="root"]') as HTMLElement | null;
    expect(root?.dataset.hasChild).toBe("false");
    unmount();
  });
});
