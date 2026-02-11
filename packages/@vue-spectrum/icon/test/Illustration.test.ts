import { mount } from "@vue/test-utils";
import { defineComponent, h, type PropType } from "vue";
import { describe, expect, it } from "vitest";
import { SlotProvider } from "@vue-spectrum/utils";
import { Illustration } from "../src";

function renderCustomIllustration() {
  return h("svg", [h("path", { d: "M 10,150 L 70,10 L 130,150 z" })]);
}

const IllustrationHarness = defineComponent({
  name: "IllustrationHarness",
  props: {
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaHidden: {
      type: [Boolean, String] as PropType<boolean | "true" | "false" | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        Illustration,
        {
          ariaLabel: props.label,
          ariaLabelledby: props.labelledby,
          ariaHidden: props.ariaHidden,
        },
        {
          default: () => [renderCustomIllustration()],
        }
      );
  },
});

describe("Illustration", () => {
  it("handles aria label", () => {
    const wrapper = mount(IllustrationHarness, {
      props: {
        label: "custom illustration",
      },
    });

    const illustration = wrapper.get("svg");
    expect(illustration.attributes("focusable")).toBe("false");
    expect(illustration.attributes("aria-label")).toBe("custom illustration");
    expect(illustration.attributes("role")).toBe("img");
  });

  it("does not force role or aria-hidden without accessible labels", () => {
    const wrapper = mount(IllustrationHarness);

    const illustration = wrapper.get("svg");
    expect(illustration.attributes("aria-label")).toBeUndefined();
    expect(illustration.attributes("aria-hidden")).toBeUndefined();
    expect(illustration.attributes("role")).toBeUndefined();
  });

  it("supports aria-labelledby semantics", () => {
    const wrapper = mount(IllustrationHarness, {
      props: {
        labelledby: "illustration-heading",
      },
    });

    const illustration = wrapper.get("svg");
    expect(illustration.attributes("aria-labelledby")).toBe("illustration-heading");
    expect(illustration.attributes("role")).toBe("img");
  });

  it("supports aria-hidden override", async () => {
    const wrapper = mount(IllustrationHarness, {
      props: {
        label: "explicitly hidden aria-label",
        ariaHidden: true,
      },
    });

    let illustration = wrapper.get("svg");
    expect(illustration.attributes("aria-label")).toBe("explicitly hidden aria-label");
    expect(illustration.attributes("aria-hidden")).toBe("true");

    await wrapper.setProps({
      label: "explicitly not hidden aria-label",
      ariaHidden: false,
    });

    illustration = wrapper.get("svg");
    expect(illustration.attributes("aria-label")).toBe("explicitly not hidden aria-label");
    expect(illustration.attributes("aria-hidden")).toBeUndefined();
  });

  it("forwards DOM class/style props to the svg node", () => {
    const wrapper = mount(Illustration, {
      attrs: {
        class: "illustration-dom",
        style: {
          marginTop: "2px",
        },
        "data-testid": "illustration-dom",
      },
      slots: {
        default: () => [
          renderCustomIllustration(),
        ],
      },
    });

    const illustration = wrapper.get("svg");
    expect(illustration.classes()).toContain("illustration-dom");
    expect(illustration.attributes("data-testid")).toBe("illustration-dom");
    expect(illustration.attributes("style")).toContain("margin-top: 2px");
  });

  it("supports illustration slot-prop overrides", () => {
    const App = defineComponent({
      name: "IllustrationSlotProviderHarness",
      setup() {
        return () =>
          h(
            SlotProvider,
            {
              slots: {
                illustration: {
                  ariaLabel: "slot illustration",
                  UNSAFE_className: "slot-illustration-class",
                },
              },
            },
            {
              default: () =>
                h(
                  Illustration,
                  {
                    ariaLabel: "local illustration",
                    UNSAFE_className: "local-illustration-class",
                  } as Record<string, unknown>,
                  {
                    default: () => [renderCustomIllustration()],
                  }
                ),
            }
          );
      },
    });

    const wrapper = mount(App);
    const illustration = wrapper.get("svg");

    expect(illustration.attributes("aria-label")).toBe("slot illustration");
    expect(illustration.classes()).toContain("local-illustration-class");
    expect(illustration.classes()).toContain("slot-illustration-class");
  });
});
