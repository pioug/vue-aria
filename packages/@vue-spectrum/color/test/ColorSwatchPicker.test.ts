import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorSwatchPicker } from "../src";

describe("ColorSwatchPicker", () => {
  it("renders swatches and supports pointer/keyboard selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();

    const tree = render(ColorSwatchPicker, {
      props: {
        items: [
          { key: "red", color: "#f00" },
          { key: "green", color: "#0f0" },
          { key: "blue", color: "#00f" },
        ],
        defaultSelectedKey: "green",
        onChange,
        onSelectionChange,
      },
    });

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");

    await user.click(options[2] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith("#0000FF");
    expect(onSelectionChange).toHaveBeenCalledWith("blue");

    options[0]?.focus();
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");
    expect(onSelectionChange).toHaveBeenLastCalledWith("green");
  });
});
