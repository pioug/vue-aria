import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ProgressBar } from "../src/ProgressBar";

describe("ProgressBar", () => {
  it("handles defaults", () => {
    const wrapper = mount(ProgressBar as any, {
      props: {
        label: "Progress Bar",
      },
    });

    const progressBar = wrapper.get('[role="progressbar"]');
    expect(progressBar.attributes("aria-valuemin")).toBe("0");
    expect(progressBar.attributes("aria-valuemax")).toBe("100");
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("0%");

    const labelId = progressBar.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(wrapper.get(`#${labelId}`).text()).toContain("Progress Bar");
  });

  it("updates ARIA fields by value", () => {
    const wrapper = mount(ProgressBar as any, {
      props: {
        value: 30,
        label: "Progress Bar",
      },
    });
    const progressBar = wrapper.get('[role="progressbar"]');
    expect(progressBar.attributes("aria-valuenow")).toBe("30");
    expect(progressBar.attributes("aria-valuetext")).toBe("30%");
  });

  it("clamps values to bounds", () => {
    const low = mount(ProgressBar as any, {
      props: {
        value: -1,
        label: "Progress Bar",
      },
    });
    expect(low.get('[role="progressbar"]').attributes("aria-valuenow")).toBe("0");

    const high = mount(ProgressBar as any, {
      props: {
        value: 1000,
        label: "Progress Bar",
      },
    });
    expect(high.get('[role="progressbar"]').attributes("aria-valuenow")).toBe("100");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(ProgressBar as any, {
      props: {
        size: "S",
        UNSAFE_className: "testClass",
        label: "Progress Bar",
      },
    });
    expect(wrapper.get('[role="progressbar"]').classes()).toContain("testClass");
  });

  it("can handle negative ranges", () => {
    const wrapper = mount(ProgressBar as any, {
      props: {
        value: 0,
        minValue: -5,
        maxValue: 5,
        label: "Progress Bar",
      },
    });
    const progressBar = wrapper.get('[role="progressbar"]');
    expect(progressBar.attributes("aria-valuenow")).toBe("0");
    expect(progressBar.attributes("aria-valuetext")).toBe("50%");
  });

  it("warns user if no aria-label is provided", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(ProgressBar as any, {
      props: {
        value: 25,
      },
    });
    expect(spyWarn).toHaveBeenCalledWith(
      "If you do not provide a visible label via children, you must specify an aria-label or aria-labelledby attribute for accessibility"
    );
    spyWarn.mockRestore();
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(ProgressBar as any, {
      props: {
        label: "Meter",
      },
      attrs: {
        "data-testid": "test",
      },
    });

    expect(wrapper.find('[data-testid="test"]').exists()).toBe(true);
  });
});
