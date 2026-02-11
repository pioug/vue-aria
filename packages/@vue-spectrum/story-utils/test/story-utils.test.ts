import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { ErrorBoundary, generatePowerset } from "../src";

describe("@vue-spectrum/story-utils", () => {
  it("generatePowerset expands single and multi-value states", () => {
    const result = generatePowerset([
      { isQuiet: true },
      { size: ["S", "L"] },
    ]);

    expect(result).toContainEqual({});
    expect(result).toContainEqual({ isQuiet: true });
    expect(result).toContainEqual({ size: "S" });
    expect(result).toContainEqual({ size: "L" });
    expect(result).toContainEqual({ isQuiet: true, size: "S" });
    expect(result).toContainEqual({ isQuiet: true, size: "L" });
  });

  it("generatePowerset supports exclusion callback", () => {
    const result = generatePowerset(
      [{ isQuiet: true }, { size: ["S", "L"] }],
      (merged) => merged.isQuiet === true && merged.size === "L"
    );

    expect(result).not.toContainEqual({ isQuiet: true, size: "L" });
    expect(result).toContainEqual({ isQuiet: true, size: "S" });
  });

  it("ErrorBoundary renders fallback message after slot error", async () => {
    const ThrowingChild = defineComponent({
      name: "ThrowingChild",
      render() {
        throw new Error("render failure");
      },
    });

    const wrapper = mount(ErrorBoundary, {
      props: { message: "Something went wrong" },
      slots: {
        default: () => h(ThrowingChild),
      },
    });

    await nextTick();
    expect(wrapper.text()).toContain("Something went wrong");
  });
});
