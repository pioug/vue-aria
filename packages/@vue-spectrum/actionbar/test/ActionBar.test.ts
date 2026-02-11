import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { ActionBar, ActionBarContainer, ActionBarItem } from "../src";

const items = [
  { key: "edit", label: "Edit" },
  { key: "copy", label: "Copy" },
  { key: "delete", label: "Delete" },
];

function renderWithProvider(component: ReturnType<typeof h>) {
  const App = defineComponent({
    name: "ActionBarTestApp",
    setup() {
      return () =>
        h(
          Provider,
          {
            theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
          },
          {
            default: () => component,
          }
        );
    },
  });

  return render(App);
}

function renderFocusRestoreHarness() {
  const onClearSelection = vi.fn();

  const Harness = defineComponent({
    name: "ActionBarFocusRestoreHarness",
    setup() {
      const selectedItemCount = ref(0);

      return () =>
        h("div", [
          h("input", {
            type: "checkbox",
            "aria-label": "row checkbox",
            checked: selectedItemCount.value > 0,
            onClick: () => {
              selectedItemCount.value =
                selectedItemCount.value > 0 ? 0 : 1;
            },
          }),
          h(ActionBar, {
            selectedItemCount: selectedItemCount.value,
            items,
            onClearSelection: () => {
              onClearSelection();
              selectedItemCount.value = 0;
            },
          }),
        ]);
    },
  });

  const tree = renderWithProvider(h(Harness));
  return { tree, onClearSelection };
}

describe("ActionBar", () => {
  it("is closed when there are no selected items", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 0,
        items,
      })
    );

    expect(tree.queryByRole("toolbar")).toBeNull();
  });

  it("opens when selected items are present", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 1,
        items,
      })
    );

    const toolbar = tree.getByRole("toolbar", { name: "Actions" });
    expect(toolbar).toBeTruthy();

    const actions = within(toolbar).getAllByRole("button");
    expect(actions).toHaveLength(3);

    expect(tree.getAllByText("1 selected").length).toBeGreaterThan(0);
    expect(tree.getByRole("status").textContent).toBe("1 selected");
    expect(tree.getByLabelText("Clear selection").tagName).toBe("BUTTON");
  });

  it("shows all-selected copy", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: "all",
        items,
      })
    );

    expect(tree.getAllByText("All selected").length).toBeGreaterThan(0);
    expect(tree.getByRole("status").textContent).toBe("All selected");
  });

  it("fires onAction when an action is pressed", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 1,
        items,
        onAction,
      })
    );

    const toolbar = tree.getByRole("toolbar", { name: "Actions" });
    const actions = within(toolbar).getAllByRole("button");

    await user.click(actions[0]);

    expect(onAction).toHaveBeenCalledWith("edit");
  });

  it("fires onClearSelection from clear button", async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn();

    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 1,
        items,
        onClearSelection,
      })
    );

    await user.click(tree.getByLabelText("Clear selection"));

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("fires onClearSelection on Escape", () => {
    const onClearSelection = vi.fn();

    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 1,
        items,
        onClearSelection,
      })
    );

    const root = tree.container.querySelector(".react-spectrum-ActionBar");
    expect(root).toBeTruthy();

    if (root) {
      fireEvent.keyDown(root, { key: "Escape" });
    }

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("closes and restores focus when pressing clear", async () => {
    const user = userEvent.setup();
    const { tree, onClearSelection } = renderFocusRestoreHarness();
    const rowCheckbox = tree.getByRole("checkbox", { name: "row checkbox" });

    await user.click(rowCheckbox);
    expect(tree.getByRole("toolbar", { name: "Actions" })).toBeTruthy();
    expect(document.activeElement).toBe(rowCheckbox);

    const clearButton = tree.getByLabelText("Clear selection");
    (clearButton as HTMLElement).focus();
    await user.click(clearButton);
    await Promise.resolve();

    expect(onClearSelection).toHaveBeenCalledTimes(1);
    expect(tree.queryByRole("toolbar")).toBeNull();
    expect(document.activeElement).toBe(rowCheckbox);
  });

  it("closes and restores focus when pressing Escape", async () => {
    const user = userEvent.setup();
    const { tree, onClearSelection } = renderFocusRestoreHarness();
    const rowCheckbox = tree.getByRole("checkbox", { name: "row checkbox" });

    await user.click(rowCheckbox);
    const toolbar = tree.getByRole("toolbar", { name: "Actions" });
    const actionButtons = within(toolbar).getAllByRole("button");
    (actionButtons[0] as HTMLElement).focus();

    await user.keyboard("{Escape}");
    await Promise.resolve();

    expect(onClearSelection).toHaveBeenCalledTimes(1);
    expect(tree.queryByRole("toolbar")).toBeNull();
    expect(document.activeElement).toBe(rowCheckbox);
  });

  it("supports static slot syntax with ActionBarItem", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const tree = renderWithProvider(
      h(
        ActionBar,
        {
          selectedItemCount: 1,
          onAction,
        },
        {
          default: () => [
            h(ActionBarItem, { id: "edit" }, () => "Edit"),
            h(ActionBarItem, { id: "copy", isDisabled: true }, () => "Copy"),
            h(ActionBarItem, { id: "delete" }, () => "Delete"),
          ],
        }
      )
    );

    const toolbar = tree.getByRole("toolbar", { name: "Actions" });
    const actions = within(toolbar).getAllByRole("button");
    expect(actions).toHaveLength(3);
    expect(actions[1]?.getAttribute("disabled")).not.toBeNull();

    await user.click(actions[0] as HTMLElement);
    expect(onAction).toHaveBeenCalledWith("edit");
  });
});

describe("ActionBarContainer", () => {
  it("wraps children and applies the container class", () => {
    const tree = renderWithProvider(
      h(
        ActionBarContainer,
        {
          "data-testid": "container",
        },
        {
          default: () => h("div", { "data-testid": "child" }, "Child"),
        }
      )
    );

    const container = tree.getByTestId("container");
    expect(container.className).toContain("ActionBarContainer");
    expect(tree.getByTestId("child").textContent).toBe("Child");
  });
});
