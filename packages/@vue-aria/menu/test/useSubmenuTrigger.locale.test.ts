import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSubmenuTrigger } from "../src/useSubmenuTrigger";

function createState(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    isOpen: false,
    submenuLevel: 1,
    focusStrategy: null,
    open: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
    ...overrides,
  } as any;
}

function createProbe(state: any) {
  return defineComponent({
    setup() {
      const parentRef = ref<HTMLElement | null>(null);
      const triggerElementRef = ref<HTMLElement | null>(null);
      const submenuElementRef = ref<HTMLElement | null>(null);

      const parentMenuRef = {
        get current() {
          return parentRef.value;
        },
        set current(value: HTMLElement | null) {
          parentRef.value = value;
        },
      };

      const submenuRef = {
        get current() {
          return submenuElementRef.value;
        },
        set current(value: HTMLElement | null) {
          submenuElementRef.value = value;
        },
      };

      const triggerRef = {
        get current() {
          return triggerElementRef.value;
        },
        set current(value: HTMLElement | null) {
          triggerElementRef.value = value;
        },
      };

      const { submenuTriggerProps, submenuProps } = useSubmenuTrigger(
        {
          parentMenuRef: parentMenuRef as any,
          submenuRef: submenuRef as any,
        },
        state,
        triggerRef as any
      );

      const onTriggerKeyDown = (event: KeyboardEvent) => {
        submenuTriggerProps.onKeyDown(event as any);
      };

      const onSubmenuKeyDown = (event: KeyboardEvent) => {
        submenuProps.onKeyDown?.(event);
      };

      return () =>
        h("div", [
          h(
            "ul",
            {
              ref: parentRef,
            },
            [
              h(
                "li",
                {
                  ref: triggerElementRef,
                  tabIndex: -1,
                  "data-testid": "trigger",
                  onKeydown: onTriggerKeyDown,
                  onKeyDown: onTriggerKeyDown,
                },
                "Trigger"
              ),
            ]
          ),
          h(
            "ul",
            {
              ref: submenuElementRef,
              "data-testid": "submenu",
              onKeydown: onSubmenuKeyDown,
              onKeyDown: onSubmenuKeyDown,
            },
            [
              h(
                "li",
                {
                  tabIndex: -1,
                  "data-testid": "submenu-item",
                },
                "Sub item"
              ),
            ]
          ),
        ]);
    },
  });
}

describe("useSubmenuTrigger locale integration", () => {
  it("opens submenu on ArrowLeft in rtl", () => {
    const state = createState();
    const Probe = createProbe(state);
    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, { locale: "ar-AE" }, { default: () => h(Probe) });
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    const trigger = wrapper.get('[data-testid="trigger"]').element as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));

    expect(state.open).toHaveBeenCalledWith("first");

    wrapper.unmount();
  });

  it("closes submenu on ArrowRight from submenu in rtl and restores focus", () => {
    const state = createState({ isOpen: true });
    const Probe = createProbe(state);
    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, { locale: "ar-AE" }, { default: () => h(Probe) });
      },
    });

    const wrapper = mount(App, {
      attachTo: document.body,
    });

    const trigger = wrapper.get('[data-testid="trigger"]').element as HTMLElement;
    const submenuItem = wrapper.get('[data-testid="submenu-item"]').element as HTMLElement;
    submenuItem.focus();
    submenuItem.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(state.close).toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);

    wrapper.unmount();
  });
});
