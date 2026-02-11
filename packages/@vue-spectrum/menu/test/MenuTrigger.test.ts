import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { MenuTrigger, type SpectrumMenuItemData } from "../src";

const items: SpectrumMenuItemData[] = [
  { key: "foo", label: "Foo" },
  { key: "bar", label: "Bar" },
  { key: "baz", label: "Baz" },
];

const sections = [
  {
    key: "actions",
    heading: "Actions",
    items: [{ key: "foo", label: "Foo" }],
  },
  {
    key: "secondary",
    heading: "Secondary",
    items: [{ key: "bar", label: "Bar" }],
  },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(MenuTrigger, {
    props: {
      triggerLabel: "Menu Button",
      items,
      ...props,
    },
  });
}

describe("MenuTrigger", () => {
  it("opens and closes on click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({ onOpenChange });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    expect(tree.queryByRole("menu")).toBeNull();

    await user.click(trigger);

    const menu = tree.getByRole("menu");
    expect(menu).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.click(trigger);
    expect(tree.queryByRole("menu")).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const App = defineComponent({
      name: "ControlledMenuTriggerHarness",
      setup() {
        const isOpen = ref(true);
        return () =>
          h(MenuTrigger, {
            triggerLabel: "Menu Button",
            items,
            isOpen: isOpen.value,
            onOpenChange,
          });
      },
    });

    const tree = render(App);
    const trigger = tree.getByRole("button", { name: "Menu Button" });

    expect(tree.getByRole("menu")).toBeTruthy();

    await user.click(trigger);

    expect(tree.getByRole("menu")).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("supports defaultOpen", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      defaultOpen: true,
      onOpenChange,
    });

    expect(tree.getByRole("menu")).toBeTruthy();

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    await user.click(trigger);

    expect(tree.queryByRole("menu")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("opens on ArrowDown and focuses first item", async () => {
    const tree = renderComponent();
    const trigger = tree.getByRole("button", { name: "Menu Button" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await Promise.resolve();

    const menu = tree.getByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitem");

    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("opens on ArrowUp and focuses last item", async () => {
    const tree = renderComponent();
    const trigger = tree.getByRole("button", { name: "Menu Button" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    await Promise.resolve();

    const menu = tree.getByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitem");

    await Promise.resolve();
    expect(document.activeElement).toBe(menuItems[2]);
  });

  it("fires onAction and closes on selection by default", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    const tree = renderComponent({ onAction, onOpenChange });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    await user.click(trigger);

    const menu = tree.getByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitem");

    await user.click(menuItems[0] as Element);

    expect(onAction).toHaveBeenCalledWith("foo");
    expect(tree.queryByRole("menu")).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("does not close on select when closeOnSelect is false", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      selectionMode: "multiple",
      closeOnSelect: false,
    });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    await user.click(trigger);

    const menu = tree.getByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitemcheckbox");

    await user.click(menuItems[0] as Element);
    expect(tree.getByRole("menu")).toBeTruthy();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      isDisabled: true,
    });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    expect(trigger.getAttribute("disabled")).not.toBeNull();

    await user.click(trigger);
    expect(tree.queryByRole("menu")).toBeNull();
  });

  it("passes sections to the menu overlay", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      items: undefined,
      sections,
    });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    await user.click(trigger);

    expect(tree.getByRole("group", { name: "Actions" })).toBeTruthy();
    expect(tree.getByRole("group", { name: "Secondary" })).toBeTruthy();
    expect(tree.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("positions the menu in an anchored overlay", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      placement: "top",
    });

    const trigger = tree.getByRole("button", { name: "Menu Button" });
    await user.click(trigger);

    const popover = tree.baseElement.querySelector(
      "[data-testid=\"menu-trigger-popover\"]"
    ) as HTMLElement | null;
    expect(popover).toBeTruthy();
    expect(popover?.getAttribute("data-placement")).not.toBeNull();
    expect(popover?.style.position.length).toBeGreaterThan(0);
    expect(popover?.style.zIndex).toBe("100000");
  });
});
