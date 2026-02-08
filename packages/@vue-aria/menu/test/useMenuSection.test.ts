import { describe, expect, it } from "vitest";
import { useMenuSection } from "../src";

describe("useMenuSection", () => {
  it("returns section semantics with heading", () => {
    const section = useMenuSection({ heading: "File" });

    expect(section.itemProps.value.role).toBe("presentation");
    expect(section.headingProps.value.id).toBeTypeOf("string");
    expect(section.groupProps.value.role).toBe("group");
    expect(section.groupProps.value["aria-labelledby"]).toBe(section.headingProps.value.id);
  });

  it("supports aria-label when heading is absent", () => {
    const section = useMenuSection({ "aria-label": "Actions" });

    expect(section.headingProps.value.id).toBeUndefined();
    expect(section.groupProps.value["aria-label"]).toBe("Actions");
  });
});
