import { parseDate } from "@internationalized/date";
import { fireEvent, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "../src";

describe("DateField", () => {
  it("renders with default value and emits parsed date on input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tree = render(DateField, {
      props: {
        label: "Date",
        defaultValue: parseDate("2019-06-05"),
        onChange,
      },
    });

    const input = tree.container.querySelector("input[type=\"date\"]") as HTMLInputElement;
    expect(input.value).toBe("2019-06-05");

    await user.click(input);
    await fireEvent.update(input, "2019-06-17");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString()).toBe("2019-06-17");
  });
});
