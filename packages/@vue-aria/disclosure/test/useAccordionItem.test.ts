import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import {
  useAccordionItem,
  useDisclosureGroupState,
} from "../src";

interface AccordionSetup {
  itemOne: ReturnType<typeof useAccordionItem>;
  itemTwo: ReturnType<typeof useAccordionItem>;
  groupState: ReturnType<typeof useDisclosureGroupState>;
  cleanup: () => void;
}

function setupAccordion(options: {
  allowsMultipleExpanded?: boolean;
  isDisabled?: boolean;
  itemOneDisabled?: boolean;
  onItemExpandedChange?: (isExpanded: boolean) => void;
} = {}): AccordionSetup {
  const panelOne = document.createElement("div");
  const panelTwo = document.createElement("div");
  document.body.append(panelOne, panelTwo);

  const scope = effectScope();
  let groupState!: ReturnType<typeof useDisclosureGroupState>;
  let itemOne!: ReturnType<typeof useAccordionItem>;
  let itemTwo!: ReturnType<typeof useAccordionItem>;

  scope.run(() => {
    groupState = useDisclosureGroupState({
      allowsMultipleExpanded: options.allowsMultipleExpanded,
      isDisabled: options.isDisabled,
    });

    itemOne = useAccordionItem(
      {
        id: "item-one",
        isDisabled: options.itemOneDisabled,
        onExpandedChange: options.onItemExpandedChange,
      },
      groupState,
      ref(panelOne)
    );
    itemTwo = useAccordionItem(
      {
        id: "item-two",
      },
      groupState,
      ref(panelTwo)
    );
  });

  return {
    itemOne,
    itemTwo,
    groupState,
    cleanup: () => {
      scope.stop();
      panelOne.remove();
      panelTwo.remove();
    },
  };
}

function press(item: ReturnType<typeof useAccordionItem>): void {
  (item.buttonProps.value.onPress as (event: { pointerType: string }) => void)({
    pointerType: "mouse",
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useAccordionItem", () => {
  it("supports single-expand accordion behavior", () => {
    const { itemOne, itemTwo, groupState, cleanup } = setupAccordion();

    press(itemOne);
    expect(itemOne.isExpanded.value).toBe(true);
    expect(itemTwo.isExpanded.value).toBe(false);
    expect(groupState.expandedKeys.value.size).toBe(1);

    press(itemTwo);
    expect(itemOne.isExpanded.value).toBe(false);
    expect(itemTwo.isExpanded.value).toBe(true);
    expect(groupState.expandedKeys.value.size).toBe(1);

    press(itemTwo);
    expect(itemTwo.isExpanded.value).toBe(false);
    expect(groupState.expandedKeys.value.size).toBe(0);

    cleanup();
  });

  it("supports multiple expanded items when allowed", () => {
    const { itemOne, itemTwo, groupState, cleanup } = setupAccordion({
      allowsMultipleExpanded: true,
    });

    press(itemOne);
    press(itemTwo);

    expect(itemOne.isExpanded.value).toBe(true);
    expect(itemTwo.isExpanded.value).toBe(true);
    expect(groupState.expandedKeys.value.size).toBe(2);

    cleanup();
  });

  it("respects group disabled state", () => {
    const { itemOne, groupState, cleanup } = setupAccordion({
      isDisabled: true,
    });

    press(itemOne);

    expect(itemOne.isDisabled.value).toBe(true);
    expect(groupState.expandedKeys.value.size).toBe(0);

    cleanup();
  });

  it("respects item disabled state", () => {
    const { itemOne, groupState, cleanup } = setupAccordion({
      itemOneDisabled: true,
    });

    press(itemOne);

    expect(itemOne.isDisabled.value).toBe(true);
    expect(groupState.expandedKeys.value.size).toBe(0);

    cleanup();
  });

  it("forwards item expanded change callbacks", () => {
    const onItemExpandedChange = vi.fn();
    const { itemOne, cleanup } = setupAccordion({
      onItemExpandedChange,
    });

    press(itemOne);

    expect(onItemExpandedChange).toHaveBeenCalledWith(true);

    cleanup();
  });
});
