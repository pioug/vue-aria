import { parseDate } from "@internationalized/date";
import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Calendar } from "../src";

describe("CalendarBase", () => {
  it("navigates visible month with previous and next controls", async () => {
    const user = userEvent.setup();
    const tree = render(Calendar, {
      props: {
        defaultValue: parseDate("2019-06-05"),
      },
    });

    const heading = tree.getByRole("heading", { level: 2 });
    expect(heading.textContent).toContain("2019-06");

    await user.click(tree.getByLabelText("Next"));
    expect(tree.getByRole("heading", { level: 2 }).textContent).toContain("2019-07");

    await user.click(tree.getByLabelText("Previous"));
    expect(tree.getByRole("heading", { level: 2 }).textContent).toContain("2019-06");
  });
});
