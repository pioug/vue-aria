import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useListState } from "@vue-aria/list-state";
import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
import { defineComponent, h, nextTick, ref } from "vue";
import { useActionGroup } from "../src";

describe("useActionGroup", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => {
      const ref = { current: null as Element | null };
      const state = useListState(props as any);
      return useActionGroup(props as any, state as any, ref);
    })!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const { actionGroupProps } = run({});
    expect(actionGroupProps.role).toBe("toolbar");
  });

  it("handles vertical orientation", () => {
    const { actionGroupProps } = run({ orientation: "vertical" });
    expect(actionGroupProps["aria-orientation"]).toBe("vertical");
  });

  it("handles selection mode none", () => {
    const { actionGroupProps } = run({ selectionMode: "none" });
    expect(actionGroupProps.role).toBe("toolbar");
    expect(actionGroupProps["aria-orientation"]).toBe("horizontal");
  });

  it("handles selection mode single", () => {
    const { actionGroupProps } = run({ selectionMode: "single" });
    expect(actionGroupProps.role).toBe("radiogroup");
  });

  it("handles selection mode multiple", () => {
    const { actionGroupProps } = run({ selectionMode: "multiple" });
    expect(actionGroupProps.role).toBe("toolbar");
    expect(actionGroupProps["aria-orientation"]).toBe("horizontal");
  });

  it("handles isDisabled", () => {
    const { actionGroupProps } = run({ isDisabled: true });
    expect(actionGroupProps["aria-disabled"]).toBeTruthy();
  });

  it("moves focus to the next item on ArrowRight in LTR", async () => {
    const Probe = defineComponent({
      setup() {
        const groupRef = ref<HTMLElement | null>(null);
        const state = useListState({
          selectionMode: "none",
          items: [{ id: "a" }, { id: "b" }, { id: "c" }],
          getKey: (item: { id: string }) => item.id,
        });
        const refAdapter = {
          get current() {
            return groupRef.value;
          },
          set current(value: Element | null) {
            groupRef.value = value as HTMLElement | null;
          },
        };
        const { actionGroupProps } = useActionGroup({ selectionMode: "none" }, state, refAdapter);
        return () =>
          h("div", { "data-testid": "group", ref: groupRef, ...actionGroupProps }, [
            h("button", { id: "a" }, "A"),
            h("button", { id: "b" }, "B"),
            h("button", { id: "c" }, "C"),
          ]);
      },
    });

    const wrapper = mount(Probe, { attachTo: document.body });
    await nextTick();

    const buttons = wrapper.findAll("button").map((button) => button.element as HTMLButtonElement);
    buttons[1].focus();
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    buttons[1].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[2]);
    wrapper.unmount();
  });

  it("flips horizontal ArrowRight behavior in RTL locales", async () => {
    const Probe = defineComponent({
      setup() {
        const groupRef = ref<HTMLElement | null>(null);
        const state = useListState({
          selectionMode: "none",
          items: [{ id: "a" }, { id: "b" }, { id: "c" }],
          getKey: (item: { id: string }) => item.id,
        });
        const refAdapter = {
          get current() {
            return groupRef.value;
          },
          set current(value: Element | null) {
            groupRef.value = value as HTMLElement | null;
          },
        };
        const { actionGroupProps } = useActionGroup({ selectionMode: "none" }, state, refAdapter);
        return () =>
          h("div", { "data-testid": "group", ref: groupRef, ...actionGroupProps }, [
            h("button", { id: "a" }, "A"),
            h("button", { id: "b" }, "B"),
            h("button", { id: "c" }, "C"),
          ]);
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, { locale: "ar-AE" }, { default: () => h(Probe) });
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await nextTick();

    const buttons = wrapper.findAll("button").map((button) => button.element as HTMLButtonElement);
    buttons[1].focus();
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    buttons[1].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
    wrapper.unmount();
  });

  it("uses role=group when nested in a toolbar", async () => {
    const Probe = defineComponent({
      setup() {
        const groupRef = ref<HTMLElement | null>(null);
        const state = useListState({
          selectionMode: "none",
          items: [{ id: "a" }],
          getKey: (item: { id: string }) => item.id,
        });
        const refAdapter = {
          get current() {
            return groupRef.value;
          },
          set current(value: Element | null) {
            groupRef.value = value as HTMLElement | null;
          },
        };
        const { actionGroupProps } = useActionGroup({ selectionMode: "none" }, state, refAdapter);
        return () =>
          h("div", { role: "toolbar" }, [
            h("div", { "data-testid": "group", ref: groupRef, ...actionGroupProps }, [
              h("button", { id: "a" }, "A"),
            ]),
          ]);
      },
    });

    const wrapper = mount(Probe, { attachTo: document.body });
    await nextTick();

    expect(wrapper.get('[data-testid="group"]').attributes("role")).toBe("group");
    wrapper.unmount();
  });
});
