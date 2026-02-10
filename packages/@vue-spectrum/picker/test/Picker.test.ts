import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Picker, type SpectrumPickerItemData } from "../src";

const items: SpectrumPickerItemData[] = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(Picker, {
    props: {
      "aria-label": "picker-test",
      items,
      ...props,
    },
  });
}

describe("Picker", () => {
  it("renders correctly", () => {
    const tree = renderComponent({
      "data-testid": "test",
    });

    const root = tree.getByTestId("test");
    expect(root).toBeTruthy();

    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    expect(tree.getByText("Select…")).toBeTruthy();
  });

  it("opens on click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const tree = renderComponent({ onOpenChange });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    await user.click(trigger);

    const listbox = tree.getByRole("listbox");
    expect(listbox).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("opens on ArrowDown and focuses first option", async () => {
    const tree = renderComponent();
    const trigger = tree.getByRole("button", { name: "picker-test" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await Promise.resolve();

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);

    await Promise.resolve();
    expect(document.activeElement).toBe(options[0]);
  });

  it("opens on ArrowUp and focuses last option", async () => {
    const tree = renderComponent();
    const trigger = tree.getByRole("button", { name: "picker-test" });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    await Promise.resolve();

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await Promise.resolve();
    expect(document.activeElement).toBe(options[2]);
  });

  it("selects an item and closes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const tree = renderComponent({
      onSelectionChange,
      onOpenChange,
    });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    await user.click(trigger);

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await user.click(options[1]);

    expect(onSelectionChange).toHaveBeenCalledWith("2");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(tree.getByText("Two")).toBeTruthy();
  });

  it("supports controlled selectedKey updates", async () => {
    const tree = renderComponent({
      selectedKey: "1",
    });

    expect(tree.getByText("One")).toBeTruthy();

    await tree.rerender({
      "aria-label": "picker-test",
      items,
      selectedKey: "3",
    });

    expect(tree.getByText("Three")).toBeTruthy();
  });

  it("supports item key empty string with keyboard navigation", async () => {
    const user = userEvent.setup();
    const tree = render(Picker, {
      props: {
        "aria-label": "picker-test",
        items: [
          { key: "1", label: "One" },
          { key: "", label: "Two" },
          { key: "3", label: "Three" },
        ],
      },
    });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await Promise.resolve();

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await Promise.resolve();
    expect(document.activeElement).toBe(options[0]);

    await user.keyboard("{ArrowDown}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[1]);

    await user.keyboard("{ArrowDown}");
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(options[2]);
  });

  it("is disabled when isDisabled is true", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({
      isDisabled: true,
    });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(trigger.getAttribute("disabled")).not.toBeNull();

    await user.click(trigger);
    expect(tree.queryByRole("listbox")).toBeNull();
  });
});
