import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPECTRUM_THEME_CLASS_MAP,
  provideSpectrumProvider,
} from "@vue-spectrum/provider";
import { Form, useFormProps, type SpectrumLabelableProps } from "../src";

const Reader = defineComponent({
  name: "Reader",
  setup() {
    const props = useFormProps<Record<string, unknown> & SpectrumLabelableProps>({
      labelPosition: "top",
    });

    return () =>
      h("output", {
        "data-testid": "reader",
        "data-label-position": props.labelPosition,
        "data-label-align": props.labelAlign,
        "data-necessity-indicator": props.necessityIndicator,
        "data-validation-behavior": props.validationBehavior,
      });
  },
});

const App = defineComponent({
  name: "App",
  setup() {
    provideSpectrumProvider({
      theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
      colorScheme: "light",
      scale: "medium",
    });

    return () =>
      h(
        Form,
        {
          labelPosition: "side",
          labelAlign: "end",
          necessityIndicator: "label",
          validationBehavior: "native",
        },
        {
          default: () => [h(Reader)],
        }
      );
  },
});

describe("useFormProps", () => {
  it("merges form context and allows child overrides", () => {
    const wrapper = mount(App);
    const reader = wrapper.get('[data-testid="reader"]');

    expect(reader.attributes("data-label-position")).toBe("top");
    expect(reader.attributes("data-label-align")).toBe("end");
    expect(reader.attributes("data-necessity-indicator")).toBe("label");
    expect(reader.attributes("data-validation-behavior")).toBe("native");
  });
});
