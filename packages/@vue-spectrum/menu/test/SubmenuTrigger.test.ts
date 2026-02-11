import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { SubmenuTrigger } from "../src";

const items = [
  { key: "rename", label: "Rename" },
  { key: "delete", label: "Delete" },
];

function getSubmenuElement(tree: ReturnType<typeof render>) {
  const trigger = tree.getByRole("menuitem", { name: "More" });
  const submenuId = trigger.getAttribute("aria-controls");
  expect(submenuId).toBeTruthy();
  const submenu = tree.container.querySelector(`#${submenuId as string}`);
  expect(submenu).toBeTruthy();
  return submenu as HTMLElement;
}

function renderComponent(props: Record<string, unknown> = {}) {
  const App = defineComponent({
    name: "SubmenuTriggerHarness",
    setup() {
      return () =>
        h(
          "ul",
          {
            role: "menu",
            "aria-label": "Root",
          },
          [
            h(SubmenuTrigger, {
              label: "More",
              items,
              ...props,
            }),
          ]
        );
    },
  });

  return render(App);
}

describe("SubmenuTrigger", () => {
  it("opens and closes nested submenu on click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({ onOpenChange });

    const trigger = tree.getByRole("menuitem", { name: "More" });
    expect(tree.queryByRole("menu", { name: "More" })).toBeNull();

    await user.click(trigger);

    const submenu = getSubmenuElement(tree);
    expect(submenu).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.click(trigger);
    expect(tree.container.contains(submenu)).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("fires action and closes after selecting an item", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const tree = renderComponent({ onAction });

    const trigger = tree.getByRole("menuitem", { name: "More" });
    await user.click(trigger);

    const submenu = getSubmenuElement(tree);
    const submenuItems = within(submenu).getAllByRole("menuitem");
    await user.click(submenuItems[1] as Element);

    expect(onAction).toHaveBeenCalledWith("delete");
    expect(tree.container.contains(submenu)).toBe(false);
  });

  it("supports keyboard open and close", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();

    const trigger = tree.getByRole("menuitem", { name: "More" });
    trigger.focus();

    await user.keyboard("{ArrowRight}");
    const submenu = getSubmenuElement(tree);
    expect(submenu).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(tree.container.contains(submenu)).toBe(false);
  });
});
