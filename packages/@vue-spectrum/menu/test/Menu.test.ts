import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu, type SpectrumMenuItemData } from "../src";

const items: SpectrumMenuItemData[] = [
  { key: "foo", label: "Foo" },
  { key: "bar", label: "Bar" },
  { key: "baz", label: "Baz" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(Menu, {
    props: {
      items,
      "aria-label": "menu-test",
      ...props,
    },
  });
}

describe("Menu", () => {
  it("renders properly", () => {
    const tree = renderComponent();
    const menu = tree.getByRole("menu", { name: "menu-test" });

    expect(menu).toBeTruthy();

    const menuItems = within(menu).getAllByRole("menuitem");
    expect(menuItems).toHaveLength(3);
    expect(menuItems[0]?.textContent).toContain("Foo");
    expect(menuItems[1]?.textContent).toContain("Bar");
    expect(menuItems[2]?.textContent).toContain("Baz");
  });

  it("allows changing focus via arrow keys", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ autoFocus: "first" });
    await Promise.resolve();

    const menuItems = tree.getAllByRole("menuitem");
    (menuItems[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(menuItems[0]);

    await user.keyboard("{ArrowDown}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[1]);

    await user.keyboard("{ArrowUp}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("wraps focus when shouldFocusWrap is true", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ autoFocus: "first", shouldFocusWrap: true });
    await Promise.resolve();

    const menuItems = tree.getAllByRole("menuitem");
    (menuItems[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(menuItems[0]);

    await user.keyboard("{ArrowUp}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[2]);

    await user.keyboard("{ArrowDown}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("supports single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      defaultSelectedKeys: ["bar"],
      onSelectionChange,
      autoFocus: "first",
    });

    const menuItems = tree.getAllByRole("menuitemradio");
    expect(menuItems[1]?.getAttribute("aria-checked")).toBe("true");

    await user.click(menuItems[2] as Element);
    await Promise.resolve();

    expect(menuItems[2]?.getAttribute("aria-checked")).toBe("true");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const selected = onSelectionChange.mock.calls[0]?.[0] as Set<string>;
    expect(Array.from(selected)).toEqual(["baz"]);
  });

  it("supports disabled items", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const tree = renderComponent({
      selectionMode: "single",
      disabledKeys: ["baz"],
      onAction,
    });

    const menuItems = tree.getAllByRole("menuitemradio");
    expect(menuItems[2]?.getAttribute("aria-disabled")).toBe("true");

    await user.click(menuItems[2] as Element);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("calls onClose on escape", () => {
    const onClose = vi.fn();
    const tree = renderComponent({
      onClose,
    });

    const menu = tree.getByRole("menu", { name: "menu-test" });
    fireEvent.keyDown(menu, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
