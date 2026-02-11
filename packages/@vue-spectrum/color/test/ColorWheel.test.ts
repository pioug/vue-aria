import { fireEvent, render } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
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
    await fireEvent.update(input, "240");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe("#0000FF");
  });
});
