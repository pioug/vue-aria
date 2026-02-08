import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideI18n, useLocale } from "../src";

describe("useLocale", () => {
  it("returns default locale when no provider is present", () => {
    const values: Array<{ locale: string; direction: string }> = [];

    const App = defineComponent({
      setup() {
        const locale = useLocale();
        values.push(locale.value);
        return () => h("div");
      },
    });

    mount(App);

    expect(values[0]?.locale).toBeTruthy();
    expect(["ltr", "rtl"]).toContain(values[0]?.direction);
  });

  it("uses provided locale and inferred text direction", () => {
    const values: Array<{ locale: string; direction: string }> = [];

    const Child = defineComponent({
      setup() {
        values.push(useLocale().value);
        return () => h("div");
      },
    });

    const App = defineComponent({
      setup() {
        provideI18n({ locale: "ar-EG" });
        return () => h(Child);
      },
    });

    mount(App);

    expect(values[0]).toEqual({
      locale: "ar-EG",
      direction: "rtl",
    });
  });

  it("supports nested providers and explicit direction overrides", () => {
    const values: Record<string, { locale: string; direction: string }> = {};

    const NestedDefault = defineComponent({
      setup() {
        values.default = useLocale().value;
        return () => h("div");
      },
    });

    const NestedOverride = defineComponent({
      setup() {
        provideI18n({ locale: "ar-EG", direction: "ltr" });
        const Reader = defineComponent({
          setup() {
            values.override = useLocale().value;
            return () => h("div");
          },
        });
        return () => h(Reader);
      },
    });

    const App = defineComponent({
      setup() {
        provideI18n({ locale: "fr-FR" });
        return () => h("div", [h(NestedDefault), h(NestedOverride)]);
      },
    });

    mount(App);

    expect(values.default).toEqual({
      locale: "fr-FR",
      direction: "ltr",
    });

    expect(values.override).toEqual({
      locale: "ar-EG",
      direction: "ltr",
    });
  });
});
