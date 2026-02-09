import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { provideSpectrumProvider } from "@vue-spectrum/provider";
import { UIIcon } from "../src";
import type { SpectrumTheme } from "@vue-spectrum/provider";

const theme: SpectrumTheme = {
  global: { spectrum: "spectrum" },
  light: { "spectrum--light": "spectrum--light" },
  dark: { "spectrum--dark": "spectrum--dark" },
  medium: { "spectrum--medium": "spectrum--medium" },
  large: { "spectrum--large": "spectrum--large" },
};

function renderFakeIcon() {
  return h("svg", [h("path", { d: "M 10,150 L 70,10 L 130,150 z" })]);
}

const UIIconHarness = defineComponent({
  name: "UIIconHarness",
  props: {
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<boolean | "true" | "false" | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        UIIcon,
        {
          ariaLabel: props.label,
          ariaHidden: props.ariaHidden,
        },
        {
          default: () => [renderFakeIcon()],
        }
      );
  },
});

const ProviderUIIconHarness = defineComponent({
  name: "ProviderUIIconHarness",
  props: {
    scale: {
      type: String,
      default: "large",
    },
  },
  setup(props) {
    provideSpectrumProvider({
      theme,
      colorScheme: "light",
      scale: computed(() => props.scale),
    });

    return () =>
      h(UIIcon, null, {
        default: () => [renderFakeIcon()],
      });
  },
});

describe("UIIcon", () => {
  it("handles aria label defaults", async () => {
    const wrapper = mount(UIIconHarness, {
      props: {
        label: "labelled icon",
      },
    });

    let icon = wrapper.get("svg");
    expect(icon.attributes("focusable")).toBe("false");
    expect(icon.attributes("aria-label")).toBe("labelled icon");

    await wrapper.setProps({ label: undefined });
    icon = wrapper.get("svg");
    expect(icon.attributes("aria-label")).toBeUndefined();
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("supports aria-hidden override", async () => {
    const wrapper = mount(UIIconHarness, {
      props: {
        label: "explicitly hidden aria-label",
        ariaHidden: true,
      },
    });

    let icon = wrapper.get("svg");
    expect(icon.attributes("aria-label")).toBe("explicitly hidden aria-label");
    expect(icon.attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({
      label: "explicitly not hidden aria-label",
      ariaHidden: false,
    });

    icon = wrapper.get("svg");
    expect(icon.attributes("aria-label")).toBe("explicitly not hidden aria-label");
    expect(icon.attributes("aria-hidden")).toBeUndefined();
  });

  it("passes provider scale to icon child", () => {
    const wrapper = mount(ProviderUIIconHarness, {
      props: {
        scale: "large",
      },
    });

    expect(wrapper.get("svg").attributes("scale")).toBe("L");
  });
});
