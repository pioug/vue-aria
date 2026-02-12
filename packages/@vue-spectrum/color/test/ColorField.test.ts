import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorField } from "../src";

describe("ColorField", () => {
  it("renders with normalized default value and commits typed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const tree = render(ColorField, {
      props: {
        label: "Primary Color",
        defaultValue: "#abc",
        onChange,
      },
    });

    const input = tree.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("#AABBCC");
    expect(tree.getByRole("img", { name: "Selected color" })).toBeTruthy();

    await user.clear(input);
    await user.type(input, "00ff00");
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("#00FF00");
  });

  it("localizes default swatch label from i18n locale", () => {
    const App = defineComponent({
      name: "ColorFieldLocalizedSwatchHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorField, {
            label: "Primary Color",
            defaultValue: "#abc",
          });
      },
    });

    const tree = render(App);
    expect(tree.getByRole("img", { name: "Couleur sélectionnée" })).toBeTruthy();
  });
});
