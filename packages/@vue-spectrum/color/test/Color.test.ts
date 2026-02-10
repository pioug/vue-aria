import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatchPicker,
  ColorWheel,
  getColorChannels,
  parseColor,
} from "../src";

describe("color utilities", () => {
  it("parses supported color formats", () => {
    expect(parseColor("#abc")).toBe("#AABBCC");
    expect(parseColor("#00ff00")).toBe("#00FF00");
    expect(parseColor("rgb(255, 0, 0)")).toBe("#FF0000");
    expect(() => parseColor("bad-value")).toThrowError();
  });

  it("returns expected channel labels", () => {
    expect(getColorChannels("hex")).toEqual(["red", "green", "blue"]);
    expect(getColorChannels("rgb")).toEqual(["red", "green", "blue"]);
    expect(getColorChannels("hsl")).toEqual(["hue", "saturation", "lightness"]);
  });
});

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
});

describe("ColorArea", () => {
  it("emits a color when the area is clicked", () => {
    const onChange = vi.fn();

    const tree = render(ColorArea, {
      props: {
        value: "#ff0000",
        onChange,
      },
    });

    const area = tree.getByRole("application") as HTMLElement;
    vi.spyOn(area, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(area, {
      clientX: 100,
      clientY: 50,
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextColor = onChange.mock.calls[0]?.[0] as string;
    expect(nextColor.startsWith("#")).toBe(true);
  });
});

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
    await fireEvent.update(input, "240");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe("#0000FF");
  });
});

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
