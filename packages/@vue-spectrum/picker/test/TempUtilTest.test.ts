import {
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Item, Picker } from "../src";

function renderPicker(props: Record<string, unknown> = {}) {
  const App = defineComponent({
    name: "PickerTempUtilHarness",
    setup() {
      return () =>
        h(
          Provider,
          {
            theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
          },
          {
            default: () =>
              h(
                Picker,
                {
                  "aria-label": "Test",
                  "data-testid": "test",
                  ...props,
                },
                {
                  default: () => [
                    h(Item, { id: "one" }, () => "One"),
                    h(Item, { id: "two" }, () => "Two"),
                    h(Item, { id: "three" }, () => "Three"),
                  ],
                }
              ),
          }
        );
    },
  });

  return render(App);
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Picker TempUtil", () => {
  it("supports the basic open/select flow with real timers", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const tree = renderPicker({
      onSelectionChange,
      onOpenChange,
    });

    expect(tree.getByTestId("test")).toBeTruthy();
    const picker = tree.getByRole("button");
    expect(picker.getAttribute("aria-haspopup")).toBe("listbox");

    expect(tree.getByText("Select…")).toBeTruthy();

    await user.click(picker);

    const listbox = tree.getByRole("listbox");
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(picker.getAttribute("aria-expanded")).toBe("true");
    expect(picker.getAttribute("aria-controls")).toBe(listbox.getAttribute("id"));

    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]?.textContent).toContain("One");
    expect(options[1]?.textContent).toContain("Two");
    expect(options[2]?.textContent).toContain("Three");

    await user.click(options[2] as Element);

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith("three");
    await waitFor(() => {
      expect(tree.queryByRole("listbox")).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(picker);
    });

    expect(picker.textContent).toContain("Three");
  });

  it("supports the basic open/select flow with fake timers", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    const onSelectionChange = vi.fn();
    const onOpenChange = vi.fn();
    const tree = renderPicker({
      onSelectionChange,
      onOpenChange,
    });

    const picker = tree.getByRole("button");
    await user.click(picker);
    vi.runAllTimers();

    const listbox = tree.getByRole("listbox");
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const options = within(listbox).getAllByRole("option");
    await user.click(options[2] as Element);
    vi.runAllTimers();

    expect(onSelectionChange).toHaveBeenCalledWith("three");
    expect(tree.queryByRole("listbox")).toBeNull();
    expect(picker.textContent).toContain("Three");
  });

  it("renders picker content in tray mode on mobile", async () => {
    const user = userEvent.setup();
    vi.spyOn(window.screen, "width", "get").mockImplementation(() => 700);

    const tree = renderPicker();
    const picker = tree.getByRole("button");

    await user.click(picker);

    const tray = tree.baseElement.querySelector(
      '[data-testid="picker-tray"]'
    ) as HTMLElement | null;

    expect(tray).not.toBeNull();
    expect(
      tree.baseElement.querySelector('[data-testid="picker-popover"]')
    ).toBeNull();
    expect(within(tray as HTMLElement).getByRole("listbox")).toBeTruthy();
  });
});
