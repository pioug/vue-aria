import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideI18n, useLocalizedStringFormatter } from "../src";

const strings = {
  "en-US": {
    pending: "pending",
  },
  "fr-FR": {
    pending: "En attente",
  },
} as const;

describe("useLocalizedStringFormatter", () => {
  it("formats strings using default locale fallback", () => {
    const values: string[] = [];

    const App = defineComponent({
      setup() {
        const formatter = useLocalizedStringFormatter(strings);
        values.push(formatter.value.format("pending"));
        return () => h("div");
      },
    });

    mount(App);

    expect(values[0]).toBeTruthy();
  });

  it("updates formatting with provided locale", () => {
    const values: string[] = [];

    const Child = defineComponent({
      setup() {
        const formatter = useLocalizedStringFormatter(strings);
        values.push(formatter.value.format("pending"));
        return () => h("div");
      },
    });

    const App = defineComponent({
      setup() {
        provideI18n({ locale: "fr-FR" });
        return () => h(Child);
      },
    });

    mount(App);

    expect(values[0]).toBe("En attente");
  });
});
