import { afterEach, describe, expect, it } from "vitest";
import { effectScope, ref } from "vue";
import { useTab, useTabs } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTabs", () => {
  it("composes tab list state, tab list props, and tab panel props", () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    document.body.appendChild(panelElement);

    let tabs!: ReturnType<typeof useTabs>;

    scope.run(() => {
      tabs = useTabs(
        {
          state: {
            collection: [{ key: "tab-1" }, { key: "tab-2" }],
          },
          tabList: {
            "aria-label": "Tabs",
          },
        },
        ref(panelElement)
      );
    });

    expect(tabs.state.selectedKey.value).toBe("tab-1");
    expect(tabs.tabListProps.value.role).toBe("tablist");
    expect(tabs.tabPanelProps.value.role).toBe("tabpanel");

    scope.stop();
    panelElement.remove();
  });

  it("updates tab panel labeling when selection changes", () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    document.body.appendChild(panelElement);

    let tabs!: ReturnType<typeof useTabs>;

    scope.run(() => {
      tabs = useTabs(
        {
          state: {
            collection: [{ key: "tab-1" }, { key: "tab-2" }],
          },
          tabList: {
            "aria-label": "Tabs",
          },
        },
        ref(panelElement)
      );
    });

    expect(tabs.tabPanelProps.value["aria-labelledby"]).toContain("tab-1");

    tabs.state.setSelectedKey("tab-2");

    expect(tabs.state.selectedKey.value).toBe("tab-2");
    expect(tabs.tabPanelProps.value["aria-labelledby"]).toContain("tab-2");

    scope.stop();
    panelElement.remove();
  });

  it("works with useTab for tab trigger wiring", () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    const firstTabElement = document.createElement("button");
    const secondTabElement = document.createElement("button");
    document.body.append(panelElement, firstTabElement, secondTabElement);

    let tabs!: ReturnType<typeof useTabs>;
    let secondTab!: ReturnType<typeof useTab>;

    scope.run(() => {
      tabs = useTabs(
        {
          state: {
            collection: [{ key: "tab-1" }, { key: "tab-2" }],
          },
          tabList: {
            "aria-label": "Tabs",
          },
        },
        ref(panelElement)
      );

      useTab({ key: "tab-1" }, tabs.state, ref(firstTabElement));
      secondTab = useTab({ key: "tab-2" }, tabs.state, ref(secondTabElement));
    });

    (secondTab.tabProps.value.onClick as () => void)();

    expect(tabs.state.selectedKey.value).toBe("tab-2");
    expect(secondTab.tabProps.value["aria-selected"]).toBe(true);

    scope.stop();
    panelElement.remove();
    firstTabElement.remove();
    secondTabElement.remove();
  });
});
