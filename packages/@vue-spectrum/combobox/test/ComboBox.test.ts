import { fireEvent, render, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ComboBox, type SpectrumComboBoxItemData } from "../src";

const items: SpectrumComboBoxItemData[] = [
  { key: "1", label: "One" },
  { key: "2", label: "Two" },
  { key: "3", label: "Three" },
];

function renderComponent(props: Record<string, unknown> = {}) {
  return render(ComboBox, {
    props: {
      label: "Test",
      items,
      ...props,
    },
  });
}

describe("ComboBox", () => {
  it("renders correctly", () => {
    const tree = renderComponent();
    expect(tree.getByRole("combobox")).toBeTruthy();
    expect(tree.getByRole("button")).toBeTruthy();
    expect(tree.getByText("Test")).toBeTruthy();
  });

  it("opens with button press and closes on second press", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();

    const button = tree.getByRole("button");
    await user.click(button);

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);

    await user.click(button);
    expect(tree.queryByRole("listbox")).toBeNull();
  });

  it("opens with ArrowDown and commits selection with Enter", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const tree = renderComponent({ onSelectionChange });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    input.focus();
    await user.keyboard("{ArrowDown}");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(input.getAttribute("aria-expanded")).toBe("true");

    await user.keyboard("{Enter}");

    expect(input.value).toBe("One");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(onSelectionChange).toHaveBeenCalledWith("1");
    expect(options[0]?.id).toContain("option");
  });

  it("filters by input text", async () => {
    const user = userEvent.setup();
    const tree = renderComponent();
    const input = tree.getByRole("combobox") as HTMLInputElement;

    await user.click(input);
    await user.type(input, "th");

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent).toContain("Three");
  });

  it("supports controlled selectedKey", () => {
    const tree = renderComponent({
      selectedKey: "2",
    });

    const input = tree.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Two");
  });

  it("does not open when disabled or readOnly", async () => {
    const user = userEvent.setup();

    const disabledTree = renderComponent({ isDisabled: true });
    await user.click(
      within(disabledTree.container as HTMLElement).getByRole("button") as HTMLElement
    );
    expect(disabledTree.queryByRole("listbox")).toBeNull();

    const readOnlyTree = renderComponent({ isReadOnly: true });
    await user.click(
      within(readOnlyTree.container as HTMLElement).getByRole("button") as HTMLElement
    );
    expect(readOnlyTree.queryByRole("listbox")).toBeNull();
  });

  it("renders loading state and fires onLoadMore", () => {
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
        defaultOpen: true,
        loadingState: "idle",
        onLoadMore,
      });

      const listbox = tree.getByRole("listbox");
      (listbox as HTMLElement).scrollTop = 2000;
      fireEvent.scroll(listbox);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it("renders loading indicator", () => {
    const tree = renderComponent({
      defaultOpen: true,
      loadingState: "loadingMore",
    });

    expect(tree.getByRole("progressbar")).toBeTruthy();
  });
});
