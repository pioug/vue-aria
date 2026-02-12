import { fireEvent, render } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorWheel } from "../src";

describe("ColorWheel", () => {
  it("updates hue from slider input", async () => {
    const onChange = vi.fn();

    const tree = render(ColorWheel, {
      props: {
        value: "#ff0000",
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"range\"]") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Hue");
    expect(tree.container.querySelector('[aria-label="Hue thumb"]')).not.toBeNull();
    await fireEvent.update(input, "240");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe("#0000FF");
  });

  it("localizes default labels from i18n locale", () => {
    const App = defineComponent({
      name: "ColorWheelLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorWheel, {
            value: "#ff0000",
          });
      },
    });

    const tree = render(App);
    const input = tree.container.querySelector("input[type=\"range\"]");
    expect(input?.getAttribute("aria-label")).toBe("Teinte");
    expect(tree.container.querySelector('[aria-label="Curseur de teinte"]')).not.toBeNull();
  });
});
