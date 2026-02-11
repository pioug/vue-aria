import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { SelectBox, SelectBoxGroup } from "../src/SelectBoxGroup";

function renderSingleSelectionGroup(
  props: Record<string, unknown> = {}
) {
  return mount(Provider, {
    attachTo: document.body,
    props: {
      theme: defaultTheme,
    },
    slots: {
      default: () =>
        h(
          SelectBoxGroup,
          props,
          {
            default: () => [
              h(
                SelectBox,
                { id: "option1" },
                {
                  default: () => "Option 1",
                }
              ),
              h(
                SelectBox,
                { id: "option2" },
                {
                  default: () => "Option 2",
                }
              ),
              h(
                SelectBox,
                { id: "option3" },
                {
                  default: () => "Option 3",
                }
              ),
            ],
          }
        ),
    },
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("@vue-spectrum/s2 SelectBoxGroup", () => {
  it("supports uncontrolled single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const wrapper = renderSingleSelectionGroup({
      onSelectionChange,
    });

    const options = wrapper.findAll('[role="radio"]');
    expect(options).toHaveLength(3);
    expect(options[0]?.attributes("aria-checked")).toBe("false");

    await user.click(options[0]!.element);
    expect(options[0]?.attributes("aria-checked")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(Array.from(onSelectionChange.mock.calls[0]?.[0] as Set<unknown>)).toEqual([
      "option1",
    ]);

    await user.click(options[1]!.element);
    expect(options[0]?.attributes("aria-checked")).toBe("false");
    expect(options[1]?.attributes("aria-checked")).toBe("true");
  });

  it("supports uncontrolled multiple selection", async () => {
    const user = userEvent.setup();
    const wrapper = renderSingleSelectionGroup({
      selectionMode: "multiple",
      orientation: "horizontal",
    });

    const group = wrapper.get(".s2-SelectBoxGroup");
    expect(group.attributes("data-s2-selection-mode")).toBe("multiple");
    expect(group.attributes("data-s2-orientation")).toBe("horizontal");

    const options = wrapper.findAll('[role="checkbox"]');
    expect(options).toHaveLength(3);

    await user.click(options[0]!.element);
    await user.click(options[1]!.element);
    expect(options[0]?.attributes("aria-checked")).toBe("true");
    expect(options[1]?.attributes("aria-checked")).toBe("true");

    await user.click(options[0]!.element);
    expect(options[0]?.attributes("aria-checked")).toBe("false");
    expect(options[1]?.attributes("aria-checked")).toBe("true");
  });

  it("supports keyboard navigation and selection in single mode", async () => {
    const user = userEvent.setup();
    const wrapper = renderSingleSelectionGroup();

    const options = wrapper.findAll('[role="radio"]');
    expect(options).toHaveLength(3);

    (options[0]?.element as HTMLElement | undefined)?.focus();
    expect(document.activeElement).toBe(options[0]?.element);
    expect(options[0]?.attributes("aria-checked")).toBe("false");

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(options[1]?.element);
    expect(options[1]?.attributes("aria-checked")).toBe("true");

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(options[0]?.element);
    expect(options[0]?.attributes("aria-checked")).toBe("true");

    await user.keyboard("{End}");
    expect(document.activeElement).toBe(options[2]?.element);
    expect(options[2]?.attributes("aria-checked")).toBe("true");
  });

  it("skips disabled options during keyboard navigation", async () => {
    const user = userEvent.setup();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(
            SelectBoxGroup,
            {
              "aria-label": "Options",
            },
            {
              default: () => [
                h(
                  SelectBox,
                  { id: "option1" },
                  {
                    default: () => "Option 1",
                  }
                ),
                h(
                  SelectBox,
                  { id: "option2", isDisabled: true },
                  {
                    default: () => "Option 2",
                  }
                ),
                h(
                  SelectBox,
                  { id: "option3" },
                  {
                    default: () => "Option 3",
                  }
                ),
              ],
            }
          ),
      },
    });

    const options = wrapper.findAll('[role="radio"]');
    (options[0]?.element as HTMLElement | undefined)?.focus();

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(options[2]?.element);
    expect(options[1]?.attributes("aria-disabled")).toBe("true");
  });

  it("supports keyboard toggling in multiple mode", async () => {
    const user = userEvent.setup();
    const wrapper = renderSingleSelectionGroup({
      selectionMode: "multiple",
    });

    const options = wrapper.findAll('[role="checkbox"]');
    expect(options).toHaveLength(3);

    (options[0]?.element as HTMLElement | undefined)?.focus();
    await user.keyboard("{Space}");
    expect(options[0]?.attributes("aria-checked")).toBe("true");

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(options[1]?.element);
    await user.keyboard("{Enter}");
    expect(options[1]?.attributes("aria-checked")).toBe("true");
  });

  it("supports controlled selection and disabled behavior", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const ControlledHarness = defineComponent({
      name: "S2SelectBoxControlledHarness",
      setup() {
        const selectedKeys = ref<Set<string>>(new Set(["option1"]));
        return () =>
          h(
            SelectBoxGroup,
            {
              selectedKeys: selectedKeys.value,
              onSelectionChange,
              isDisabled: true,
            },
            {
              default: () => [
                h(
                  SelectBox,
                  { id: "option1" },
                  {
                    default: () => "Option 1",
                  }
                ),
                h(
                  SelectBox,
                  { id: "option2" },
                  {
                    default: () => "Option 2",
                  }
                ),
              ],
            }
          );
      },
    });

    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () => h(ControlledHarness),
      },
    });

    const options = wrapper.findAll('[role="radio"]');
    expect(options).toHaveLength(2);
    expect(options[0]?.attributes("aria-checked")).toBe("true");
    expect(options[0]?.attributes("aria-disabled")).toBe("true");
    expect(options[1]?.attributes("aria-disabled")).toBe("true");

    await user.click(options[1]!.element);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(options[0]?.attributes("aria-checked")).toBe("true");
    expect(options[1]?.attributes("aria-checked")).toBe("false");
  });

  it("emits controlled selection changes without mutating visual selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const ControlledHarness = defineComponent({
      name: "S2SelectBoxControlledSelectionHarness",
      setup() {
        const selectedKeys = ref<Set<string>>(new Set(["option1"]));
        return () =>
          h(
            SelectBoxGroup,
            {
              selectedKeys: selectedKeys.value,
              onSelectionChange,
            },
            {
              default: () => [
                h(
                  SelectBox,
                  { id: "option1" },
                  {
                    default: () => "Option 1",
                  }
                ),
                h(
                  SelectBox,
                  { id: "option2" },
                  {
                    default: () => "Option 2",
                  }
                ),
              ],
            }
          );
      },
    });

    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () => h(ControlledHarness),
      },
    });

    const options = wrapper.findAll('[role="radio"]');
    expect(options).toHaveLength(2);
    expect(options[0]?.attributes("aria-checked")).toBe("true");

    await user.click(options[1]!.element);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(Array.from(onSelectionChange.mock.calls[0]?.[0] as Set<unknown>)).toEqual([
      "option2",
    ]);
    expect(options[0]?.attributes("aria-checked")).toBe("true");
    expect(options[1]?.attributes("aria-checked")).toBe("false");
  });
});
