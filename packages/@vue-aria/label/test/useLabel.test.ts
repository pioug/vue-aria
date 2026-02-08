import { describe, expect, it, vi } from "vitest";
import { useLabel } from "../src/useLabel";

describe("useLabel", () => {
  it("returns props for visible label", () => {
    const { labelProps, fieldProps } = useLabel({ label: "Test" });

    expect(labelProps.value.id).toBeDefined();
    expect(fieldProps.value.id).toBeDefined();
    expect(labelProps.value.id).toBe(fieldProps.value["aria-labelledby"]);
    expect(labelProps.value.htmlFor).toBe(fieldProps.value.id);
    expect(labelProps.value.id).not.toBe(fieldProps.value.id);
  });

  it("combines aria-labelledby when visible label is provided", () => {
    const { labelProps, fieldProps } = useLabel({
      label: "Test",
      "aria-labelledby": "foo",
    });

    expect(fieldProps.value["aria-labelledby"]).toBe(`${labelProps.value.id} foo`);
    expect(labelProps.value.htmlFor).toBe(fieldProps.value.id);
  });

  it("combines aria-labelledby when visible label and aria-label are provided", () => {
    const { labelProps, fieldProps } = useLabel({
      label: "Test",
      "aria-labelledby": "foo",
      "aria-label": "aria",
    });

    expect(fieldProps.value["aria-label"]).toBe("aria");
    expect(fieldProps.value["aria-labelledby"]).toBe(
      `${fieldProps.value.id} ${labelProps.value.id} foo`
    );
  });

  it("works without a visible label", () => {
    const { labelProps, fieldProps } = useLabel({ "aria-label": "Label" });

    expect(labelProps.value.id).toBeUndefined();
    expect(labelProps.value.htmlFor).toBeUndefined();
    expect(fieldProps.value.id).toBeDefined();
    expect(fieldProps.value["aria-labelledby"]).toBeUndefined();
    expect(fieldProps.value["aria-label"]).toBe("Label");
  });

  it("works without a visible label and with both aria-label and aria-labelledby", () => {
    const { labelProps, fieldProps } = useLabel({
      "aria-label": "Label",
      "aria-labelledby": "foo",
    });

    expect(labelProps.value.id).toBeUndefined();
    expect(labelProps.value.htmlFor).toBeUndefined();
    expect(fieldProps.value.id).toBeDefined();
    expect(fieldProps.value["aria-labelledby"]).toBe(`${fieldProps.value.id} foo`);
    expect(fieldProps.value["aria-label"]).toBe("Label");
  });

  it("warns when no visible label or aria labels are provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { fieldProps } = useLabel({});
    // Force computed evaluation.
    void fieldProps.value;
    expect(spyWarn).toHaveBeenCalledWith(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    spyWarn.mockRestore();
  });

  it("does not return htmlFor when label element type is not label", () => {
    const { labelProps, fieldProps } = useLabel({
      label: "Test",
      labelElementType: "span",
    });

    expect(labelProps.value.id).toBeDefined();
    expect(fieldProps.value.id).toBeDefined();
    expect(labelProps.value.id).toBe(fieldProps.value["aria-labelledby"]);
    expect(labelProps.value.htmlFor).toBeUndefined();
  });
});
