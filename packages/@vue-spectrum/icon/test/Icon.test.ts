import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { provideSpectrumProvider } from "@vue-spectrum/provider";
import { Icon } from "../src";
import type { IconSize } from "../src";
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

const IconHarness = defineComponent({
  name: "IconHarness",
  props: {
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<boolean | "true" | "false" | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<IconSize | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        Icon,
        {
          ariaLabel: props.label,
          ariaHidden: props.ariaHidden,
          size: props.size,
        },
        {
          default: () => [renderFakeIcon()],
        }
      );
  },
});

const ProviderIconHarness = defineComponent({
  name: "ProviderIconHarness",
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
      h(Icon, null, {
        default: () => [renderFakeIcon()],
      });
  },
});

describe("Icon", () => {
  it("handles aria label semantics", async () => {
    const wrapper = mount(IconHarness, {
      props: {
        label: "workflow icon",
      },
    });

    let icon = wrapper.get("svg");
    expect(icon.attributes("focusable")).toBe("false");
    expect(icon.attributes("aria-label")).toBe("workflow icon");
    expect(icon.attributes("role")).toBe("img");

    await wrapper.setProps({ label: undefined });
    icon = wrapper.get("svg");
    expect(icon.attributes("aria-label")).toBeUndefined();
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("supports explicit size", () => {
    const wrapper = mount(IconHarness, {
      props: {
        size: "XL",
      },
    });

    expect(wrapper.get("svg").classes()).toContain("spectrum-Icon--sizeXL");
  });

  it("supports aria-hidden override", async () => {
    const wrapper = mount(IconHarness, {
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

  it("derives size from provider scale when no explicit size is provided", () => {
    const wrapper = mount(ProviderIconHarness, {
      props: {
        scale: "large",
      },
    });

    expect(wrapper.get("svg").classes()).toContain("spectrum-Icon--sizeL");
  });
});
