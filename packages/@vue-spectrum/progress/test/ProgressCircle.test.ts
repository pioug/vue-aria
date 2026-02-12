import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ProgressCircle } from "../src";

describe("ProgressCircle", () => {
  it("handles defaults", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
      } as Record<string, unknown>,
    });
    const progressCircle = wrapper.get("[role=\"progressbar\"]");
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
  });

  it("handles indeterminate mode", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        isIndeterminate: true,
      } as Record<string, unknown>,
    });
    const progressCircle = wrapper.get("[role=\"progressbar\"]");
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBeUndefined();
  });

  it("handles controlled value", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 30,
      } as Record<string, unknown>,
    });
    const progressCircle = wrapper.get("[role=\"progressbar\"]");
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBe("30");
  });

  it("clamps values to 0", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: -1,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[role=\"progressbar\"]").attributes("aria-valuenow")).toBe("0");
  });

  it("clamps values to 100", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 1000,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[role=\"progressbar\"]").attributes("aria-valuenow")).toBe(
      "100"
    );
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        UNSAFE_className: "testClass",
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[role=\"progressbar\"]").attributes("class")).toContain(
      "testClass"
    );
  });

  it("shows none of the circle for 0%", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 0,
      } as Record<string, unknown>,
    });
    const progressCircle = wrapper.get("[role=\"progressbar\"]");
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
    expect(progressCircle.attributes("aria-valuetext")).toBe("0%");
    expect(wrapper.get("[data-testid=\"fillSubMask1\"]").attributes("style")).toBeUndefined();
    expect(wrapper.get("[data-testid=\"fillSubMask2\"]").attributes("style")).toBeUndefined();
  });

  it("shows quarter of the circle for 25%", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 25,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"fillSubMask1\"]").attributes("style")).toContain(
      "rotate(-90deg)"
    );
    expect(wrapper.get("[data-testid=\"fillSubMask2\"]").attributes("style")).toContain(
      "rotate(-180deg)"
    );
  });

  it("shows half the circle for 50%", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 50,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"fillSubMask1\"]").attributes("style")).toContain(
      "rotate(0deg)"
    );
    expect(wrapper.get("[data-testid=\"fillSubMask2\"]").attributes("style")).toContain(
      "rotate(-180deg)"
    );
  });

  it("shows quarter of the circle for 75%", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 75,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"fillSubMask1\"]").attributes("style")).toContain(
      "rotate(0deg)"
    );
    expect(wrapper.get("[data-testid=\"fillSubMask2\"]").attributes("style")).toContain(
      "rotate(-90deg)"
    );
  });

  it("shows all of the circle for 100%", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 100,
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"fillSubMask1\"]").attributes("style")).toContain(
      "rotate(0deg)"
    );
    expect(wrapper.get("[data-testid=\"fillSubMask2\"]").attributes("style")).toContain(
      "rotate(0deg)"
    );
  });

  it("can handle negative values with minValue and maxValue", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        ariaLabel: "Progress",
        value: 0,
        minValue: -5,
        maxValue: 5,
      } as Record<string, unknown>,
    });
    const progressCircle = wrapper.get("[role=\"progressbar\"]");
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
    expect(progressCircle.attributes("aria-valuetext")).toBe("50%");
  });

  it("warns user if no aria-label is provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(ProgressCircle, { props: { value: 25 } });
    expect(spyWarn).toHaveBeenCalledWith(
      "ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility"
    );
    spyWarn.mockRestore();
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(ProgressCircle, {
      props: {
        value: 25,
        ariaLabel: "Progress",
        "data-testid": "test",
      } as Record<string, unknown>,
    });
    expect(wrapper.get("[data-testid=\"test\"]").attributes("data-testid")).toBe(
      "test"
    );
  });
});
