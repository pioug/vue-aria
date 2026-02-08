import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useTab, useTabList, useTabListState } from "../src";
import type { UseTabListStateResult } from "../src";

interface TabsHarness {
  state: UseTabListStateResult;
  tabList: ReturnType<typeof useTabList>;
  tabElements: Map<string, HTMLButtonElement>;
  triggerKey: (key: string, targetKey: string) => ReturnType<typeof vi.fn>;
  cleanup: () => void;
}

const defaultItems = [{ key: "tab-1" }, { key: "tab-2" }, { key: "tab-3" }];

function setNavigatorLanguage(language: string): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(window.navigator, "language");
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: language,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(window.navigator, "language", descriptor);
      return;
    }

    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "en-US",
    });
  };
}

function setupTabs(options: {
  orientation?: "horizontal" | "vertical";
  keyboardActivation?: "automatic" | "manual";
  defaultSelectedKey?: string;
  disabledKeys?: string[];
  language?: string;
} = {}): TabsHarness {
  const restoreLanguage =
    options.language !== undefined ? setNavigatorLanguage(options.language) : () => {};

  const tabListElement = document.createElement("div");
  document.body.appendChild(tabListElement);

  const tabElements = new Map<string, HTMLButtonElement>();
  const scope = effectScope();

  let state!: UseTabListStateResult;
  let tabList!: ReturnType<typeof useTabList>;

  scope.run(() => {
    state = useTabListState({
      collection: defaultItems,
      defaultSelectedKey: options.defaultSelectedKey,
      disabledKeys: options.disabledKeys,
    });

    tabList = useTabList(
      {
        orientation: options.orientation,
        keyboardActivation: options.keyboardActivation,
        "aria-label": "Tabs",
      },
      state
    );

    for (const item of defaultItems) {
      const element = document.createElement("button");
      tabListElement.appendChild(element);
      tabElements.set(item.key, element);

      const tab = useTab({ key: item.key }, state, ref(element));
      const props = tab.tabProps.value;
      element.setAttribute(
        "data-v-aria-tab-key",
        String(props["data-v-aria-tab-key"])
      );
    }
  });

  return {
    state,
    tabList,
    tabElements,
    triggerKey: (key, targetKey) => {
      const preventDefault = vi.fn();
      (
        tabList.tabListProps.value.onKeydown as (
          event: KeyboardEvent & { key: string }
        ) => void
      )(({
        key,
        target: tabElements.get(targetKey) ?? null,
        currentTarget: tabListElement,
        preventDefault,
      } as unknown) as KeyboardEvent & { key: string });

      return preventDefault;
    },
    cleanup: () => {
      scope.stop();
      tabListElement.remove();
      restoreLanguage();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTabList", () => {
  it("returns tablist semantics", () => {
    const { tabList, cleanup } = setupTabs();

    expect(tabList.tabListProps.value.role).toBe("tablist");
    expect(tabList.tabListProps.value["aria-orientation"]).toBe("horizontal");

    cleanup();
  });

  it("moves selection with horizontal arrow keys", () => {
    const { state, tabElements, triggerKey, cleanup } = setupTabs();

    tabElements.get("tab-1")?.focus();

    const prevented = triggerKey("ArrowRight", "tab-1");
    expect(prevented).toHaveBeenCalledTimes(1);
    expect(state.selectedKey.value).toBe("tab-2");
    expect(state.focusedKey.value).toBe("tab-2");
    expect(document.activeElement).toBe(tabElements.get("tab-2"));

    const notPreventedUp = triggerKey("ArrowUp", "tab-2");
    expect(notPreventedUp).not.toHaveBeenCalled();
    expect(state.selectedKey.value).toBe("tab-2");

    cleanup();
  });

  it("flips left/right behavior in rtl horizontal mode", () => {
    const { state, triggerKey, cleanup } = setupTabs({ language: "ar-AE" });

    const prevented = triggerKey("ArrowLeft", "tab-1");
    expect(prevented).toHaveBeenCalledTimes(1);
    expect(state.selectedKey.value).toBe("tab-2");

    cleanup();
  });

  it("supports vertical arrow navigation", () => {
    const { state, triggerKey, cleanup } = setupTabs({ orientation: "vertical" });

    triggerKey("ArrowDown", "tab-1");
    expect(state.selectedKey.value).toBe("tab-2");

    triggerKey("ArrowLeft", "tab-2");
    expect(state.selectedKey.value).toBe("tab-1");

    cleanup();
  });

  it("supports manual keyboard activation", () => {
    const { state, tabElements, triggerKey, cleanup } = setupTabs({
      keyboardActivation: "manual",
    });

    tabElements.get("tab-1")?.focus();

    triggerKey("ArrowRight", "tab-1");
    expect(state.selectedKey.value).toBe("tab-1");
    expect(state.focusedKey.value).toBe("tab-2");
    expect(document.activeElement).toBe(tabElements.get("tab-2"));

    const prevented = triggerKey("Enter", "tab-2");
    expect(prevented).toHaveBeenCalledTimes(1);
    expect(state.selectedKey.value).toBe("tab-2");

    cleanup();
  });

  it("skips disabled tabs while navigating", () => {
    const { state, triggerKey, cleanup } = setupTabs({
      disabledKeys: ["tab-2"],
    });

    triggerKey("ArrowRight", "tab-1");
    expect(state.selectedKey.value).toBe("tab-3");

    cleanup();
  });

  it("supports Home and End keys", () => {
    const { state, triggerKey, cleanup } = setupTabs({
      defaultSelectedKey: "tab-2",
    });

    triggerKey("End", "tab-2");
    expect(state.selectedKey.value).toBe("tab-3");

    triggerKey("Home", "tab-3");
    expect(state.selectedKey.value).toBe("tab-1");

    cleanup();
  });
});
