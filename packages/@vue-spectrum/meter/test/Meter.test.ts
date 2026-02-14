import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Meter } from "../src/Meter";

describe("Meter", () => {
  it("handles defaults", () => {
    const wrapper = mount(Meter as any, {
      props: {
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-valuemin")).toBe("0");
    expect(meter.attributes("aria-valuemax")).toBe("100");
    expect(meter.attributes("aria-valuenow")).toBe("0");
    expect(meter.attributes("aria-valuetext")).toBe("0%");

    const labelId = meter.attributes("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(wrapper.get(`#${labelId}`).text()).toContain("Meter");
  });

  it("updates all fields by value", () => {
    const wrapper = mount(Meter as any, {
      props: {
        value: 30,
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-valuemin")).toBe("0");
    expect(meter.attributes("aria-valuemax")).toBe("100");
    expect(meter.attributes("aria-valuenow")).toBe("30");
    expect(meter.attributes("aria-valuetext")).toBe("30%");
  });

  it("clamps values to 0", () => {
    const wrapper = mount(Meter as any, {
      props: {
        value: -1,
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-valuenow")).toBe("0");
    expect(meter.attributes("aria-valuetext")).toBe("0%");
  });

  it("clamps values to 100", () => {
    const wrapper = mount(Meter as any, {
      props: {
        value: 1000,
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-valuenow")).toBe("100");
    expect(meter.attributes("aria-valuetext")).toBe("100%");
  });

  it("supports UNSAFE_className", () => {
    const wrapper = mount(Meter as any, {
      props: {
        size: "S",
        UNSAFE_className: "testClass",
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.classes()).toContain("testClass");
  });

  it("can handle negative values", () => {
    const wrapper = mount(Meter as any, {
      props: {
        value: 0,
        minValue: -5,
        maxValue: 5,
        label: "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-valuenow")).toBe("0");
    expect(meter.attributes("aria-valuetext")).toBe("50%");
    expect(meter.attributes("role")).toBe("meter progressbar");
  });

  it("supports aria-label", () => {
    const wrapper = mount(Meter as any, {
      attrs: {
        "aria-label": "Meter",
      },
    });
    const meter = wrapper.get('[role="meter progressbar"]');
    expect(meter.attributes("aria-label")).toBe("Meter");
  });

  it("supports custom DOM props", () => {
    const wrapper = mount(Meter as any, {
      props: {
        label: "Meter",
      },
      attrs: {
        "data-testid": "test",
      },
    });
    expect(wrapper.find('[data-testid="test"]').exists()).toBe(true);
  });

  it("supports variant classes", () => {
    const informative = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 25,
        variant: "informative",
      },
    });
    const informativeMeter = informative.get('[role="meter progressbar"]');
    expect(informativeMeter.classes()).not.toContain("is-positive");
    expect(informativeMeter.classes()).not.toContain("is-warning");
    expect(informativeMeter.classes()).not.toContain("is-critical");

    const positive = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 25,
        variant: "positive",
      },
    });
    expect(positive.get('[role="meter progressbar"]').classes()).toContain("is-positive");

    const warning = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 70,
        variant: "warning",
      },
    });
    expect(warning.get('[role="meter progressbar"]').classes()).toContain("is-warning");

    const critical = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 90,
        variant: "critical",
      },
    });
    expect(critical.get('[role="meter progressbar"]').classes()).toContain("is-critical");
  });

  it("supports size and label-position visual states", () => {
    const smallTop = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 25,
        size: "S",
      },
    });
    const smallMeter = smallTop.get('[role="meter progressbar"]');
    expect(smallMeter.classes()).toContain("spectrum-BarLoader--small");
    expect(smallMeter.classes()).not.toContain("spectrum-BarLoader--sideLabel");
    expect(smallTop.find(".spectrum-BarLoader-percentage").exists()).toBe(true);

    const largeSideHidden = mount(Meter as any, {
      props: {
        label: "Meter",
        value: 25,
        size: "L",
        labelPosition: "side",
        showValueLabel: false,
      },
    });
    const largeMeter = largeSideHidden.get('[role="meter progressbar"]');
    expect(largeMeter.classes()).toContain("spectrum-BarLoader--large");
    expect(largeMeter.classes()).toContain("spectrum-BarLoader--sideLabel");
    expect(largeSideHidden.find(".spectrum-BarLoader-percentage").exists()).toBe(false);
  });
});
