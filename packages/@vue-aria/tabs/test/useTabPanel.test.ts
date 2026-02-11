import { afterEach, describe, expect, it } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useTabList, useTabListState, useTabPanel } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useTabPanel", () => {
  it("returns tabpanel semantics and id wiring", async () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    document.body.appendChild(panelElement);

    let tabPanel!: ReturnType<typeof useTabPanel>;

    scope.run(() => {
      const state = useTabListState({
        collection: [{ key: "tab-1" }, { key: "tab-2" }],
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      tabPanel = useTabPanel({}, state, ref(panelElement));
    });

    await nextTick();

    expect(tabPanel.tabPanelProps.value.role).toBe("tabpanel");
    expect(tabPanel.tabPanelProps.value.id).toBeTypeOf("string");
    expect(tabPanel.tabPanelProps.value["aria-labelledby"]).toBeTypeOf("string");
    expect(tabPanel.tabPanelProps.value.tabIndex).toBe(0);

    scope.stop();
    panelElement.remove();
  });

  it("omits tabIndex when panel has tabbable children", async () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    const button = document.createElement("button");
    panelElement.appendChild(button);
    document.body.appendChild(panelElement);

    let tabPanel!: ReturnType<typeof useTabPanel>;

    scope.run(() => {
      const state = useTabListState({
        collection: [{ key: "tab-1" }, { key: "tab-2" }],
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      tabPanel = useTabPanel({}, state, ref(panelElement));
    });

    await nextTick();

    expect(tabPanel.tabPanelProps.value.tabIndex).toBeUndefined();

    scope.stop();
    panelElement.remove();
  });

  it("passes through labeling and description props", () => {
    const scope = effectScope();
    const panelElement = document.createElement("div");
    document.body.appendChild(panelElement);

    let tabPanel!: ReturnType<typeof useTabPanel>;

    scope.run(() => {
      const state = useTabListState({
        collection: [{ key: "tab-1" }, { key: "tab-2" }],
        defaultSelectedKey: "tab-1",
      });
      useTabList({ "aria-label": "Tabs" }, state);
      tabPanel = useTabPanel(
        {
          "aria-label": "Tab panel",
          "aria-describedby": "tab-panel-description",
          "aria-details": "tab-panel-details",
        },
        state,
        ref(panelElement)
      );
    });

    expect(tabPanel.tabPanelProps.value["aria-label"]).toBe("Tab panel");
    expect(tabPanel.tabPanelProps.value["aria-describedby"]).toBe(
      "tab-panel-description"
    );
    expect(tabPanel.tabPanelProps.value["aria-details"]).toBe("tab-panel-details");

    scope.stop();
    panelElement.remove();
  });
});
