import { render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { ActionMenu, type SpectrumMenuItemData } from "../src";

const items: SpectrumMenuItemData[] = [
  { key: "foo", label: "Foo" },
  { key: "bar", label: "Bar" },
  { key: "baz", label: "Baz" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(ActionMenu, {
    props: {
      items,
      ...props,
    },
  });
}

describe("ActionMenu", () => {
  it("renders with default aria label and triggers actions", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const tree = renderComponent({ onAction });

    const trigger = tree.getByRole("button", { name: "More actions" });
    expect(trigger.getAttribute("aria-label")).toBe("More actions");

    await user.click(trigger);
    const menu = tree.getByRole("menu");
    const item = within(menu).getByRole("menuitem", { name: "Foo" });

    await user.click(item);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("foo");
  });

  it("supports custom aria label", () => {
    const tree = renderComponent({
      "aria-label": "Custom Aria Label",
    });

    const trigger = tree.getByRole("button", { name: "Custom Aria Label" });
    expect(trigger.getAttribute("aria-label")).toBe("Custom Aria Label");
  });

  it("prioritizes aria-labelledby over default aria-label", () => {
    const externalLabel = document.createElement("span");
    externalLabel.id = "actionmenu-external-label";
    externalLabel.textContent = "External menu label";
    document.body.append(externalLabel);

    try {
      const tree = renderComponent({
        ariaLabelledby: "actionmenu-external-label",
      });

      const trigger = tree.getByRole("button", { name: "External menu label" });
      expect(trigger.getAttribute("aria-label")).toBeNull();
      expect(trigger.getAttribute("aria-labelledby")).toBe(
        "actionmenu-external-label"
      );
    } finally {
      externalLabel.remove();
    }
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ isDisabled: true });

    const trigger = tree.getByRole("button", { name: "More actions" });
    expect(trigger.getAttribute("disabled")).not.toBeNull();

    await user.click(trigger);
    expect(tree.queryByRole("menu")).toBeNull();
  });

  it("supports autoFocus", async () => {
    const tree = renderComponent({ autoFocus: true });
    await nextTick();
    await nextTick();

    const trigger = tree.getByRole("button", { name: "More actions" });
    expect(document.activeElement).toBe(trigger);
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      isOpen: true,
      onOpenChange,
    });

    const trigger = tree.getByRole("button", { name: "More actions" });
    expect(tree.getByRole("menu")).toBeTruthy();

    await user.click(trigger);
    expect(tree.getByRole("menu")).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports uncontrolled default open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      defaultOpen: true,
      onOpenChange,
    });

    const trigger = tree.getByRole("button", { name: "More actions" });
    expect(tree.getByRole("menu")).toBeTruthy();

    await user.click(trigger);
    expect(tree.queryByRole("menu")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
