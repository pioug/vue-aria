import { describe, expect, it } from "vitest";
import { useLabels } from "../src/useLabels";

describe("useLabels", () => {
  it("adds default label when neither aria-label nor aria-labelledby are present", () => {
    const props = useLabels({}, "Default label");
    expect(props["aria-label"]).toBe("Default label");
    expect(typeof props.id).toBe("string");
  });

  it("combines self id and labelledby when both label inputs are present", () => {
    const props = useLabels({ "aria-label": "Name", "aria-labelledby": "external-id" });
    expect(props["aria-labelledby"]).toContain("external-id");
    expect(props["aria-labelledby"]).toContain(props.id as string);
  });
});
