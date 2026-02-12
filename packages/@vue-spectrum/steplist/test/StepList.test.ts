import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { Item, StepList, StepListItem, type SpectrumStepListItemData } from "../src";

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
  it("renders", () => {
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      onSelectionChange,
      id: "steplist-id",
    });

    const stepListItems = tree.getAllByRole("link");
    expect(stepListItems).toHaveLength(4);

    expect(stepListItems[0].getAttribute("aria-current")).toBe("step");
    expect(stepListItems[0].getAttribute("tabindex")).toBe("0");
    expect(stepListItems[0].textContent).toContain("Current:");
    expect(onSelectionChange).toHaveBeenCalledWith("step-one");

    for (let index = 1; index < stepListItems.length; index += 1) {
      expect(stepListItems[index].getAttribute("aria-disabled")).toBe("true");
      expect(stepListItems[index].textContent).toContain("Not completed:");
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

  it("allows user to click completed steps and immediate next step only", async () => {
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
    expect(onSelectionChange).toHaveBeenLastCalledWith("step-one");

    await user.click(stepListItems[2]);
    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");
    expect(onSelectionChange).toHaveBeenLastCalledWith("step-three");

    const callsBefore = onSelectionChange.mock.calls.length;
    await user.click(stepListItems[3]);
    expect(stepListItems[3].getAttribute("aria-current")).toBeNull();
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("allows user to change selected step via tab key only", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      defaultLastCompletedStep: "step-two",
      defaultSelectedKey: "step-three",
      onSelectionChange,
    });

    const stepListItems = tree.getAllByRole("link");
    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");

    await user.tab();
    expect(document.activeElement).toBe(stepListItems[0]);
    await user.tab();
    expect(document.activeElement).toBe(stepListItems[1]);
    await user.tab();
    expect(document.activeElement).toBe(stepListItems[2]);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(stepListItems[1]);

    const callsBeforeEnter = onSelectionChange.mock.calls.length;
    await user.keyboard("{Enter}");
    expect(onSelectionChange.mock.calls.length).toBe(callsBeforeEnter + 1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("step-two");
    expect(stepListItems[1].getAttribute("aria-current")).toBe("step");

    const callsBeforeArrow = onSelectionChange.mock.calls.length;
    await user.keyboard("{ArrowUp}");
    expect(stepListItems[1].getAttribute("aria-current")).toBe("step");
    expect(onSelectionChange.mock.calls.length).toBe(callsBeforeArrow);
  });

  it("should not allow user to click on disabled steps", async () => {
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

  it("should disable all steps when step list is disabled", async () => {
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
    expect(stepListItems[2].getAttribute("aria-current")).toBe("step");

    const callsBefore = onSelectionChange.mock.calls.length;
    await user.click(stepListItems[1]);
    expect(stepListItems[1].getAttribute("aria-current")).toBeNull();
    expect(onSelectionChange.mock.calls.length).toBe(callsBefore);
  });

  it("should not allow user to click previous steps when step list is readonly", async () => {
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
    expect(stepListItems[0].getAttribute("aria-current")).toBeNull();
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

  it(
    "updates the last completed step automatically (uncontrollled) when the selected step is updated",
    async () => {
      const onLastCompletedStepChange = vi.fn();
      const onSelectionChange = vi.fn();

      const tree = render(StepList, {
        props: {
          id: "steplist-id",
          items,
          "aria-label": "steplist-test",
          defaultLastCompletedStep: "step-one",
          onLastCompletedStepChange,
          onSelectionChange,
          selectedKey: "step-one",
        },
      });

      const stepListItems = tree.getAllByRole("link");
      expect(stepListItems[0].getAttribute("aria-current")).toBe("step");
      expect(stepListItems[0].textContent).toContain("Current:");
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();

      await tree.rerender({
        id: "steplist-id",
        items,
        "aria-label": "steplist-test",
        onLastCompletedStepChange,
        onSelectionChange,
        selectedKey: "step-two",
      });

      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
      expect(stepListItems[0].textContent).toContain("Completed:");

      await tree.rerender({
        id: "steplist-id",
        items,
        "aria-label": "steplist-test",
        onLastCompletedStepChange,
        onSelectionChange,
        selectedKey: "step-three",
      });

      expect(onLastCompletedStepChange).toHaveBeenCalledWith("step-two");
      expect(stepListItems[1].textContent).toContain("Completed:");
    }
  );

  it("does not update selected step when last completed step is controlled", async () => {
    const onLastCompletedStepChange = vi.fn();
    const onSelectionChange = vi.fn();

    const tree = render(StepList, {
      props: {
        id: "steplist-id",
        items,
        "aria-label": "steplist-test",
        lastCompletedStep: "step-one",
        onSelectionChange,
        onLastCompletedStepChange,
      },
    });

    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("step-two");

    const stepListItems = tree.getAllByRole("link");

    await tree.rerender({
      id: "steplist-id",
      items,
      "aria-label": "steplist-test",
      onLastCompletedStepChange,
      onSelectionChange,
      lastCompletedStep: "step-two",
    });

    await tree.rerender({
      id: "steplist-id",
      items,
      "aria-label": "steplist-test",
      onLastCompletedStepChange,
      onSelectionChange,
      lastCompletedStep: "step-three",
    });

    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(stepListItems[1].getAttribute("aria-current")).toBe("step");
    expect(stepListItems[2].textContent).toContain("Completed:");
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

  it("renders step visuals and rtl chevron direction", () => {
    const App = defineComponent({
      name: "StepListVisualRtlHarness",
      setup() {
        provideI18n({
          locale: "ar-AE",
          direction: "rtl",
        });

        return () =>
          h(StepList, {
            "aria-label": "steplist-test",
            items,
            defaultSelectedKey: "step-two",
            defaultLastCompletedStep: "step-one",
          });
      },
    });

    const tree = render(App);
    const chevrons = tree.container.querySelectorAll(".spectrum-Steplist-chevron");
    const segments = tree.container.querySelectorAll(".spectrum-Steplist-segment");

    expect(chevrons).toHaveLength(4);
    expect(segments).toHaveLength(4);
    expect(chevrons[0]?.className).toContain("is-reversed");
    expect(segments[0]?.className).toContain("is-completed");
  });

  it("exports Item alias", () => {
    expect(Item).toBe(StepListItem);
  });
});
