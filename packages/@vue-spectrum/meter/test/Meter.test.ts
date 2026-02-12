import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { Meter } from "../src";

describe("Meter", () => {
  it("handles defaults", () => {
    const wrapper = mount(Meter, { props: { label: "Meter" } });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-valuemin")).toBe("0");
    expect(progressBar.attributes("aria-valuemax")).toBe("100");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("0%");
  });

  it("updates all fields by value", () => {
    const wrapper = mount(Meter, { props: { value: 30, label: "Meter" } });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("30");
    expect(progressBar.attributes("aria-valuetext")).toBe("30%");
  });

  it("clamps values to 0", () => {
    const wrapper = mount(Meter, { props: { value: -1, label: "Meter" } });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("0%");
  });

  it("clamps values to 100", () => {
    const wrapper = mount(Meter, { props: { value: 1000, label: "Meter" } });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("100");
    expect(progressBar.attributes("aria-valuetext")).toBe("100%");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(Meter, {
      props: {
        size: "S",
        UNSAFE_className: "testClass",
        label: "Meter",
      },
    });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("class")).toContain("testClass");
  });

  it("can handle negative values", () => {
    const wrapper = mount(Meter, {
      props: {
        value: 0,
        minValue: -5,
        maxValue: 5,
        label: "Meter",
      },
    });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("50%");
    expect(progressBar.attributes("role")).toBe("meter progressbar");
  });

  it("supports aria-label", () => {
    const wrapper = mount(Meter, {
      props: {
        ariaLabel: "Meter",
      },
    });
    const progressBar = wrapper.get("[role=\"meter progressbar\"]");
    expect(progressBar.attributes("aria-label")).toBe("Meter");
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(Meter, {
      props: {
        label: "Meter",
        "data-testid": "test",
      } as Record<string, unknown>,
    });
    const progressBar = wrapper.get("[data-testid=\"test\"]");
    expect(progressBar.attributes("data-testid")).toBe("test");
  });

  it("warns when no visible label or aria label is provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(Meter, { props: { value: 25 } });
    expect(spyWarn).toHaveBeenCalledWith(
      "If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    spyWarn.mockRestore();
  });
});
