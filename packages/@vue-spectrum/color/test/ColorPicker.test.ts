import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorPicker } from "../src";

describe("ColorPicker", () => {
  it("opens the dialog and emits color changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const tree = render(ColorPicker, {
      props: {
        label: "Fill",
        defaultValue: "#f00",
        onChange,
      },
    });

    const button = tree.getByRole("button");
    expect(tree.getByRole("img", { name: "Selected color" })).toBeTruthy();
    await user.click(button);

    const dialog = tree.getByRole("dialog");
    expect(dialog).toBeTruthy();

    const input = within(dialog).getByRole("textbox") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "00ff00");
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("#00FF00");

    await user.keyboard("{Escape}");
    expect(tree.queryByRole("dialog")).toBeNull();
  });

  it("localizes default swatch label from i18n locale", () => {
    const App = defineComponent({
      name: "ColorPickerLocalizedSwatchHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorPicker, {
            label: "Fill",
            defaultValue: "#f00",
          });
      },
    });

    const tree = render(App);
    expect(tree.getByRole("img", { name: "Couleur sélectionnée" })).toBeTruthy();
  });
});
