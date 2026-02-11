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

  it("focuses trigger on mount when autoFocus is enabled", async () => {
    const tree = renderComponent({
      autoFocus: true,
    });

    await Promise.resolve();
    await Promise.resolve();

    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(document.activeElement).toBe(trigger);
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

    const progressbar = tree.getByRole("progressbar");
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute("aria-label")).toBe("Loading…");
    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(trigger.getAttribute("aria-describedby")).toBe(progressbar.getAttribute("id"));
  });

  it("merges existing aria-describedby with loading progress indicator", () => {
    const tree = render(Picker, {
      props: {
        "aria-label": "picker-test",
        items: [],
        isLoading: true,
      },
      attrs: {
        "aria-describedby": "existing-description",
      },
    });

    const progressbar = tree.getByRole("progressbar");
    const trigger = tree.getByRole("button", { name: "picker-test" });
    const describedby = trigger.getAttribute("aria-describedby");
    expect(describedby).toBeTruthy();
    expect((describedby ?? "").split(" ")).toEqual(
      expect.arrayContaining(["existing-description", progressbar.getAttribute("id") ?? ""])
    );
  });

  it("renders picker popover with placement positioning styles", async () => {
    const user = userEvent.setup();
    const desktopSpy = vi
      .spyOn(window.screen, "width", "get")
      .mockImplementation(() => 701);

    try {
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
    } finally {
      desktopSpy.mockRestore();
    }
  });

  it("renders picker listbox in tray mode on mobile devices", async () => {
    const user = userEvent.setup();
    const mobileSpy = vi
      .spyOn(window.screen, "width", "get")
      .mockImplementation(() => 700);

    try {
      const tree = renderComponent();
      const trigger = tree.getByRole("button", { name: "picker-test" });
      await user.click(trigger);

      const tray = tree.baseElement.querySelector(
        "[data-testid=\"picker-tray\"]"
      ) as HTMLElement | null;
      expect(tray).toBeTruthy();
      expect(
        tree.baseElement.querySelector("[data-testid=\"picker-popover\"]")
      ).toBeNull();
      expect(within(tray as HTMLElement).getByRole("listbox")).toBeTruthy();
    } finally {
      mobileSpy.mockRestore();
    }
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
      const progressbars = tree.getAllByRole("progressbar");
      expect(progressbars.length).toBeGreaterThan(0);
      expect(progressbars[0]?.getAttribute("aria-label")).toBe("Loading more…");
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

  it("applies invalid state class and aria-invalid", () => {
    const tree = renderComponent({
      validationState: "invalid",
    });

    const root = tree.container.querySelector(".spectrum-Dropdown");
    expect(root?.classList.contains("is-invalid")).toBe(true);

    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });

  it("marks required semantics on trigger and hidden input", () => {
    const tree = render(Picker, {
      props: {
        "aria-label": "picker-test",
        items,
        name: "picker",
        isRequired: true,
      },
    });

    const trigger = tree.getByRole("button", { name: "picker-test" });
    expect(trigger.getAttribute("aria-required")).toBe("true");

    const hiddenInput = tree.container.querySelector(
      "input[name=\"picker\"]"
    ) as HTMLInputElement | null;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput?.required).toBe(true);
  });

  it("submits empty option by default when used in a form", () => {
    let submittedValue: FormDataEntryValue | undefined;
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      submittedValue = formData.get("picker") ?? undefined;
    });

    const App = defineComponent({
      name: "PickerFormSubmitEmptyApp",
      setup() {
        return () =>
          h("form", { "data-testid": "form", onSubmit }, [
            h(Picker, {
              "aria-label": "picker-test",
              name: "picker",
              items,
            }),
            h("button", { type: "submit" }, "submit"),
          ]);
      },
    });

    const tree = render(App);
    fireEvent.submit(tree.getByTestId("form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submittedValue).toBe("");
  });

  it("submits defaultSelectedKey in a form", () => {
    let submittedValue: FormDataEntryValue | undefined;
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      submittedValue = formData.get("picker") ?? undefined;
    });

    const App = defineComponent({
      name: "PickerFormSubmitDefaultApp",
      setup() {
        return () =>
          h("form", { "data-testid": "form", onSubmit }, [
            h(Picker, {
              "aria-label": "picker-test",
              name: "picker",
              items,
              defaultSelectedKey: "1",
            }),
            h("button", { type: "submit" }, "submit"),
          ]);
      },
    });

    const tree = render(App);
    fireEvent.submit(tree.getByTestId("form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submittedValue).toBe("1");
  });

  it("supports form prop on hidden input", () => {
    const tree = render(Picker, {
      props: {
        "aria-label": "picker-test",
        name: "picker",
        form: "external-form",
        items,
      },
    });

    const hiddenInput = tree.container.querySelector(
      "input[name=\"picker\"]"
    ) as HTMLInputElement | null;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput?.getAttribute("form")).toBe("external-form");
  });

  it("resets uncontrolled selection to defaultSelectedKey on form reset", async () => {
    const user = userEvent.setup();
    const App = defineComponent({
      name: "PickerFormResetApp",
      setup() {
        return () =>
          h("form", null, [
            h(Picker, {
              "aria-label": "picker-test",
              name: "picker",
              items,
              defaultSelectedKey: "1",
            }),
            h("input", {
              type: "reset",
              "data-testid": "reset",
            }),
          ]);
      },
    });

    const tree = render(App);
    const hiddenInput = tree.container.querySelector(
      "input[name=\"picker\"]"
    ) as HTMLInputElement;
    expect(hiddenInput.value).toBe("1");

    const trigger = tree.getByRole("button", { name: "picker-test" });
    await user.click(trigger);

    const listbox = tree.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    await user.click(options[1] as Element);

    expect(hiddenInput.value).toBe("2");
    expect(tree.getByText("Two")).toBeTruthy();

    await user.click(tree.getByTestId("reset"));
    await Promise.resolve();

    expect(hiddenInput.value).toBe("1");
    expect(tree.getByText("One")).toBeTruthy();
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
