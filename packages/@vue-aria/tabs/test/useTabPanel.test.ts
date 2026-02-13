import { beforeEach, describe, expect, it, vi } from "vitest";
import { tabsIds } from "../src/utils";

const { useHasTabbableChildMock } = vi.hoisted(() => ({
  useHasTabbableChildMock: vi.fn(() => false),
}));

vi.mock("@vue-aria/focus", () => ({
  useHasTabbableChild: useHasTabbableChildMock,
}));

import { useTabPanel } from "../src/useTabPanel";

function createState(selectedKey: string = "tab 1") {
  return {
    selectedKey,
  };
}

describe("useTabPanel", () => {
  beforeEach(() => {
    useHasTabbableChildMock.mockReset();
    useHasTabbableChildMock.mockReturnValue(false);
  });

  it("returns tabpanel props linked to selected tab", () => {
    const state = createState();
    tabsIds.set(state as any, "tabs-id");
    const ref = { current: document.createElement("section") as Element | null };
    document.body.appendChild(ref.current as Element);

    const { tabPanelProps } = useTabPanel(
      {
        "aria-label": "Selected panel",
        "aria-describedby": "helper-text",
      },
      state as any,
      ref
    );

    expect(tabPanelProps.role).toBe("tabpanel");
    expect(tabPanelProps.tabIndex).toBe(0);
    expect(tabPanelProps.id).toBe("tabs-id-tabpanel-tab1");
    expect(tabPanelProps["aria-labelledby"]).toContain("tabs-id-tab-tab1");
    expect(tabPanelProps["aria-describedby"]).toBe("helper-text");

    ref.current?.remove();
  });

  it("omits tabIndex when panel already has tabbable children", () => {
    useHasTabbableChildMock.mockReturnValue(true);
    const state = createState("tab-2");
    tabsIds.set(state as any, "tabs-id");
    const ref = { current: document.createElement("section") as Element | null };
    document.body.appendChild(ref.current as Element);

    const { tabPanelProps } = useTabPanel(
      {
        id: "custom panel",
      },
      state as any,
      ref
    );

    expect(tabPanelProps.tabIndex).toBeUndefined();
    expect(tabPanelProps.id).toBe("tabs-id-tabpanel-custompanel");
    expect(tabPanelProps["aria-labelledby"]).toBe("tabs-id-tab-tab-2");

    ref.current?.remove();
  });
});
