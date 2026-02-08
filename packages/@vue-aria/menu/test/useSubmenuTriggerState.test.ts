import { describe, expect, it } from "vitest";
import { useMenuTriggerState, useSubmenuTriggerState } from "../src";

describe("useSubmenuTriggerState", () => {
  it("opens and closes submenu at root level", () => {
    const rootState = useMenuTriggerState();
    const submenuState = useSubmenuTriggerState(
      { triggerKey: "file" },
      rootState
    );

    expect(submenuState.submenuLevel).toBe(0);
    expect(submenuState.isOpen.value).toBe(false);

    submenuState.open("first");
    expect(rootState.expandedKeysStack.value).toEqual(["file"]);
    expect(submenuState.isOpen.value).toBe(true);
    expect(submenuState.focusStrategy.value).toBe("first");

    submenuState.close();
    expect(rootState.expandedKeysStack.value).toEqual([]);
    expect(submenuState.isOpen.value).toBe(false);
  });

  it("tracks nested submenu level based on stack depth at creation", () => {
    const rootState = useMenuTriggerState();
    const rootSubmenu = useSubmenuTriggerState({ triggerKey: "file" }, rootState);
    rootSubmenu.open();

    const nestedSubmenu = useSubmenuTriggerState(
      { triggerKey: "recent" },
      rootState
    );

    expect(nestedSubmenu.submenuLevel).toBe(1);

    nestedSubmenu.open("last");
    expect(rootState.expandedKeysStack.value).toEqual(["file", "recent"]);
    expect(nestedSubmenu.isOpen.value).toBe(true);
    expect(nestedSubmenu.focusStrategy.value).toBe("last");
  });

  it("closes all menus through closeAll", () => {
    const rootState = useMenuTriggerState();
    rootState.open();

    const submenuState = useSubmenuTriggerState(
      { triggerKey: "file" },
      rootState
    );
    submenuState.open();

    expect(rootState.isOpen.value).toBe(true);
    expect(rootState.expandedKeysStack.value).toEqual(["file"]);

    submenuState.closeAll();

    expect(rootState.isOpen.value).toBe(false);
    expect(rootState.expandedKeysStack.value).toEqual([]);
  });
});
