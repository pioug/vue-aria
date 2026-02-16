import { describe, expect, it, vi } from "vitest";
import { User } from "../src";

function createSelectFixture() {
  const root = document.createElement("div");
  root.dataset.name = "select";

  const trigger = document.createElement("button");
  trigger.textContent = "Open select";
  trigger.setAttribute("aria-controls", "select-listbox");
  root.appendChild(trigger);

  const listbox = document.createElement("div");
  listbox.id = "select-listbox";
  listbox.setAttribute("role", "listbox");
  listbox.setAttribute("aria-label", "Test select");
  root.appendChild(listbox);

  const optionOne = document.createElement("div");
  optionOne.textContent = "One";
  optionOne.setAttribute("role", "option");

  const optionTwo = document.createElement("div");
  optionTwo.textContent = "Two";
  optionTwo.setAttribute("role", "option");

  listbox.append(optionOne, optionTwo);

  trigger.addEventListener("click", () => {
    // Simulate RAC behavior: opening the listbox.
    listbox.dataset.open = "1";
  });

  listbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      listbox.remove();
      trigger.focus();
    }
  });

  optionTwo.addEventListener("click", () => {
    listbox.remove();
    trigger.focus();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      listbox.dataset.open = "1";
    }
  });

  return {root, trigger, listbox, optionOne, optionTwo};
}

function createTabsFixture() {
  const root = document.createElement("div");
  root.dataset.name = "tabs";
  root.setAttribute("role", "tablist");
  root.setAttribute("aria-orientation", "horizontal");

  const firstTab = document.createElement("button");
  firstTab.textContent = "Tab One";
  firstTab.setAttribute("role", "tab");
  firstTab.setAttribute("aria-controls", "tab-panel-one");
  firstTab.setAttribute("aria-selected", "true");

  const secondTab = document.createElement("button");
  secondTab.textContent = "Tab Two";
  secondTab.setAttribute("role", "tab");
  secondTab.setAttribute("aria-controls", "tab-panel-two");
  secondTab.setAttribute("aria-selected", "false");

  const panelOne = document.createElement("div");
  panelOne.id = "tab-panel-one";
  panelOne.setAttribute("role", "tabpanel");

  const panelTwo = document.createElement("div");
  panelTwo.id = "tab-panel-two";
  panelTwo.setAttribute("role", "tabpanel");

  root.append(firstTab, secondTab, panelOne, panelTwo);
  return {root, firstTab, secondTab, panelOne, panelTwo};
}

function createTreeFixture() {
  const root = document.createElement("div");
  root.dataset.name = "tree";
  root.setAttribute("role", "treegrid");

  const row = document.createElement("div");
  row.setAttribute("role", "row");

  const checkbox = document.createElement("div");
  checkbox.setAttribute("role", "checkbox");
  checkbox.setAttribute("aria-checked", "false");

  const cell = document.createElement("div");
  cell.setAttribute("role", "gridcell");
  cell.textContent = "item one";

  const expandButton = document.createElement("button");
  expandButton.textContent = "Toggle";

  row.append(checkbox, cell, expandButton);
  root.appendChild(row);

  return {root, row, checkbox, cell, expandButton};
}

describe("test-utils", () => {
  it("opens and selects an item with the Select tester", async () => {
    const {root, trigger, listbox} = createSelectFixture();
    document.body.appendChild(root);

    const user = new User();
    const selectTester = user.createTester("Select", {root});

    await selectTester.open();
    expect(listbox.dataset.open).toBe("1");

    await selectTester.selectOption({option: "Two"});
    expect(listbox.parentNode).toBeNull();
    expect(document.activeElement).toBe(trigger);

    root.remove();
  });

  it("opens and closes the select listbox with keyboard Escape", async () => {
    const {root, trigger, listbox} = createSelectFixture();
    document.body.appendChild(root);

    const user = new User({interactionType: "keyboard"});
    const selectTester = user.createTester("Select", {root});

    await selectTester.open({interactionType: "mouse"});
    expect(listbox.dataset.open).toBe("1");

    listbox.setAttribute("tabindex", "-1");
    await selectTester.close();
    expect(listbox.parentNode).toBeNull();
    expect(document.activeElement).toBe(trigger);

    root.remove();
  });

  it("triggers tab click actions with Tabs tester", async () => {
    const {root, firstTab, secondTab} = createTabsFixture();
    document.body.appendChild(root);

    const user = new User();
    const tabsTester = user.createTester("Tabs", {root});

    const onFirstTabClick = vi.fn();
    const onSecondTabClick = vi.fn();
    firstTab.addEventListener("click", () => {
      onFirstTabClick();
      firstTab.setAttribute("aria-selected", "true");
      secondTab.setAttribute("aria-selected", "false");
    });
    secondTab.addEventListener("click", () => {
      onSecondTabClick();
      firstTab.setAttribute("aria-selected", "false");
      secondTab.setAttribute("aria-selected", "true");
    });

    expect(tabsTester.tabpanels).toHaveLength(2);
    expect(tabsTester.selectedTab).toBe(firstTab);

    await tabsTester.triggerTab({tab: "Tab Two", interactionType: "mouse"});
    expect(onSecondTabClick).toHaveBeenCalledTimes(1);
    expect(tabsTester.selectedTab).toBe(secondTab);

    root.remove();
  });

  it("selects and expands tree rows via mouse interactions", async () => {
    const {root, row, checkbox, expandButton} = createTreeFixture();
    document.body.appendChild(root);
    const user = new User();
    const treeTester = user.createTester("Tree", {root});

    const onCheckboxSelect = vi.fn();
    const onExpand = vi.fn();
    checkbox.addEventListener("click", onCheckboxSelect);
    expandButton.addEventListener("click", () => {
      const expanded = row.getAttribute("aria-expanded") === "true";
      row.setAttribute("aria-expanded", String(!expanded));
      onExpand();
    });
    row.setAttribute("aria-expanded", "false");

    await treeTester.toggleRowSelection({row: 0, interactionType: "mouse"});
    expect(onCheckboxSelect).toHaveBeenCalledTimes(1);

    await treeTester.toggleRowExpansion({row: 0, interactionType: "mouse"});
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(row.getAttribute("aria-expanded")).toBe("true");

    root.remove();
  });
});
