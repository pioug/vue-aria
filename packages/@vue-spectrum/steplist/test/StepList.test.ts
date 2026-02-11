import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { StepList, StepListItem, type SpectrumStepListItemData } from "../src";

const items: SpectrumStepListItemData[] = [
  { key: "step-one", label: "Step 1" },
  { key: "step-two", label: "Step 2" },
  { key: "step-three", label: "Step 3" },
  { key: "step-four", label: "Step 4" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(StepList, {
    props: {
      items,
      "aria-label": "steplist-test",
      ...props,
    },
  });
}

describe("StepList", () => {
  it("renders links with first step selected by default", () => {
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      onSelectionChange,
      id: "steplist-id",
    });

    const stepListItems = tree.getAllByRole("link");
    expect(stepListItems).toHaveLength(4);

    expect(stepListItems[0].getAttribute("aria-current")).toBe("step");
    expect(stepListItems[0].getAttribute("tabindex")).toBe("0");
    expect(onSelectionChange).toHaveBeenCalledWith("step-one");

    for (let index = 1; index < stepListItems.length; index += 1) {
      expect(stepListItems[index].getAttribute("aria-disabled")).toBe("true");
      expect(stepListItems[index].getAttribute("tabindex")).toBeNull();
    }

    expect(tree.getByLabelText("steplist-test").getAttribute("id")).toBe("steplist-id");
  });

  it("attaches a user provided ref", () => {
    const listRef = ref<{ UNSAFE_getDOMNode: () => HTMLOListElement | null } | null>(
      null
    );

    const App = defineComponent({
      setup() {
        return () =>
          h(StepList, {
            ref: listRef,
            items,
            "aria-label": "steplist-test",
          });
      },
    });

    const tree = render(App);
    const stepList = tree.getByLabelText("steplist-test");

    expect(listRef.value?.UNSAFE_getDOMNode()).toBe(stepList);
  });

  it("allows selecting completed and immediate next steps only", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultLastCompletedStep: "step-two",
      defaultSelectedKey: "step-three",
      onSelectionChange,
    });

    const stepListItems = tree.getAllByRole("link");

    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");

    await user.click(stepListItems[0]);
    expect(stepListItems[0].getAttribute("aria-current")).toBe("step");

    await user.click(stepListItems[2]);
    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");

    const callsBefore = onSelectionChange.mock.calls.length;
    await user.click(stepListItems[3]);
    expect(stepListItems[3].getAttribute("aria-current")).toBeNull();
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("does not allow selecting disabled steps", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultLastCompletedStep: "step-two",
      defaultSelectedKey: "step-three",
      disabledKeys: ["step-one"],
      onSelectionChange,
    });

    const stepListItems = tree.getAllByRole("link");
    const callsBefore = onSelectionChange.mock.calls.length;

    await user.click(stepListItems[0]);

    expect(stepListItems[0].getAttribute("aria-current")).toBeNull();
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("disables all steps when StepList is disabled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultLastCompletedStep: "step-two",
      isDisabled: true,
      onSelectionChange,
    });

    const stepListItems = tree.getAllByRole("link");
    for (const item of stepListItems) {
      expect(item.getAttribute("aria-disabled")).toBe("true");
    }

    const callsBefore = onSelectionChange.mock.calls.length;
    await user.click(stepListItems[1]);
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("disables all steps when StepList is readOnly", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultSelectedKey: "step-four",
      defaultLastCompletedStep: "step-three",
      isReadOnly: true,
      onSelectionChange,
    });

    const stepListItems = tree.getAllByRole("link");
    for (const item of stepListItems) {
      expect(item.getAttribute("aria-disabled")).toBe("true");
    }

    const callsBefore = onSelectionChange.mock.calls.length;
    await user.click(stepListItems[0]);
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("supports controlled selectedKey updates", async () => {
    const tree = renderComponent({
      selectedKey: "step-one",
    });

    const stepListItems = tree.getAllByRole("link");
    expect(stepListItems[0].getAttribute("aria-current")).toBe("step");

    await tree.rerender({
      items,
      "aria-label": "steplist-test",
      selectedKey: "step-three",
    });

    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");
  });

  it("applies orientation and size classes", () => {
    const tree = renderComponent({
      orientation: "vertical",
      size: "L",
      isEmphasized: true,
    });

    const stepList = tree.getByLabelText("steplist-test");
    expect(stepList.className).toContain("spectrum-Steplist--vertical");
    expect(stepList.className).toContain("spectrum-Steplist--large");
    expect(stepList.className).toContain("spectrum-Steplist--emphasized");
  });

  it("supports static slot syntax with StepListItem", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const App = defineComponent({
      name: "StepListSlotHarness",
      setup() {
        return () =>
          h(
            StepList,
            {
              "aria-label": "steplist-test",
              defaultSelectedKey: "step-three",
              defaultLastCompletedStep: "step-two",
              onSelectionChange,
            },
            {
              default: () => [
                h(StepListItem, { id: "step-one" }, () => "Step 1"),
                h(StepListItem, { id: "step-two", isDisabled: true }, () => "Step 2"),
                h(StepListItem, { id: "step-three" }, () => "Step 3"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const stepListItems = tree.getAllByRole("link");

    expect(stepListItems).toHaveLength(3);
    expect(stepListItems[1].getAttribute("aria-disabled")).toBe("true");
    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");

    await user.click(stepListItems[0]);
    expect(stepListItems[0].getAttribute("aria-current")).toBe("step");
    expect(onSelectionChange).toHaveBeenCalledWith("step-one");
  });

  it("renders localized state messages", () => {
    const tree = renderComponent({
      defaultLastCompletedStep: "step-two",
      defaultSelectedKey: "step-three",
    });

    const stepListItems = tree.getAllByRole("link");
    expect(stepListItems[1].textContent).toContain("Completed:");
    expect(stepListItems[2].textContent).toContain("Current:");
    expect(stepListItems[3].textContent).toContain("Not completed:");
  });
});
