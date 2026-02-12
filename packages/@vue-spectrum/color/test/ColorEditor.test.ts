import { render } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorEditor } from "../src";

describe("ColorEditor", () => {
  it("renders default localized control labels", () => {
    const tree = render(ColorEditor, {
      props: {
        defaultValue: "#ff0000",
        showAlpha: true,
      },
    });

    expect(tree.getByRole("application", { name: "Color area" })).toBeTruthy();
    expect(tree.getByRole("slider", { name: "Hue" })).toBeTruthy();
    expect(tree.getByRole("slider", { name: "Alpha" })).toBeTruthy();
    expect(tree.getByRole("textbox", { name: "Hex" })).toBeTruthy();
  });

  it("localizes default labels from i18n locale", () => {
    const App = defineComponent({
      name: "ColorEditorLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorEditor, {
            defaultValue: "#ff0000",
            showAlpha: true,
          });
      },
    });

    const tree = render(App);
    expect(tree.getByRole("application", { name: "Zone de couleur" })).toBeTruthy();
    expect(tree.getByRole("slider", { name: "Teinte" })).toBeTruthy();
    expect(tree.getByRole("slider", { name: "Alpha" })).toBeTruthy();
    expect(tree.getByRole("textbox", { name: "Hex" })).toBeTruthy();
  });
});
