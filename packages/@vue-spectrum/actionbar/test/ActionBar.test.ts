import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
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

    expect(tree.getByText("1 selected")).toBeTruthy();
    expect(tree.getByLabelText("Clear selection").tagName).toBe("BUTTON");
  });

  it("shows all-selected copy", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: "all",
        items,
      })
    );

    expect(tree.getByText("All selected")).toBeTruthy();
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

    const root = tree.getByText("1 selected").closest(".react-spectrum-ActionBar");
    expect(root).toBeTruthy();

    if (root) {
      fireEvent.keyDown(root, { key: "Escape" });
    }

    expect(onClearSelection).toHaveBeenCalledTimes(1);
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
