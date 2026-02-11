import { describe, expect, it } from "vitest";
import {
  baseColor,
  focusRing,
  keyframes,
  lightDark,
  raw,
  style,
} from "../src";
import { mergeStyles } from "../src/runtime";

function stripMacro(css: string): string {
  return css
    .replaceAll(/ -macro-static-[0-9a-zA-Z]+/g, "")
    .replaceAll(/ -macro-dynamic-[0-9a-zA-Z]+/g, "");
}

function normalizeClassList(css: string): string {
  return stripMacro(css).trim().split(/\s+/).join(" ");
}

describe("@vue-spectrum/style-macro-s1", () => {
  it("returns class names from the style runtime", () => {
    const className = style({ backgroundColor: "gray-50", fontSize: "xs" })();
    expect(className).toContain("s1-");
  });

  it("merges class strings with last declaration wins per property key", () => {
    expect(normalizeClassList(mergeStyles("ab cd", "ae"))).toBe("ae cd");
    expect(normalizeClassList(mergeStyles("ab cd", "cf"))).toBe("ab cf");
  });

  it("merges arbitrary-value selectors", () => {
    const merged = mergeStyles("-x-y- qq", "-x-z-");
    expect(normalizeClassList(merged)).toContain("-x-z-");
    expect(normalizeClassList(merged)).not.toContain("-x-y-");
  });

  it("exposes color helpers and focus ring defaults", () => {
    expect(baseColor("red-500")).toEqual({
      default: "red-500",
      isHovered: "red-600",
      isFocusVisible: "red-600",
      isPressed: "red-600",
    });
    expect(lightDark("gray-100", "gray-900")).toBe(
      "[light-dark(var(--spectrum-gray-100), var(--spectrum-gray-900))]"
    );
    expect(focusRing()).toEqual({
      outlineStyle: {
        default: "none",
        isFocusVisible: "solid",
      },
      outlineColor: "focus-ring",
      outlineWidth: 2,
      outlineOffset: 2,
    });
  });

  it("writes CSS assets for raw and keyframes helpers", () => {
    const assets: Array<{ type: string; content: string }> = [];
    const macroContext = {
      addAsset(asset: { type: string; content: string }) {
        assets.push(asset);
      },
    };

    const className = raw.call(macroContext, "color: red;");
    const animationName = keyframes.call(
      macroContext,
      "from { opacity: 0; } to { opacity: 1; }"
    );

    expect(className).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(animationName).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(assets).toHaveLength(2);
    expect(assets[0]?.type).toBe("css");
    expect(assets[0]?.content).toContain(`.${className}`);
    expect(assets[0]?.content).toContain("color: red;");
    expect(assets[1]?.type).toBe("css");
    expect(assets[1]?.content).toContain(`@keyframes ${animationName}`);
  });
});
