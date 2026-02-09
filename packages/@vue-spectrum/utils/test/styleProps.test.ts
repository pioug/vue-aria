import { describe, expect, it } from "vitest";
import { convertStyleProps, dimensionValue, viewStyleProps } from "../src";

describe("styleProps", () => {
  describe("dimensionValue", () => {
    it("converts numbers to pixel strings", () => {
      expect(dimensionValue(100)).toBe("100px");
    });

    it("returns undefined for falsy values", () => {
      expect(dimensionValue()).toBeUndefined();
    });

    it("passes through values with explicit units", () => {
      expect(dimensionValue("100px")).toBe("100px");
      expect(dimensionValue("100vh")).toBe("100vh");
    });

    it("maps spectrum dimension tokens", () => {
      expect(dimensionValue("size-100")).toBe(
        "var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100))"
      );
      expect(dimensionValue("static-size-100")).toBe(
        "var(--spectrum-global-dimension-static-size-100, var(--spectrum-alias-static-size-100))"
      );
      expect(dimensionValue("single-line-width")).toBe(
        "var(--spectrum-global-dimension-single-line-width, var(--spectrum-alias-single-line-width))"
      );
      expect(dimensionValue("single-line-height")).toBe(
        "var(--spectrum-global-dimension-single-line-height, var(--spectrum-alias-single-line-height))"
      );
    });

    it("maps spectrum tokens inside CSS functions", () => {
      expect(dimensionValue("calc(100px - size-100)")).toBe(
        "calc(100px - var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100)))"
      );
      expect(dimensionValue("min(100px, static-size-100)")).toBe(
        "min(100px, var(--spectrum-global-dimension-static-size-100, var(--spectrum-alias-static-size-100)))"
      );
      expect(
        dimensionValue("var(--custom-variable, calc(100% - single-line-width))")
      ).toBe(
        "var(--custom-variable, calc(100% - var(--spectrum-global-dimension-single-line-width, var(--spectrum-alias-single-line-width))))"
      );
    });
  });

  describe("backgroundColorValue", () => {
    it("returns undefined when responsive value has no matching breakpoint", () => {
      const style = convertStyleProps(
        { backgroundColor: { S: "gray-50" } },
        viewStyleProps,
        "ltr",
        ["base"]
      );
      expect(style.backgroundColor).toBeUndefined();
    });

    it("uses version 5 fallback syntax by default", () => {
      const style = convertStyleProps(
        { backgroundColor: { S: "gray-50" } },
        viewStyleProps,
        "ltr",
        ["base", "S"]
      );
      expect(style.backgroundColor).toBe(
        "var(--spectrum-alias-background-color-gray-50, var(--spectrum-legacy-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-background))))"
      );
    });

    it("uses version 6 syntax when colorVersion is 6", () => {
      const style = convertStyleProps(
        { backgroundColor: { S: "red-1400" }, colorVersion: 6 },
        viewStyleProps,
        "ltr",
        ["base", "S"]
      );
      expect(style.backgroundColor).toBe(
        "var(--spectrum-alias-background-color-red-1400, var(--spectrum-red-1400, var(--spectrum-semantic-red-1400-color-background)))"
      );
    });
  });

  describe("borderColorValue", () => {
    it("returns undefined when responsive value has no matching breakpoint", () => {
      const style = convertStyleProps(
        { borderColor: { S: "gray-50" } },
        viewStyleProps,
        "ltr",
        ["base"]
      );
      expect(style.borderColor).toBeUndefined();
    });

    it("supports default border color alias", () => {
      const style = convertStyleProps(
        { borderColor: "default" },
        viewStyleProps,
        "ltr",
        ["base"]
      );
      expect(style.borderColor).toBe("var(--spectrum-alias-border-color)");
    });

    it("maps custom border color values", () => {
      const style = convertStyleProps(
        { borderColor: { S: "gray-50" } },
        viewStyleProps,
        "ltr",
        ["base", "S"]
      );
      expect(style.borderColor).toBe(
        "var(--spectrum-alias-border-color-gray-50, var(--spectrum-legacy-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-border))))"
      );
    });

    it("uses version 6 syntax for border colors", () => {
      const style = convertStyleProps(
        { borderColor: { S: "red-1400" }, colorVersion: 6 },
        viewStyleProps,
        "ltr",
        ["base", "S"]
      );
      expect(style.borderColor).toBe(
        "var(--spectrum-alias-border-color-red-1400, var(--spectrum-red-1400, var(--spectrum-semantic-red-1400-color-border)))"
      );
    });
  });

  describe("borderRadiusValue", () => {
    it("returns undefined when responsive value has no matching breakpoint", () => {
      const style = convertStyleProps(
        { borderRadius: { S: "small" } },
        viewStyleProps,
        "ltr",
        ["base"]
      );
      expect(style.borderRadius).toBeUndefined();
    });

    it("maps border radius tokens", () => {
      const style = convertStyleProps(
        { borderRadius: { S: "small" } },
        viewStyleProps,
        "ltr",
        ["base", "S"]
      );
      expect(style.borderRadius).toBe("var(--spectrum-alias-border-radius-small)");
    });
  });

  describe("borderSizeValue", () => {
    it("defaults to zero when responsive base value is missing", () => {
      let style = convertStyleProps(
        { borderEndWidth: { S: "thin" } },
        viewStyleProps,
        "ltr",
        ["base"]
      );
      expect(style.borderRightWidth).toBe("0");

      style = convertStyleProps(
        { borderEndWidth: { S: "thin" } },
        viewStyleProps,
        "ltr",
        ["S", "base"]
      );
      expect(style.borderRightWidth).toBe("var(--spectrum-alias-border-size-thin)");
    });

    it("supports none for removing borders at specific breakpoints", () => {
      let style = convertStyleProps(
        { borderEndWidth: { S: "thick", M: "none", L: "thin" } },
        viewStyleProps,
        "ltr",
        ["S", "base"]
      );
      expect(style.borderRightWidth).toBe("var(--spectrum-alias-border-size-thick)");

      style = convertStyleProps(
        { borderEndWidth: { S: "thick", M: "none", L: "thin" } },
        viewStyleProps,
        "ltr",
        ["M", "S", "base"]
      );
      expect(style.borderRightWidth).toBe("0");

      style = convertStyleProps(
        { borderEndWidth: { S: "thick", M: "none", L: "thin" } },
        viewStyleProps,
        "ltr",
        ["L", "M", "S", "base"]
      );
      expect(style.borderRightWidth).toBe("var(--spectrum-alias-border-size-thin)");
    });
  });
});
