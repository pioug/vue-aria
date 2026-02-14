import { mount } from "@vue/test-utils";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Breadcrumbs } from "../src/Breadcrumbs";
import { Item } from "../src/Item";

type TestItem = {
  key: string | number;
  label: string;
  href?: string;
  routerOptions?: Record<string, unknown>;
};

function renderBreadcrumbs(
  props: Record<string, unknown> = {},
  items: TestItem[] = [{ key: "folder-1", label: "Folder 1" }],
  attrs: Record<string, unknown> = {}
) {
  return mount(Breadcrumbs as any, {
    props,
    attrs,
    attachTo: document.body,
    slots: {
      default: () =>
        items.map((item) =>
          h(
            Item as any,
            {
              key: item.key,
              href: item.href,
              routerOptions: item.routerOptions,
            },
            {
              default: () => item.label,
            }
          )
        ),
    },
  });
}

async function flushOverflow(): Promise<void> {
  await nextTick();
  await nextTick();
  await nextTick();
}

describe("Breadcrumbs", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
  let offsetWidthSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    offsetWidthSpy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
      if (this instanceof HTMLUListElement && this.classList.contains("spectrum-Breadcrumbs")) {
        return 500;
      }

      return 100;
    });

    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    document.body.innerHTML = "";
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("handles defaults", async () => {
    const wrapper = renderBreadcrumbs(
      { id: "breadcrumbs-id" },
      [{ key: "folder-1", label: "Folder 1" }],
      { "aria-label": "breadcrumbs-test" }
    );
    await flushOverflow();

    const breadcrumbs = wrapper.get('[aria-label="breadcrumbs-test"]');
    expect(breadcrumbs.attributes("id")).toBe("breadcrumbs-id");
  });

  it("handles UNSAFE_className", async () => {
    const wrapper = renderBreadcrumbs({ UNSAFE_className: "test-class" });
    await flushOverflow();
    expect(wrapper.get("ul").classes()).toContain("test-class");
  });

  it("handles UNSAFE_style on nav root", async () => {
    const wrapper = renderBreadcrumbs({
      UNSAFE_style: {
        marginTop: "4px",
      },
    });
    await flushOverflow();
    expect(wrapper.get("nav").attributes("style")).toContain("margin-top: 4px");
  });

  it("handles multiple items", async () => {
    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
      ]
    );
    await flushOverflow();

    const current = wrapper.get('[aria-current="page"]');
    expect(current.text()).toContain("Folder 3");
  });

  it("handles single item and showRoot", async () => {
    const wrapper = renderBreadcrumbs({ showRoot: true }, [{ key: "folder-1", label: "Folder 1" }]);
    await flushOverflow();

    const item = wrapper.get('[aria-current="page"]');
    expect(item.text()).toContain("Folder 1");
  });

  it("supports autoFocusCurrent for the current breadcrumb item", async () => {
    const wrapper = renderBreadcrumbs(
      { autoFocusCurrent: true },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );
    await flushOverflow();

    const current = wrapper.get('[aria-current="page"]');
    expect(current.attributes("tabindex")).toBe("-1");
  });

  it("handles size variants", async () => {
    const small = renderBreadcrumbs({ size: "S" });
    await flushOverflow();
    expect(small.get("ul").classes()).toContain("spectrum-Breadcrumbs--small");

    const medium = renderBreadcrumbs({ size: "M" });
    await flushOverflow();
    expect(medium.get("ul").classes()).toContain("spectrum-Breadcrumbs--medium");
  });

  it("handles showRoot and isMultiline class toggles", async () => {
    const wrapper = renderBreadcrumbs({
      showRoot: true,
      isMultiline: true,
    });
    await flushOverflow();

    const list = wrapper.get("ul");
    expect(list.classes()).toContain("spectrum-Breadcrumbs--showRoot");
    expect(list.classes()).toContain("spectrum-Breadcrumbs--multiline");
  });

  it("handles isDisabled", async () => {
    const wrapper = renderBreadcrumbs(
      { isDisabled: true },
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
      ]
    );
    await flushOverflow();

    const items = wrapper.findAll('[aria-disabled="true"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it("supports onAction", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
      { onAction },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );
    await flushOverflow();

    const links = wrapper.findAll("a");
    await links[0]?.trigger("click");
    expect(onAction).toHaveBeenCalledWith("folder-1");
  });

  it("does not fire onAction for the current breadcrumb item", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
      { onAction },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );
    await flushOverflow();

    const links = wrapper.findAll("a");
    await links[1]?.trigger("click");
    expect(onAction).not.toHaveBeenCalled();
  });

  it("does not fire onAction when disabled", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
      {
        isDisabled: true,
        onAction,
      },
      [
        { key: "folder-1", label: "Folder 1", href: "#" },
        { key: "folder-2", label: "Folder 2", href: "#" },
      ]
    );
    await flushOverflow();

    const links = wrapper.findAll("a");
    await links[0]?.trigger("click");
    expect(onAction).not.toHaveBeenCalled();
  });

  it("shows four items with no menu", async () => {
    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
      ]
    );
    await flushOverflow();

    expect(wrapper.find('button[aria-label="…"]').exists()).toBe(false);
    expect(wrapper.get("ul").findAll("li")).toHaveLength(4);
    expect(wrapper.text()).toContain("Folder 1");
    expect(wrapper.text()).toContain("Folder 2");
    expect(wrapper.text()).toContain("Folder 3");
    expect(wrapper.text()).toContain("Folder 4");
  });

  it("shows a maximum of 4 items", async () => {
    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
        { key: "folder-5", label: "Folder 5" },
      ]
    );
    await flushOverflow();

    const listItems = wrapper.get("ul").findAll("li");
    expect(listItems).toHaveLength(4);
    expect(listItems[0]?.find("button").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Folder 1");
    expect(wrapper.text()).not.toContain("Folder 2");
    expect(wrapper.text()).toContain("Folder 3");
    expect(wrapper.text()).toContain("Folder 4");
    expect(wrapper.text()).toContain("Folder 5");
  });

  it("shows a maximum of 4 items with showRoot", async () => {
    const wrapper = renderBreadcrumbs(
      { showRoot: true },
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
        { key: "folder-5", label: "Folder 5" },
      ]
    );
    await flushOverflow();

    const listItems = wrapper.get("ul").findAll("li");
    expect(listItems).toHaveLength(4);
    expect(wrapper.text()).toContain("Folder 1");
    expect(listItems[1]?.find("button").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Folder 2");
    expect(wrapper.text()).not.toContain("Folder 3");
    expect(wrapper.text()).toContain("Folder 4");
    expect(wrapper.text()).toContain("Folder 5");
  });

  it("shows less than 4 items if they do not fit", async () => {
    offsetWidthSpy.mockImplementation(function (this: HTMLElement) {
      if (this instanceof HTMLUListElement && this.classList.contains("spectrum-Breadcrumbs")) {
        return 300;
      }

      return 100;
    });

    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
        { key: "folder-5", label: "Folder 5" },
      ]
    );
    await flushOverflow();

    const listItems = wrapper.get("ul").findAll("li");
    expect(listItems).toHaveLength(2);
    expect(listItems[0]?.find("button").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Folder 1");
    expect(wrapper.text()).not.toContain("Folder 2");
    expect(wrapper.text()).not.toContain("Folder 3");
    expect(wrapper.text()).not.toContain("Folder 4");
    expect(wrapper.text()).toContain("Folder 5");
  });

  it("collapses root item if it does not fit", async () => {
    offsetWidthSpy.mockImplementation(function (this: HTMLElement) {
      if (this instanceof HTMLUListElement && this.classList.contains("spectrum-Breadcrumbs")) {
        return 300;
      }

      return 100;
    });

    const wrapper = renderBreadcrumbs(
      { showRoot: true },
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
        { key: "folder-5", label: "Folder 5" },
      ]
    );
    await flushOverflow();

    const listItems = wrapper.get("ul").findAll("li");
    expect(listItems).toHaveLength(2);
    expect(listItems[0]?.find("button").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Folder 1");
    expect(wrapper.text()).not.toContain("Folder 2");
    expect(wrapper.text()).not.toContain("Folder 3");
    expect(wrapper.text()).not.toContain("Folder 4");
    expect(wrapper.text()).toContain("Folder 5");
  });

  it("handles showRoot and folders of different widths", async () => {
    offsetWidthSpy.mockImplementation(function (this: HTMLElement) {
      if (this instanceof HTMLUListElement && this.classList.contains("spectrum-Breadcrumbs")) {
        return 500;
      }

      if (this.textContent?.includes("Folder 1")) {
        return 200;
      }

      return 100;
    });

    const wrapper = renderBreadcrumbs(
      { showRoot: true },
      [
        { key: "folder-1", label: "Folder 1" },
        { key: "folder-2", label: "Folder 2" },
        { key: "folder-3", label: "Folder 3" },
        { key: "folder-4", label: "Folder 4" },
        { key: "folder-5", label: "Folder 5" },
      ]
    );
    await flushOverflow();

    const listItems = wrapper.get("ul").findAll("li");
    expect(listItems).toHaveLength(3);
    expect(wrapper.text()).toContain("Folder 1");
    expect(listItems[1]?.find("button").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Folder 2");
    expect(wrapper.text()).not.toContain("Folder 3");
    expect(wrapper.text()).not.toContain("Folder 4");
    expect(wrapper.text()).toContain("Folder 5");
  });

  it("can open the menu and trigger onAction for menu items", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
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
    await flushOverflow();

    const menuButton = wrapper.get('button[aria-label="…"]');
    await menuButton.trigger("click");
    await flushOverflow();

    const menu = document.body.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitemradio"]')) as HTMLElement[];
    expect(menuItems).toHaveLength(5);

    menuItems[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushOverflow();
    expect(onAction).toHaveBeenCalledWith("Folder 1");
  });

  it("clicking on current folder in menu does not trigger onAction", async () => {
    const onAction = vi.fn();
    const wrapper = renderBreadcrumbs(
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
    await flushOverflow();

    const menuButton = wrapper.get('button[aria-label="…"]');
    await menuButton.trigger("click");
    await flushOverflow();

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitemradio"]')) as HTMLElement[];
    expect(menuItems).toHaveLength(5);

    const currentItem = menuItems.find((item) => item.getAttribute("aria-checked") === "true");
    expect(currentItem).toBeTruthy();
    currentItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushOverflow();
    expect(onAction).not.toHaveBeenCalled();
  });

  it("supports links in collapsed breadcrumbs and menu", async () => {
    const wrapper = renderBreadcrumbs(
      {},
      [
        { key: "example", label: "Example.com", href: "https://example.com" },
        { key: "foo", label: "Foo", href: "https://example.com/foo" },
        { key: "bar", label: "Bar", href: "https://example.com/foo/bar" },
        { key: "baz", label: "Baz", href: "https://example.com/foo/bar/baz" },
        { key: "qux", label: "Qux", href: "https://example.com/foo/bar/baz/qux" },
      ]
    );
    await flushOverflow();

    const links = wrapper.findAll("a");
    expect(links).toHaveLength(3);
    expect(links[0]?.attributes("href")).toBe("https://example.com/foo/bar");

    const menuButton = wrapper.get('button[aria-label="…"]');
    await menuButton.trigger("click");
    await flushOverflow();

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitemradio"]')) as HTMLElement[];
    expect(menuItems).toHaveLength(5);
    expect(menuItems[0]?.tagName).toBe("A");
    expect(menuItems[0]?.getAttribute("href")).toBe("https://example.com");
  });
});
