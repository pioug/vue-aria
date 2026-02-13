import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useLabel } from "../src";

describe("useLabel", () => {
  it("returns props for visible label", () => {
    const scope = effectScope();
    const { labelProps, fieldProps } = scope.run(() => useLabel({ label: "Test" }))!;

    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
    expect(labelProps.id).toBe(fieldProps["aria-labelledby"]);
    expect(labelProps.htmlFor).toBe(fieldProps.id);
    expect(labelProps.id).not.toBe(fieldProps.id);

    scope.stop();
  });

  it("combines aria-labelledby when visible label is provided", () => {
    const scope = effectScope();
    const { labelProps, fieldProps } = scope.run(() =>
      useLabel({ label: "Test", "aria-labelledby": "foo" })
    )!;

    expect(fieldProps["aria-labelledby"]).toBe(`${labelProps.id} foo`);

    scope.stop();
  });

  it("works without visible label when aria-label is provided", () => {
    const scope = effectScope();
    const { labelProps, fieldProps } = scope.run(() => useLabel({ "aria-label": "Label" }))!;

    expect(labelProps.id).toBeUndefined();
    expect(labelProps.htmlFor).toBeUndefined();
    expect(fieldProps["aria-label"]).toBe("Label");

    scope.stop();
  });

  it("warns if no visible label or aria labels are provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const scope = effectScope();
    scope.run(() => useLabel({}));

    expect(warn).toHaveBeenCalledWith(
      "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );

    warn.mockRestore();
    scope.stop();
  });

  it("does not return htmlFor when label element type is not label", () => {
    const scope = effectScope();
    const { labelProps } = scope.run(() =>
      useLabel({ label: "Test", labelElementType: "span" })
    )!;

    expect(labelProps.htmlFor).toBeUndefined();

    scope.stop();
  });
});
