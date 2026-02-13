import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../src/context";
import { useNumberFormatter } from "../src/useNumberFormatter";

function languageProps(language: string) {
  return {
    value: language,
    writable: true,
    configurable: true,
  };
}

const NumberProbe = defineComponent({
  name: "NumberProbe",
  setup() {
    const formatter = useNumberFormatter();
    return () => h("div", { "data-testid": "formatted" }, formatter.format(1234.5));
  },
});

describe("i18n formatter reactivity", () => {
  it("updates formatted output when browser language changes", async () => {
    Object.defineProperty(window.navigator, "language", languageProps("en-US"));

    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, null, { default: () => h(NumberProbe) });
      },
    });

    const wrapper = mount(App);
    const initial = wrapper.find('[data-testid="formatted"]').text();

    Object.defineProperty(window.navigator, "language", languageProps("fr-FR"));
    window.dispatchEvent(new Event("languagechange"));
    await wrapper.vm.$nextTick();

    const updated = wrapper.find('[data-testid="formatted"]').text();
    expect(updated).not.toBe(initial);
  });
});
