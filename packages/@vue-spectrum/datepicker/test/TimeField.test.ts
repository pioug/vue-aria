import { parseTime } from "@internationalized/date";
import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "../src";

describe("TimeField", () => {
  it("renders with second granularity and emits parsed time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(TimeField, {
      props: {
        label: "Time",
        granularity: "second",
        defaultValue: parseTime("14:30:45"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"time\"]") as HTMLInputElement;
    expect(input.value).toBe("14:30:45");

    await user.click(input);
    await fireEvent.update(input, "09:15:30");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("09:15:30");
  });
});
