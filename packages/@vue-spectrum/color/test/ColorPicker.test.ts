import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
});
