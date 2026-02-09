import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { Label } from "../src";

describe("Label", () => {
  it("renders a label element and supports htmlFor", () => {
    const wrapper = mount(Label, {
      props: {
        htmlFor: "field-id",
      },
      slots: {
        default: "Field label",
      },
    });

    const label = wrapper.get("label");
    expect(label.attributes("for")).toBe("field-id");
    expect(label.classes()).toContain("spectrum-FieldLabel");
  });

  it("supports non-label elementType", () => {
    const wrapper = mount(Label, {
      props: {
        elementType: "span",
        htmlFor: "field-id",
      },
      slots: {
        default: "Field label",
      },
    });

    const label = wrapper.get("span");
    expect(label.attributes("for")).toBeUndefined();
  });

  it("supports side position and end alignment classes", () => {
    const wrapper = mount(Label, {
      props: {
        labelPosition: "side",
        labelAlign: "end",
      },
      slots: {
        default: "Field label",
      },
    });

    const label = wrapper.get("label");
    expect(label.classes()).toContain("spectrum-FieldLabel--positionSide");
    expect(label.classes()).toContain("spectrum-FieldLabel--alignEnd");
  });

  it("renders necessity label text", () => {
    const wrapper = mount(Label, {
      props: {
        necessityIndicator: "label",
        isRequired: true,
      },
      slots: {
        default: "Field label",
      },
    });

    expect(wrapper.text()).toContain("(required)");
  });

  it("renders required icon necessity indicator", () => {
    const wrapper = mount(Label, {
      props: {
        necessityIndicator: "icon",
        isRequired: true,
      },
      slots: {
        default: "Field label",
      },
    });

    const icon = wrapper.get(".spectrum-FieldLabel-requiredIcon");
    expect(icon.text()).toBe("*");
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("supports including necessity in accessibility name", () => {
    const wrapper = mount(Label, {
      props: {
        necessityIndicator: "icon",
        isRequired: true,
        includeNecessityIndicatorInAccessibilityName: true,
      },
      slots: {
        default: "Field label",
      },
    });

    const icon = wrapper.get(".spectrum-FieldLabel-requiredIcon");
    expect(icon.attributes("aria-label")).toBe("(required)");
    expect(icon.attributes("aria-hidden")).toBeUndefined();
  });
});
