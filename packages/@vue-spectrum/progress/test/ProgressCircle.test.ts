import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ProgressCircle } from "../src/ProgressCircle";

describe("ProgressCircle", () => {
  it("handles defaults", () => {
    const wrapper = mount(ProgressCircle as any, {
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
  });

  it("handles indeterminate", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        isIndeterminate: true,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBeUndefined();
  });

  it("handles controlled value", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 30,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuemin")).toBe("0");
    expect(progressCircle.attributes("aria-valuemax")).toBe("100");
    expect(progressCircle.attributes("aria-valuenow")).toBe("30");
  });

  it("clamps values to 0", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: -1,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
  });

  it("clamps values to 100", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 1000,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuenow")).toBe("100");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        UNSAFE_className: "testClass",
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.classes()).toContain("testClass");
  });

  it("handles submask defaults", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 0,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
    expect(progressCircle.attributes("aria-valuetext")).toBe("0%");

    const fillSubMask1 = wrapper.get('[data-testid="fillSubMask1"]');
    const fillSubMask2 = wrapper.get('[data-testid="fillSubMask2"]');
    expect(wrapper.find('[data-testid="fillSubMask1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fillSubMask2"]').exists()).toBe(true);
    expect(fillSubMask1.attributes("style")).toBeUndefined();
    expect(fillSubMask2.attributes("style")).toBeUndefined();
  });

  it("shows none of the circle for 0%", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 0,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    expect(wrapper.get('[data-testid="fillSubMask1"]').attributes("style")).toBeUndefined();
    expect(wrapper.get('[data-testid="fillSubMask2"]').attributes("style")).toBeUndefined();
  });

  it("shows quarter of the circle for 25%", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 25,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    expect(wrapper.get('[data-testid="fillSubMask1"]').attributes("style")).toContain("rotate(-90deg)");
    expect(wrapper.get('[data-testid="fillSubMask2"]').attributes("style")).toContain("rotate(-180deg)");
  });

  it("shows half the circle for 50%", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 50,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    expect(wrapper.get('[data-testid="fillSubMask1"]').attributes("style")).toContain("rotate(0deg)");
    expect(wrapper.get('[data-testid="fillSubMask2"]').attributes("style")).toContain("rotate(-180deg)");
  });

  it("shows quarter of the circle for 75%", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 75,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    expect(wrapper.get('[data-testid="fillSubMask1"]').attributes("style")).toContain("rotate(0deg)");
    expect(wrapper.get('[data-testid="fillSubMask2"]').attributes("style")).toContain("rotate(-90deg)");
  });

  it("shows all of the circle for 100%", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 100,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    expect(wrapper.get('[data-testid="fillSubMask1"]').attributes("style")).toContain("rotate(0deg)");
    expect(wrapper.get('[data-testid="fillSubMask2"]').attributes("style")).toContain("rotate(0deg)");
  });

  it("can handle negative values with minValue and maxValue", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 0,
        minValue: -5,
        maxValue: 5,
      },
      attrs: {
        "aria-label": "Progress",
      },
    });
    const progressCircle = wrapper.get('[role="progressbar"]');
    expect(progressCircle.attributes("aria-valuenow")).toBe("0");
    expect(progressCircle.attributes("aria-valuetext")).toBe("50%");
  });

  it("warns user if no aria-label is provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(ProgressCircle as any, {
      props: {
        value: 25,
      },
    });
    expect(spyWarn).toHaveBeenCalledWith("ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility");
    spyWarn.mockRestore();
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(ProgressCircle as any, {
      props: {
        value: 25,
      },
      attrs: {
        "aria-label": "Progress",
        "data-testid": "test",
      },
    });
    expect(wrapper.find('[data-testid="test"]').exists()).toBe(true);
  });
});
