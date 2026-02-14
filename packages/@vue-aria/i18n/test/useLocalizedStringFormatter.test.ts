import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { useLocalizedStringFormatter } from "../src/useLocalizedStringFormatter";

const messages = {
  "en-US": {
    greeting: "Hello {name}",
    fallback: "Range: {start} to {end}",
  },
} as const;

const FormatterProbe = defineComponent({
  name: "LocalizedStringFormatterProbe",
  setup() {
    const formatter = useLocalizedStringFormatter(messages);
    return () => h("div", { "data-testid": "value" }, formatter.format("greeting", { name: "Ada" }));
  },
});

const FallbackProbe = defineComponent({
  name: "LocalizedStringFallbackProbe",
  setup() {
    const formatter = useLocalizedStringFormatter(messages);
    return () =>
      h(
        "div",
        { "data-testid": "value" },
        formatter.format("fallback", {
          start: "June 10",
        } as Record<string, unknown>)
      );
  },
});

describe("useLocalizedStringFormatter", () => {
  it("interpolates named variables in localized string messages", () => {
    const wrapper = mount(FormatterProbe);
    expect(wrapper.get('[data-testid="value"]').text()).toBe("Hello Ada");
  });

  it("preserves unresolved placeholders when variables are missing", () => {
    const wrapper = mount(FallbackProbe);
    expect(wrapper.get('[data-testid="value"]').text()).toBe("Range: June 10 to {end}");
  });
});
