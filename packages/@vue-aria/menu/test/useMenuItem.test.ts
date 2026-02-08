import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useListBoxState } from "@vue-aria/listbox";
import { useMenu, useMenuItem } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useMenuItem", () => {
  it("returns menuitem semantics", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "copy" }, { key: "paste" }],
      });

      useMenu({ "aria-label": "Actions" }, state, ref(null));
      menuItem = useMenuItem({ key: "copy" }, state, ref(itemElement));
    });

    expect(menuItem.menuItemProps.value.role).toBe("menuitem");
    expect(menuItem.menuItemProps.value.id).toBeTypeOf("string");

    scope.stop();
    itemElement.remove();
  });

  it("uses menuitemradio role for single selection", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }],
        selectionMode: "single",
      });

      useMenu({ "aria-label": "Actions" }, state, ref(null));
      menuItem = useMenuItem({ key: "a" }, state, ref(itemElement));
    });

    expect(menuItem.menuItemProps.value.role).toBe("menuitemradio");
    expect(menuItem.menuItemProps.value["aria-checked"]).toBe(false);

    scope.stop();
    itemElement.remove();
  });

  it("calls item and menu actions and closes by default", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const itemAction = vi.fn();
    const menuAction = vi.fn();
    const onClose = vi.fn();

    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "copy", onAction: itemAction }],
      });

      useMenu(
        {
          "aria-label": "Actions",
          onAction: menuAction,
          onClose,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "copy" }, state, ref(itemElement));
    });

    (menuItem.menuItemProps.value.onClick as () => void)();

    expect(itemAction).toHaveBeenCalledTimes(1);
    expect(menuAction).toHaveBeenCalledWith("copy");
    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
    itemElement.remove();
  });

  it("does not close by default in multiple selection mode", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const onClose = vi.fn();
    let state!: ReturnType<typeof useListBoxState>;
    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      state = useListBoxState({
        collection: [{ key: "copy" }, { key: "paste" }],
        selectionMode: "multiple",
      });

      useMenu(
        {
          "aria-label": "Actions",
          onClose,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "copy" }, state, ref(itemElement));
    });

    (menuItem.menuItemProps.value.onClick as () => void)();

    expect(state.selectedKeys.value.has("copy")).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
    itemElement.remove();
  });

  it("supports virtualized metadata", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "a" }, { key: "b" }, { key: "c" }],
      });

      useMenu(
        {
          "aria-label": "Actions",
          isVirtualized: true,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "b" }, state, ref(itemElement));
    });

    expect(menuItem.menuItemProps.value["aria-posinset"]).toBe(2);
    expect(menuItem.menuItemProps.value["aria-setsize"]).toBe(3);

    scope.stop();
    itemElement.remove();
  });

  it("closes on Enter in multiple selection mode", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const onClose = vi.fn();
    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "copy" }, { key: "paste" }],
        selectionMode: "multiple",
      });

      useMenu(
        {
          "aria-label": "Actions",
          onClose,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "copy" }, state, ref(itemElement));
    });

    (
      menuItem.menuItemProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: "Enter",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
    itemElement.remove();
  });

  it("does not close on Space in multiple selection mode", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const onClose = vi.fn();
    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "copy" }, { key: "paste" }],
        selectionMode: "multiple",
      });

      useMenu(
        {
          "aria-label": "Actions",
          onClose,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "copy" }, state, ref(itemElement));
    });

    (
      menuItem.menuItemProps.value.onKeydown as (event: KeyboardEvent) => void
    )({
      key: " ",
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent);

    expect(onClose).not.toHaveBeenCalled();

    scope.stop();
    itemElement.remove();
  });

  it("always closes link items even in multiple selection mode", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const onClose = vi.fn();
    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "docs", href: "/docs" }],
        selectionMode: "multiple",
      });

      useMenu(
        {
          "aria-label": "Actions",
          onClose,
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem({ key: "docs" }, state, ref(itemElement));
    });

    (menuItem.menuItemProps.value.onClick as () => void)();

    expect(onClose).toHaveBeenCalledTimes(1);

    scope.stop();
    itemElement.remove();
  });

  it("does not invoke onAction for submenu trigger items", () => {
    const scope = effectScope();
    const itemElement = document.createElement("li");
    document.body.appendChild(itemElement);

    const onAction = vi.fn();
    let menuItem!: ReturnType<typeof useMenuItem>;

    scope.run(() => {
      const state = useListBoxState({
        collection: [{ key: "more", onAction }],
      });

      useMenu(
        {
          "aria-label": "Actions",
        },
        state,
        ref(null)
      );
      menuItem = useMenuItem(
        {
          key: "more",
          "aria-haspopup": "menu",
        },
        state,
        ref(itemElement)
      );
    });

    (menuItem.menuItemProps.value.onClick as () => void)();

    expect(onAction).not.toHaveBeenCalled();

    scope.stop();
    itemElement.remove();
  });
});
