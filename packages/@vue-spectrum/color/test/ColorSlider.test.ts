import { fireEvent, render } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
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
});
