import { describe, expect, it, vi } from "vitest";
import { useListBoxSection } from "../src";

describe("useListBoxSection", () => {
  it("returns heading and group linkage when heading exists", () => {
    const section = useListBoxSection({
      heading: "Fruits",
    });

    expect(section.itemProps.value.role).toBe("presentation");
    expect(section.headingProps.value.role).toBe("presentation");
    expect(section.headingProps.value.id).toBeTypeOf("string");
    expect(section.groupProps.value.role).toBe("group");
    expect(section.groupProps.value["aria-labelledby"]).toBe(
      section.headingProps.value.id
    );
    expect(section.groupProps.value["aria-label"]).toBeUndefined();
  });

  it("returns aria-label group props without heading", () => {
    const section = useListBoxSection({
      "aria-label": "Vegetables",
    });

    expect(section.headingProps.value).toEqual({});
    expect(section.groupProps.value.role).toBe("group");
    expect(section.groupProps.value["aria-label"]).toBe("Vegetables");
    expect(section.groupProps.value["aria-labelledby"]).toBeUndefined();
  });

  it("prevents focus movement on heading mouse down", () => {
    const section = useListBoxSection({
      heading: "Fruits",
    });
    const preventDefault = vi.fn();

    (
      section.headingProps.value.onMouseDown as ((event: MouseEvent) => void)
    )({
      preventDefault,
    } as unknown as MouseEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
