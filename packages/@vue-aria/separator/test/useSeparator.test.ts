import { describe, expect, it } from "vitest";
import { useSeparator } from "../src/useSeparator";

describe("useSeparator", () => {
  it("returns separator role by default", () => {
    const { separatorProps } = useSeparator({});
    expect(separatorProps.value.role).toBe("separator");
    expect(separatorProps.value["aria-orientation"]).toBeUndefined();
  });

  it("sets vertical aria-orientation for vertical separators", () => {
    const { separatorProps } = useSeparator({ orientation: "vertical" });
    expect(separatorProps.value.role).toBe("separator");
    expect(separatorProps.value["aria-orientation"]).toBe("vertical");
  });

  it("does not add separator role for hr element", () => {
    const { separatorProps } = useSeparator({ elementType: "hr" });
    expect(separatorProps.value.role).toBeUndefined();
    expect(separatorProps.value["aria-orientation"]).toBeUndefined();
  });

  it("passes through labeling dom props", () => {
    const { separatorProps } = useSeparator({
      id: "sep-1",
      "aria-label": "Section Divider",
      "aria-labelledby": "sep-label",
    });
    expect(separatorProps.value.id).toBe("sep-1");
    expect(separatorProps.value["aria-label"]).toBe("Section Divider");
    expect(separatorProps.value["aria-labelledby"]).toBe("sep-label");
  });
});
