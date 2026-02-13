import { describe, expect, it } from "vitest";
import { useMenuSection } from "../src/useMenuSection";

describe("useMenuSection", () => {
  it("returns presentation wrapper and labeled group props", () => {
    const { itemProps, headingProps, groupProps } = useMenuSection({
      heading: "Actions",
      "aria-label": "Action group",
    });

    expect(itemProps.role).toBe("presentation");
    expect(headingProps.role).toBe("presentation");
    expect(groupProps.role).toBe("group");
    expect(groupProps["aria-label"]).toBe("Action group");
    expect(groupProps["aria-labelledby"]).toBeTypeOf("string");
  });
});
