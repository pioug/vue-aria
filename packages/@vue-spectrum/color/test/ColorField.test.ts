import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

    await user.clear(input);
    await user.type(input, "00ff00");
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("#00FF00");
  });
});
