import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  Picker,
  PickerItem,
  PickerSection,
  type SpectrumPickerItemData,
} from "../src";

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

  it("renders loading indicator in trigger when loading with no items", () => {
    const tree = render(Picker, {
      props: {
        "aria-label": "picker-test",
        items: [],
        isLoading: true,
      },
    });

    expect(tree.getByRole("progressbar")).toBeTruthy();
  });

  it("renders picker popover with placement positioning styles", async () => {
    const user = userEvent.setup();
    const tree = renderComponent({ placement: "top end" });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    await user.click(trigger);

    const popover = tree.baseElement.querySelector(
      "[data-testid=\"picker-popover\"]"
    ) as HTMLElement | null;
    expect(popover).toBeTruthy();
    expect(popover?.getAttribute("data-placement")).not.toBeNull();
    expect(popover?.style.position.length).toBeGreaterThan(0);
    expect(popover?.style.zIndex).toBe("100000");

    const listbox = within(popover as HTMLElement).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("fires onLoadMore when listbox scrolls near the end", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 1200;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 300;
        }
        return 0;
      });

    try {
      const tree = renderComponent({
        onLoadMore,
      });

      const trigger = tree.getByRole("button", { name: "picker-test" });
      await user.click(trigger);

      const listbox = tree.getByRole("listbox");
      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("does not fire onLoadMore while loading", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 1200;
        }
        return 0;
      });
    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute("role") === "listbox") {
          return 300;
        }
        return 0;
      });

    try {
      const tree = renderComponent({
        isLoading: true,
        onLoadMore,
      });

      const trigger = tree.getByRole("button", { name: "picker-test" });
      await user.click(trigger);

      const listbox = tree.getByRole("listbox");
      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);

      expect(onLoadMore).not.toHaveBeenCalled();
      expect(tree.getAllByRole("progressbar").length).toBeGreaterThan(0);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
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

  it("supports static slot syntax with PickerItem and PickerSection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const App = defineComponent({
      name: "PickerSlotApp",
      setup() {
        return () =>
          h(
            Picker,
            {
              "aria-label": "picker-test",
              onSelectionChange,
            },
            {
              default: () => [
                h(PickerSection, { id: "favorites", title: "Favorites" }, {
                  default: () => [
                    h(PickerItem, { id: "fav-1" }, () => "One"),
                    h(PickerItem, { id: "fav-2", isDisabled: true }, () => "Two"),
                  ],
                }),
                h(PickerItem, { id: "other-1" }, () => "Three"),
              ],
            }
          );
      },
    });

    const tree = render(App);
    const trigger = tree.getByRole("button", { name: "picker-test" });

    await user.click(trigger);
    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[1]?.getAttribute("aria-disabled")).toBe("true");

    await user.click(options[2] as Element);
    expect(onSelectionChange).toHaveBeenCalledWith("other-1");
    expect(tree.getByText("Three")).toBeTruthy();
  });
});
