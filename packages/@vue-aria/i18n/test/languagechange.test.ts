import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { I18nProvider, useLocale } from "../src/context";

const TestComponent = defineComponent({
  setup() {
    const locale = useLocale();

    return () => h("div", [
      h("div", { "data-testid": "locale" }, locale.value.locale),
      h("div", { "data-testid": "direction" }, locale.value.direction),
    ]);
  },
});

function languageProps(language: string) {
  return {
    value: language,
    writable: true,
    configurable: true,
  };
}

describe("useLocale languagechange", () => {
  it("updates locale when languagechange is triggered", async () => {
    Object.defineProperty(window.navigator, "language", languageProps("en-US"));

    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, null, { default: () => h(TestComponent) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.find('[data-testid="locale"]').text()).toBe("en-US");

    Object.defineProperty(window.navigator, "language", languageProps("pt-PT"));
    window.dispatchEvent(new Event("languagechange"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="locale"]').text()).toBe("pt-PT");
    expect(wrapper.find('[data-testid="direction"]').text()).toBe("ltr");
  });

  it("keeps explicit provider locale despite languagechange", async () => {
    Object.defineProperty(window.navigator, "language", languageProps("en-US"));

    const App = defineComponent({
      setup() {
        return () => h(I18nProvider, { locale: "fr-FR" }, { default: () => h(TestComponent) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.find('[data-testid="locale"]').text()).toBe("fr-FR");

    Object.defineProperty(window.navigator, "language", languageProps("ja-JP"));
    window.dispatchEvent(new Event("languagechange"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="locale"]').text()).toBe("fr-FR");
  });
});
