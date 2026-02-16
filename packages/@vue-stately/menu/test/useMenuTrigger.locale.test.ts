import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
import { defineComponent, h, ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useLongPressMock } = vi.hoisted(() => {
  return {
    useLongPressMock: vi.fn((_options?: unknown) => ({
      longPressProps: {
        onPressStart: vi.fn(),
        onPressEnd: vi.fn(),
      },
    })),
  };
});

vi.mock("@vue-aria/interactions", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/interactions")>(
    "@vue-aria/interactions"
  );
  return {
    ...actual,
    useLongPress: useLongPressMock,
  };
});

import { useMenuTrigger } from "../src/useMenuTrigger";

function createState() {
  return {
    isOpen: false,
    focusStrategy: null as "first" | "last" | null,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
  };
}

describe("useMenuTrigger locale integration", () => {
  beforeEach(() => {
    useLongPressMock.mockClear();
  });

  it("uses localized long-press accessibility description from i18n provider", () => {
    const state = createState();

    const Probe = defineComponent({
      setup() {
        const triggerRef = { current: null as Element | null };
        const localRef = ref<HTMLElement | null>(null);
        useMenuTrigger({ trigger: "longPress" }, state, triggerRef);
        return () => h("button", { ref: localRef });
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, { locale: "fr-FR" }, { default: () => h(Probe) });
      },
    });

    mount(App);
    const longPressOptions = useLongPressMock.mock.calls.at(-1)?.[0] as
      | { accessibilityDescription?: string }
      | undefined;
    expect(longPressOptions?.accessibilityDescription).toContain("Appuyez de manière prolongée");
  });
});
