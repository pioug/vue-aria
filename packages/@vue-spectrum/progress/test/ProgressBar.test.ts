import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ProgressBar } from "../src";

describe("ProgressBar", () => {
  it("handles defaults", () => {
    const wrapper = mount(ProgressBar, {
      props: { label: "Progress Bar" },
    });

    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("aria-valuemin")).toBe("0");
    expect(progressBar.attributes("aria-valuemax")).toBe("100");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("0%");

    const labelId = progressBar.attributes("aria-labelledby");
    expect(labelId).toBeDefined();
    const label = labelId ? wrapper.find(`[id="${labelId}"]`) : null;
    expect(label?.text() ?? "").toContain("Progress Bar");
  });

  it("updates all fields by value", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 30, label: "Progress Bar" },
    });

    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("aria-valuemin")).toBe("0");
    expect(progressBar.attributes("aria-valuemax")).toBe("100");
    expect(progressBar.attributes("aria-valuenow")).toBe("30");
    expect(progressBar.attributes("aria-valuetext")).toBe("30%");
  });

  it("clamps values to 0", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: -1, label: "Progress Bar" },
    });
    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("0%");
  });

  it("clamps values to 100", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 1000, label: "Progress Bar" },
    });
    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("100");
    expect(progressBar.attributes("aria-valuetext")).toBe("100%");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ProgressBar, {
      props: {
        size: "S",
        UNSAFE_className: "testClass",
        label: "Progress Bar",
      },
    });
    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("class")).toContain("testClass");
  });

  it("Can handle negative values", () => {
    const wrapper = mount(ProgressBar, {
      props: {
        value: 0,
        minValue: -5,
        maxValue: 5,
        label: "Progress Bar",
      },
    });
    const progressBar = wrapper.get("[role=\"progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("50%");
  });

  it("warns user if no aria-label is provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(ProgressBar, { props: { value: 25 } });
    expect(spyWarn).toHaveBeenCalledWith(
      "If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    spyWarn.mockRestore();
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(ProgressBar, {
      props: {
        label: "Meter",
        "data-testid": "test",
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"test\"]").attributes("data-testid")).toBe(
      "test"
    );
  });
});
