import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { useListState } from "@vue-stately/list";
import { useButton } from "@vue-aria/button";
import { useTag, useTagGroup } from "../src";
import type { Node, Key } from "@vue-aria/collections";
import type { ListState } from "@vue-stately/list";

interface DemoItem {
  id: string;
  label: string;
}

type SelectionMode = "none" | "single" | "multiple";

const ITEMS: DemoItem[] = [
  { id: "laundry", label: "Laundry" },
  { id: "fitness", label: "Fitness center" },
  { id: "parking", label: "Parking" },
  { id: "pool", label: "Swimming pool" },
  { id: "breakfast", label: "Breakfast" },
];

const Button = defineComponent({
  props: {
    buttonProps: {
      type: Object,
      required: true,
    },
  },
  setup(props, { slots }) {
    const buttonRef = ref<HTMLElement | null>(null);
    const buttonAdapter = {
      get current() {
        return buttonRef.value;
      },
      set current(value) {
        buttonRef.value = value as HTMLElement | null;
      },
    };
    const { buttonProps } = useButton(props.buttonProps as Record<string, unknown>, buttonAdapter);

    return () => h("button", { ref: buttonRef, ...buttonProps }, slots.default?.());
  },
});

const Tag = defineComponent({
  props: {
    item: {
      type: Object,
      required: true,
    },
    state: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const tagRef = ref<HTMLElement | null>(null);
    const rowAdapter = {
      get current() {
        return tagRef.value;
      },
      set current(value) {
        tagRef.value = value as HTMLElement | null;
      },
    };
    const { rowProps, gridCellProps, removeButtonProps, allowsRemoving } = useTag(
      { item: props.item as Node<DemoItem> },
      props.state as ListState<DemoItem>,
      rowAdapter
    );

    const key = String((props.item as Node<DemoItem>).key);
    const label = (props.item as Node<DemoItem>).rendered as string;
    return () =>
      h("div", { ref: tagRef, ...rowProps }, [
        h("div", { ...gridCellProps }, [
          h("span", label),
          allowsRemoving
            ? h(Button, { buttonProps: { ...removeButtonProps, "data-testid": `remove-${key}` } }, { default: () => "x" })
            : null,
        ]),
      ]);
  },
});

function toSortedArray(set: Set<Key>) {
  return [...set].sort();
}

async function flush() {
  await nextTick();
  await nextTick();
}

function mountTagGroup(props: {
  items?: DemoItem[];
  selectionMode?: SelectionMode;
  defaultSelectedKeys?: Key[];
  onRemove?: ReturnType<typeof vi.fn>;
  onSelectionChange?: ReturnType<typeof vi.fn>;
}) {
  const localProps = {
    label: "Amenities",
    items: ITEMS,
    selectionMode: "multiple" as SelectionMode,
    ...props,
  };
  const data = {
    items: localProps.items,
    getKey: (item: DemoItem) => item.id,
    getTextValue: (item: DemoItem) => item.label,
  };
  const Component = defineComponent({
    setup() {
      const state = useListState({
        ...data,
        selectionMode: localProps.selectionMode,
        defaultSelectedKeys: localProps.defaultSelectedKeys,
        onSelectionChange: localProps.onSelectionChange,
      });
      const groupRef = ref<HTMLElement | null>(null);
      const groupAdapter = {
        get current() {
          return groupRef.value;
        },
        set current(value) {
          groupRef.value = value as HTMLElement | null;
        },
      };
      const { gridProps } = useTagGroup(
        { label: localProps.label, selectionMode: localProps.selectionMode, onRemove: localProps.onRemove },
        state,
        groupAdapter
      );

      return () =>
        h(
          "div",
          { "data-testid": "tag-group", ref: groupRef, ...gridProps },
          [...state.collection].map((item) => h(Tag, { key: String(item.key), item, state }))
        );
    },
  });

  return mount(Component, { attachTo: document.body });
}

describe("useTagGroup", () => {
  it("supports selection", async () => {
    const onRemove = vi.fn();
    const wrapper = mountTagGroup({
      selectionMode: "multiple",
      defaultSelectedKeys: ["parking"],
      onRemove,
    });
    const tags = wrapper.findAll('[role="row"]');

    expect(tags).toHaveLength(5);
    expect(tags[0].attributes("aria-selected")).toBe("false");
    expect(tags[1].attributes("aria-selected")).toBe("false");
    expect(tags[2].attributes("aria-selected")).toBe("true");
    expect(tags[3].attributes("aria-selected")).toBe("false");
    expect(tags[4].attributes("aria-selected")).toBe("false");

    tags[3].element.click();
    await flush();
    expect(tags[2].attributes("aria-selected")).toBe("true");
    expect(tags[3].attributes("aria-selected")).toBe("true");
    expect(tags[0].attributes("aria-selected")).toBe("false");

    tags[3].element.focus();
    tags[3].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(toSortedArray(onRemove.mock.calls.at(-1)![0] as Set<Key>)).toEqual(["parking", "pool"]);

    tags[0].element.click();
    await flush();
    tags[0].element.focus();
    tags[0].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(toSortedArray(onRemove.mock.calls.at(-1)![0] as Set<Key>)).toEqual(["laundry", "parking", "pool"]);

    const removeButtons = wrapper.findAll("button");
    removeButtons[3].element.focus();
    removeButtons[3].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    removeButtons[3].element.dispatchEvent(
      new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(toSortedArray(onRemove.mock.calls.at(-1)![0] as Set<Key>)).toEqual(["pool"]);

    wrapper.unmount();
  });

  it("supports tabbing to tags and arrow navigation between tags", async () => {
    const wrapper = mountTagGroup({
      items: ITEMS.slice(0, 3),
    });
    const tags = wrapper.findAll('[role="row"]');
    expect(tags).toHaveLength(3);

    expect(document.activeElement).not.toBe(tags[0].element);

    tags[0].element.focus();
    expect(document.activeElement).toBe(tags[0].element);

    tags[0].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(tags[1].element);

    tags[1].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(tags[2].element);

    tags[2].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(tags[1].element);
    wrapper.unmount();
  });

  it("supports tabbing to remove buttons", async () => {
    const onRemove = vi.fn();
    const wrapper = mountTagGroup({
      selectionMode: "multiple",
      onRemove,
    });
    const removeButtons = wrapper.findAll("button");
    const firstButton = removeButtons[0];
    firstButton.element.focus();
    firstButton.element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    firstButton.element.dispatchEvent(
      new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(toSortedArray(onRemove.mock.calls.at(-1)![0] as Set<Key>)).toEqual(["laundry"]);
    wrapper.unmount();
  });

  it("supports keyboard selection while navigating between tags", async () => {
    const onSelectionChange = vi.fn();
    const wrapper = mountTagGroup({
      selectionMode: "multiple",
      onSelectionChange,
    });
    const tags = wrapper.findAll('[role="row"]');

    tags[0].element.focus();
    tags[0].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    tags[1].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(tags[1].element);

    tags[1].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    tags[2].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );
    await flush();
    expect(document.activeElement).toBe(tags[2].element);

    tags[2].element.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
    );
    await flush();
    expect(onSelectionChange).toHaveBeenCalledTimes(3);
    wrapper.unmount();
  });
});
