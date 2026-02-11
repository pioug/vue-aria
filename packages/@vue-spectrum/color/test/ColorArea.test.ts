import { fireEvent, render } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { ColorArea } from "../src";

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
