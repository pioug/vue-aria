import userEvent from "@testing-library/user-event";
import { render, within } from "@testing-library/vue";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { h, nextTick, defineComponent } from "vue";
import { BreadcrumbItem, Breadcrumbs } from "../src";

interface BreadcrumbFixtureItem {
  key?: string | number;
  label: string;
  href?: string;
}

function renderBreadcrumbs(
  props: Record<string, unknown> = {},
  items: BreadcrumbFixtureItem[] = [{ label: "Folder 1" }]
) {
  return render(Breadcrumbs, {
    props,
    slots: {
      default: () =>
        items.map((item, index) =>
          h(
            BreadcrumbItem,
            {
              key: item.key ?? item.label ?? index,
              href: item.href,
            },
            () => item.label
          )
        ),
    },
  });
}

async function settle(): Promise<void> {
  await nextTick();
  await nextTick();
}

describe("Breadcrumbs", () => {
  let offsetWidthSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function offsetWidthMock(this: HTMLElement) {
        if (this instanceof HTMLUListElement) {
          return 500;
        }

        return 100;
      });
  });

  afterEach(() => {
    offsetWidthSpy.mockRestore();
  });

  it("handles defaults", () => {
    const { getByRole } = renderBreadcrumbs({
      id: "breadcrumbs-id",
      "aria-label": "breadcrumbs-test",
    });

    const breadcrumbs = getByRole("navigation");
    expect(breadcrumbs.getAttribute("id")).toBe("breadcrumbs-id");
    expect(breadcrumbs.getAttribute("aria-label")).toBe("breadcrumbs-test");
  });

  it("provides a default aria label", () => {
    const { getByRole } = renderBreadcrumbs();

    const breadcrumbs = getByRole("navigation");
    expect(breadcrumbs.getAttribute("aria-label")).toBe("Breadcrumbs");
  });

  it("handles UNSAFE_className", () => {
    const { getByRole } = renderBreadcrumbs({ UNSAFE_className: "test-class" });

    const breadcrumbs = getByRole("list");
    expect(breadcrumbs.getAttribute("class")).toContain("test-class");
  });

  it("handles multiple items", async () => {
    const { getByText } = renderBreadcrumbs({}, [
      { label: "Folder 1" },
      { label: "Folder 2" },
      { label: "Folder 3" },
    ]);

    await settle();

    const item1 = getByText("Folder 1");
    expect(item1.tabIndex).toBe(0);
    expect(item1.getAttribute("aria-current")).toBeNull();

    const item2 = getByText("Folder 2");
    expect(item2.tabIndex).toBe(0);
    expect(item2.getAttribute("aria-current")).toBeNull();

    const item3 = getByText("Folder 3");
    expect(item3.tabIndex).toBe(-1);
    expect(item3.getAttribute("aria-current")).toBe("page");
  });

  it("handles single item with showRoot", async () => {
    const { getByText } = renderBreadcrumbs(
      {
        showRoot: true,
      },
      [{ key: "Folder-1", label: "Folder 1" }]
    );

    await settle();

    const item = getByText("Folder 1");
    expect(item.tabIndex).toBe(-1);
  });

  it("handles size S", () => {
    const { getByRole } = renderBreadcrumbs({
      size: "S",
    });

    const breadcrumbs = getByRole("list");
    expect(breadcrumbs.getAttribute("class")).toContain("--small");
  });

  it("handles size M", () => {
    const { getByRole } = renderBreadcrumbs({
      size: "M",
    });

    const breadcrumbs = getByRole("list");
    expect(breadcrumbs.getAttribute("class")).toContain("--medium");
  });

  it("shows four items with no menu", async () => {
    const { getByRole, getByText } = renderBreadcrumbs({}, [
      { label: "Folder 1" },
      { label: "Folder 2" },
      { label: "Folder 3" },
      { label: "Folder 4" },
    ]);

    await settle();

    const list = getByRole("list");
    expect(within(list).queryByRole("button", { name: "…" })).toBeNull();

    expect(getByText("Folder 1")).toBeTruthy();
    expect(getByText("Folder 2")).toBeTruthy();
    expect(getByText("Folder 3")).toBeTruthy();
    expect(getByText("Folder 4")).toBeTruthy();
  });

  it("shows a maximum of four visual entries", async () => {
    const { getByRole, getByText, queryByText } = renderBreadcrumbs({}, [
      { label: "Folder 1" },
      { label: "Folder 2" },
      { label: "Folder 3" },
      { label: "Folder 4" },
      { label: "Folder 5" },
    ]);

    await settle();

    const list = getByRole("list");
    expect(within(list).getByRole("button", { name: "…" })).toBeTruthy();
    expect(queryByText("Folder 1")).toBeNull();
    expect(queryByText("Folder 2")).toBeNull();
    expect(getByText("Folder 3")).toBeTruthy();
    expect(getByText("Folder 4")).toBeTruthy();
    expect(getByText("Folder 5")).toBeTruthy();
  });

  it("shows root item when showRoot is set", async () => {
    const { getByRole, getByText, queryByText } = renderBreadcrumbs(
      {
        showRoot: true,
      },
      [
        { label: "Folder 1" },
        { label: "Folder 2" },
        { label: "Folder 3" },
        { label: "Folder 4" },
        { label: "Folder 5" },
      ]
    );

    await settle();

    const list = getByRole("list");
    const menuButton = within(list).getByRole("button", { name: "…" });

    expect(getByText("Folder 1")).toBeTruthy();
    expect(menuButton).toBeTruthy();
    expect(queryByText("Folder 2")).toBeNull();
    expect(queryByText("Folder 3")).toBeNull();
    expect(getByText("Folder 4")).toBeTruthy();
    expect(getByText("Folder 5")).toBeTruthy();
  });

  it("handles isDisabled", async () => {
    const { getByText } = renderBreadcrumbs(
      {
        isDisabled: true,
      },
      [{ label: "Folder 1" }, { label: "Folder 2" }]
    );

    await settle();

    expect(getByText("Folder 1").getAttribute("aria-disabled")).toBe("true");
    expect(getByText("Folder 2").getAttribute("aria-disabled")).toBe("true");
  });

  it("shows fewer items when they do not fit", async () => {
    offsetWidthSpy.mockImplementation(function widthMock(this: HTMLElement) {
      if (this instanceof HTMLUListElement) {
        return 300;
      }

      return 100;
    });

    const { getByRole, getByText, queryByText } = renderBreadcrumbs({}, [
      { label: "Folder 1" },
      { label: "Folder 2" },
      { label: "Folder 3" },
      { label: "Folder 4" },
      { label: "Folder 5" },
    ]);

    await settle();

    const list = getByRole("list");
    expect(within(list).getByRole("button", { name: "…" })).toBeTruthy();
    expect(queryByText("Folder 1")).toBeNull();
    expect(queryByText("Folder 2")).toBeNull();
    expect(queryByText("Folder 3")).toBeNull();
    expect(queryByText("Folder 4")).toBeNull();
    expect(getByText("Folder 5")).toBeTruthy();
  });

  it("collapses root item when it does not fit", async () => {
    offsetWidthSpy.mockImplementation(function widthMock(this: HTMLElement) {
      if (this instanceof HTMLUListElement) {
        return 300;
      }

      return 100;
    });

    const { getByRole, getByText, queryByText } = renderBreadcrumbs(
      {
        showRoot: true,
      },
      [
        { label: "Folder 1" },
        { label: "Folder 2" },
        { label: "Folder 3" },
        { label: "Folder 4" },
        { label: "Folder 5" },
      ]
    );

    await settle();

    const list = getByRole("list");
    expect(queryByText("Folder 1")).toBeNull();
    expect(within(list).getByRole("button", { name: "…" })).toBeTruthy();
    expect(queryByText("Folder 2")).toBeNull();
    expect(queryByText("Folder 3")).toBeNull();
    expect(queryByText("Folder 4")).toBeNull();
    expect(getByText("Folder 5")).toBeTruthy();
  });

  it("handles showRoot with different item widths", async () => {
    offsetWidthSpy.mockImplementation(function widthMock(this: HTMLElement) {
      if (this instanceof HTMLUListElement) {
        return 500;
      }

      if (this.textContent?.includes("Folder 1")) {
        return 200;
      }

      return 100;
    });

    const { getByRole, getByText, queryByText } = renderBreadcrumbs(
      {
        showRoot: true,
      },
      [
        { label: "Folder 1" },
        { label: "Folder 2" },
        { label: "Folder 3" },
        { label: "Folder 4" },
        { label: "Folder 5" },
      ]
    );

    await settle();

    const list = getByRole("list");
    expect(getByText("Folder 1")).toBeTruthy();
    expect(within(list).getByRole("button", { name: "…" })).toBeTruthy();
    expect(queryByText("Folder 2")).toBeNull();
    expect(queryByText("Folder 3")).toBeNull();
    expect(queryByText("Folder 4")).toBeNull();
    expect(getByText("Folder 5")).toBeTruthy();
  });

  it("can open the menu and trigger onAction", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const { getByRole } = renderBreadcrumbs(
      {
        showRoot: true,
        onAction,
      },
      [
        { key: "Folder 1", label: "Folder 1" },
        { key: "Folder 2", label: "Folder 2" },
        { key: "Folder 3", label: "Folder 3" },
        { key: "Folder 4", label: "Folder 4" },
        { key: "Folder 5", label: "Folder 5" },
      ]
    );

    await settle();

    const menuButton = getByRole("button", { name: "…" });
    await user.click(menuButton);

    const menu = getByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitemradio");

    expect(menuItems).toHaveLength(5);

    await user.click(menuItems[1]!);
    expect(onAction).toHaveBeenCalledWith("Folder 2");

    const callsAfterNonCurrent = onAction.mock.calls.length;

    await user.click(menuButton);
    const reopenedMenu = getByRole("menu");
    const reopenedItems = within(reopenedMenu).getAllByRole("menuitemradio");
    await user.click(reopenedItems[4]!);

    expect(onAction).toHaveBeenCalledTimes(callsAfterNonCurrent);
  });

  it("supports aria-labelledby", () => {
    const App = defineComponent({
      name: "BreadcrumbAriaLabelledbyApp",
      setup() {
        return () =>
          h("div", null, [
            h("span", { id: "test-label" }, "Test label"),
            h(
              Breadcrumbs,
              {
                "aria-labelledby": "test-label",
              },
              {
                default: () => [h(BreadcrumbItem, null, () => "Folder 1")],
              }
            ),
          ]);
      },
    });

    const { getByRole } = render(App);
    const breadcrumbs = getByRole("navigation");
    expect(breadcrumbs.getAttribute("aria-labelledby")).toBe("test-label");
  });

  it("supports aria-describedby", () => {
    const App = defineComponent({
      name: "BreadcrumbAriaDescribedbyApp",
      setup() {
        return () =>
          h("div", null, [
            h("span", { id: "test-description" }, "Test description"),
            h(
              Breadcrumbs,
              {
                "aria-describedby": "test-description",
              },
              {
                default: () => [h(BreadcrumbItem, null, () => "Folder 1")],
              }
            ),
          ]);
      },
    });

    const { getByRole } = render(App);
    const breadcrumbs = getByRole("navigation");
    expect(breadcrumbs.getAttribute("aria-describedby")).toBe("test-description");
  });

  it("supports custom props", () => {
    const { getByRole } = renderBreadcrumbs({
      "data-testid": "test",
    });

    const breadcrumbs = getByRole("navigation");
    expect(breadcrumbs.getAttribute("data-testid")).toBe("test");
  });

  it("supports links", async () => {
    const user = userEvent.setup();

    const { getByRole, getAllByRole } = renderBreadcrumbs(
      {},
      [
        { label: "Example.com", href: "https://example.com" },
        { label: "Foo", href: "https://example.com/foo" },
        { label: "Bar", href: "https://example.com/foo/bar" },
        { label: "Baz", href: "https://example.com/foo/bar/baz" },
        { label: "Qux", href: "https://example.com/foo/bar/baz/qux" },
      ]
    );

    await settle();

    const links = getAllByRole("link") as HTMLAnchorElement[];
    expect(links).toHaveLength(3);
    expect(links[0]?.getAttribute("href")).toBe("https://example.com/foo/bar");
    expect(links[1]?.getAttribute("href")).toBe("https://example.com/foo/bar/baz");
    expect(links[2]?.getAttribute("href")).toBe("https://example.com/foo/bar/baz/qux");

    const menuButton = getByRole("button", { name: "…" });
    await user.click(menuButton);

    const menu = getByRole("menu");
    const items = within(menu).getAllByRole("menuitemradio");

    expect(items).toHaveLength(5);
    expect(items[0]?.tagName).toBe("A");
    expect(items[0]?.getAttribute("href")).toBe("https://example.com");
  });
});
