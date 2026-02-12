import { fireEvent, render } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorSlider } from "../src";

describe("ColorSlider", () => {
  it("emits updated numeric values", async () => {
    const onChange = vi.fn();

    const tree = render(ColorSlider, {
      props: {
        label: "Hue",
        channel: "hue",
        defaultValue: 10,
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"range\"]") as HTMLInputElement;
    await fireEvent.update(input, "30");

    expect(onChange).toHaveBeenCalledWith(30);
  });

  it("uses localized channel label defaults", () => {
    const tree = render(ColorSlider, {
      props: {
        channel: "hue",
        defaultValue: 10,
      },
    });

    expect(tree.getByRole("slider", { name: "Hue" })).toBeTruthy();
  });

  it("localizes default labels from i18n locale", () => {
    const App = defineComponent({
      name: "ColorSliderLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorSlider, {
            channel: "hue",
            defaultValue: 10,
          });
      },
    });

    const tree = render(App);
    expect(tree.getByRole("slider", { name: "Teinte" })).toBeTruthy();
  });
});
