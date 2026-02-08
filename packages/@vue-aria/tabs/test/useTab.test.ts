import { afterEach, describe, expect, it } from "vitest";
import { effectScope, ref } from "vue";
import { useTab, useTabList, useTabListState } from "../src";

const collection = [{ key: "tab-1" }, { key: "tab-2" }];

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTab", () => {
  it("returns selected tab semantics", () => {
    const scope = effectScope();
    const tabElement = document.createElement("button");
    document.body.appendChild(tabElement);

    let tab!: ReturnType<typeof useTab>;

    scope.run(() => {
      const state = useTabListState({
        collection,
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      tab = useTab({ key: "tab-1" }, state, ref(tabElement));
    });

    expect(tab.tabProps.value.role).toBe("tab");
    expect(tab.tabProps.value["aria-selected"]).toBe(true);
    expect(tab.tabProps.value["aria-controls"]).toBeTypeOf("string");
    expect(tab.tabProps.value.tabIndex).toBe(0);

    scope.stop();
    tabElement.remove();
  });

  it("does not select disabled tabs on click", () => {
    const scope = effectScope();
    const firstTabElement = document.createElement("button");
    const secondTabElement = document.createElement("button");
    document.body.append(firstTabElement, secondTabElement);

    let firstTab!: ReturnType<typeof useTab>;
    let secondTab!: ReturnType<typeof useTab>;
    let state!: ReturnType<typeof useTabListState>;

    scope.run(() => {
      state = useTabListState({
        collection,
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      firstTab = useTab({ key: "tab-1" }, state, ref(firstTabElement));
      secondTab = useTab({ key: "tab-2", isDisabled: true }, state, ref(secondTabElement));
    });

    (secondTab.tabProps.value.onClick as () => void)();

    expect(state.selectedKey.value).toBe("tab-1");
    expect(secondTab.tabProps.value["aria-disabled"]).toBe(true);
    expect(firstTab.tabProps.value["aria-selected"]).toBe(true);

    scope.stop();
    firstTabElement.remove();
    secondTabElement.remove();
  });

  it("supports press-up selection and focus updates", () => {
    const scope = effectScope();
    const firstTabElement = document.createElement("button");
    const secondTabElement = document.createElement("button");
    document.body.append(firstTabElement, secondTabElement);

    let secondTab!: ReturnType<typeof useTab>;
    let state!: ReturnType<typeof useTabListState>;

    scope.run(() => {
      state = useTabListState({
        collection,
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      useTab({ key: "tab-1" }, state, ref(firstTabElement));
      secondTab = useTab(
        { key: "tab-2", shouldSelectOnPressUp: true },
        state,
        ref(secondTabElement)
      );
    });

    (secondTab.tabProps.value.onMouseDown as () => void)();
    expect(secondTab.isPressed.value).toBe(true);

    (secondTab.tabProps.value.onFocus as () => void)();
    expect(state.focusedKey.value).toBe("tab-2");

    (secondTab.tabProps.value.onMouseUp as () => void)();
    expect(secondTab.isPressed.value).toBe(false);
    expect(state.selectedKey.value).toBe("tab-2");

    scope.stop();
    firstTabElement.remove();
    secondTabElement.remove();
  });
});
