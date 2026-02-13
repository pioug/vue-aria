import { describe, expect, it } from "vitest";
import { useListBoxSection } from "../src/useListBoxSection";

describe("useListBoxSection", () => {
  it("returns heading and group props", () => {
    const { itemProps, headingProps, groupProps } = useListBoxSection({
      heading: "Section",
      "aria-label": "Section label",
    });

    expect(itemProps.role).toBe("presentation");
    expect(headingProps.role).toBe("presentation");
    expect(groupProps.role).toBe("group");
    expect(groupProps["aria-label"]).toBe("Section label");
    expect(typeof groupProps["aria-labelledby"]).toBe("string");
  });
});
