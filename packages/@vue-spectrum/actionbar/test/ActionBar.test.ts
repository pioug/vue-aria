import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { ActionBar, ActionBarContainer, ActionBarItem, Item } from "../src";

const items = [
  { key: "edit", label: "Edit" },
  { key: "copy", label: "Copy" },
  { key: "delete", label: "Delete" },
];

function renderWithProvider(
  component: ReturnType<typeof h>,
  options: { locale?: string } = {}
) {
  const App = defineComponent({
    name: "ActionBarTestApp",
    setup() {
      return () =>
        h(
          Provider,
          {
            theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
            locale: options.locale,
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

function renderRowRestoreHarness(
  actionItems: { key: string; label: string }[] = [{ key: "delete", label: "Delete" }]
) {
  const Harness = defineComponent({
    name: "ActionBarRowRestoreHarness",
    setup() {
      const rows = ref(["Foo 1", "Foo 2", "Foo 3"]);
      const selectedRow = ref<string | null>(null);

      const removeSelectedRow = () => {
        if (!selectedRow.value) {
          return;
        }

        const currentSelection = selectedRow.value;
        rows.value = rows.value.filter((row) => row !== currentSelection);
        selectedRow.value = null;
      };

      return () =>
        h("div", [
          h(
            "div",
            {
              role: "grid",
              "aria-label": "rows grid",
            },
            rows.value.map((row) =>
              h(
                "div",
                {
                  key: row,
                  role: "row",
                  tabindex: 0,
                  onClick: () => {
                    selectedRow.value = row;
                  },
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      selectedRow.value = row;
                    }
                  },
                },
                [
                  h(
                    "span",
                    {
                      role: "rowheader",
                    },
                    row
                  ),
                ]
              )
            )
          ),
          h(ActionBar, {
            selectedItemCount: selectedRow.value ? 1 : 0,
            items: actionItems,
            onClearSelection: () => {
              selectedRow.value = null;
            },
            onAction: (key: string | number) => {
              if (key === "delete") {
                removeSelectedRow();
                return;
              }

              selectedRow.value = null;
            },
          }),
        ]);
    },
  });

  return renderWithProvider(h(Harness));
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

  it("should open when there are selected items", () => {
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

  it("should update the selected count when selecting more items", async () => {
    const user = userEvent.setup();

    const Harness = defineComponent({
      name: "ActionBarSelectedCountHarness",
      setup() {
        const selectedItemCount = ref(1);

        return () =>
          h("div", [
            h(
              "button",
              {
                type: "button",
                "data-testid": "add-selection",
                onClick: () => {
                  selectedItemCount.value += 1;
                },
              },
              "add selection"
            ),
            h(ActionBar, {
              selectedItemCount: selectedItemCount.value,
              items,
            }),
          ]);
      },
    });

    const tree = renderWithProvider(h(Harness));
    expect(tree.getByRole("status").textContent).toBe("1 selected");

    await user.click(tree.getByTestId("add-selection"));

    expect(tree.getByRole("status").textContent).toBe("2 selected");
  });

  it("localizes built-in labels with provider locale", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 2,
        items,
      }),
      { locale: "fr-FR" }
    );

    expect(tree.getByRole("toolbar", { name: "Actions" })).toBeTruthy();
    expect(tree.getByLabelText("Supprimer la selection").tagName).toBe("BUTTON");
    expect(tree.getByText("Effacer")).toBeTruthy();
    expect(tree.getByRole("status").textContent).toMatch(/2.*selectionnes/);
  });

  it("should work with select all", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: "all",
        items,
      })
    );

    expect(tree.getAllByText("All selected").length).toBeGreaterThan(0);
    expect(tree.getByRole("status").textContent).toBe("All selected");
  });

  it("should fire onAction when clicking on an action", async () => {
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

  it("should respect disabledKeys when passed in", () => {
    const tree = renderWithProvider(
      h(ActionBar, {
        selectedItemCount: 1,
        items,
        disabledKeys: ["edit"],
      })
    );

    const toolbar = tree.getByRole("toolbar", { name: "Actions" });
    const actions = within(toolbar).getAllByRole("button");
    expect(actions[0]?.getAttribute("disabled")).not.toBeNull();
    expect(actions[1]?.getAttribute("disabled")).toBeNull();
  });

  it("collapses actions into an overflow menu when action buttons do not fit", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const clientWidthSpy = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionGroup")) {
          return 220;
        }

        return 0;
      });
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains("spectrum-ActionButton")) {
          return 100;
        }

        return 0;
      });

    try {
      const tree = renderWithProvider(
        h(ActionBar, {
          selectedItemCount: 1,
          items,
          onAction,
        })
      );

      await Promise.resolve();
      await Promise.resolve();

      const moreButton = tree.getByRole("button", { name: "More items" });
      await user.click(moreButton);

      await user.click(tree.getByRole("menuitem", { name: "Copy" }));
      expect(onAction).toHaveBeenCalledWith("copy");
    } finally {
      clientWidthSpy.mockRestore();
      offsetWidthSpy.mockRestore();
    }
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

  it("should close and restore focus when pressing the clear button", async () => {
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

  it("should close when pressing the escape key", async () => {
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

  it(
    "should restore focus where it came from after being closed via escape if no elements are removed",
    async () => {
      const user = userEvent.setup();
      const tree = renderRowRestoreHarness();
      const rows = tree.getAllByRole("row");
      const firstRow = rows[0] as HTMLElement;

      firstRow.focus();
      expect(document.activeElement).toBe(firstRow);

      await user.keyboard("{Enter}");

      const toolbar = tree.getByRole("toolbar", { name: "Actions" });
      expect(toolbar).toBeTruthy();
      expect(document.activeElement).toBe(firstRow);

      const actionButtons = within(toolbar).getAllByRole("button");
      (actionButtons[0] as HTMLElement).focus();

      await user.keyboard("{Escape}");
      await Promise.resolve();
      await Promise.resolve();

      expect(tree.queryByRole("toolbar")).toBeNull();
      expect(document.activeElement).toBe(firstRow);
    }
  );

  it(
    "should restore focus to the the new first row if the row we wanted to restore to was removed",
    async () => {
      const user = userEvent.setup();
      const tree = renderRowRestoreHarness();
      const rows = tree.getAllByRole("row");
      const firstRow = rows[0] as HTMLElement;

      firstRow.focus();
      await user.keyboard("{Enter}");

      const toolbar = tree.getByRole("toolbar", { name: "Actions" });
      const actionButtons = within(toolbar).getAllByRole("button");
      await user.click(actionButtons[0] as HTMLElement);
      await Promise.resolve();
      await Promise.resolve();

      const remainingRows = tree.getAllByRole("row");
      expect(remainingRows[0]?.textContent).toContain("Foo 2");
      expect(document.activeElement).toBe(remainingRows[0]);
    }
  );

  it(
    "should restore focus to the new first row if the row we wanted to restore to was removed via actiongroup menu",
    async () => {
      const user = userEvent.setup();
      const clientWidthSpy = vi
        .spyOn(HTMLElement.prototype, "clientWidth", "get")
        .mockImplementation(function (this: HTMLElement) {
          if (this.classList.contains("spectrum-ActionGroup")) {
            return 220;
          }

          return 0;
        });
      const offsetWidthSpy = vi
        .spyOn(HTMLElement.prototype, "offsetWidth", "get")
        .mockImplementation(function (this: HTMLElement) {
          if (this.classList.contains("spectrum-ActionButton")) {
            return 100;
          }

          return 0;
        });

      try {
        const tree = renderRowRestoreHarness(items);
        const rows = tree.getAllByRole("row");
        const firstRow = rows[0] as HTMLElement;

        firstRow.focus();
        await user.keyboard("{Enter}");
        await Promise.resolve();
        await Promise.resolve();

        const moreButton = tree.getByRole("button", { name: "More items" });
        await user.click(moreButton);
        await user.click(tree.getByRole("menuitem", { name: "Delete" }));
        await Promise.resolve();
        await Promise.resolve();

        const remainingRows = tree.getAllByRole("row");
        expect(remainingRows[0]?.textContent).toContain("Foo 2");
        expect(document.activeElement).toBe(remainingRows[0]);
      } finally {
        clientWidthSpy.mockRestore();
        offsetWidthSpy.mockRestore();
      }
    }
  );

  it("keeps the action bar mounted for the close transition tick", async () => {
    const Harness = defineComponent({
      name: "ActionBarTransitionHarness",
      setup() {
        const selectedItemCount = ref(1);

        return () =>
          h("div", [
            h(
              "button",
              {
                type: "button",
                "data-testid": "close-actionbar",
                onClick: () => {
                  selectedItemCount.value = 0;
                },
              },
              "close"
            ),
            h(ActionBar, {
              selectedItemCount: selectedItemCount.value,
              items,
            }),
          ]);
      },
    });

    const tree = renderWithProvider(h(Harness));
    expect(tree.getByRole("toolbar", { name: "Actions" })).toBeTruthy();

    fireEvent.click(tree.getByTestId("close-actionbar"));
    await Promise.resolve();

    const root = tree.container.querySelector(".react-spectrum-ActionBar");
    expect(root).toBeTruthy();
    expect(root?.classList.contains("is-open")).toBe(false);
    expect(root?.classList.contains("is-closing")).toBe(true);
    expect(tree.getAllByText("1 selected").length).toBeGreaterThan(0);

    await Promise.resolve();
    await Promise.resolve();
    expect(tree.queryByRole("toolbar")).toBeNull();
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

  it("exports Item alias", () => {
    expect(Item).toBe(ActionBarItem);
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
