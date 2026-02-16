import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { ActionBar, Item } from "../src";

const { announceMock } = vi.hoisted(() => ({
  announceMock: vi.fn(),
}));

vi.mock("@vue-aria/live-announcer", () => ({
  announce: announceMock,
  clearAnnouncer: vi.fn(),
  destroyAnnouncer: vi.fn(),
}));

describe("ActionBar", () => {
  type SelectedItemCount = number | "all";

  afterEach(() => {
    document.body.innerHTML = "";
    announceMock.mockReset();
  });

  it("does not render when there are no selected items", () => {
    const wrapper = mount(ActionBar as any, {
      props: {
        selectedItemCount: 0,
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
      },
      attachTo: document.body,
    });

    expect(wrapper.find('[role="toolbar"]').exists()).toBe(false);
  });

  it("renders with count and default aria labels", () => {
    const wrapper = mount(ActionBar as any, {
      props: {
        selectedItemCount: 1,
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
      },
      attachTo: document.body,
    });

    expect(wrapper.get('[role="toolbar"]').attributes("aria-label")).toBe("Actions");
    expect(wrapper.get(".spectrum-ActionBar-selectedCount").text()).toBe("1 selected");
  });

  it("supports selectedItemCount=\"all\"", () => {
    const wrapper = mount(ActionBar as any, {
      props: {
        selectedItemCount: "all",
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".spectrum-ActionBar-selectedCount").text()).toBe("All selected");
  });

  it("maps function children over all items", () => {
    const items = [
      { key: "edit", textValue: "Edit" },
      { key: "copy", textValue: "Copy" },
    ];

    const wrapper = mount(ActionBar as any, {
      props: {
        selectedItemCount: 2,
        items,
        onClearSelection: vi.fn(),
        children: (item: { key: string; textValue: string }) =>
          h(Item as any, { key: item.key, textValue: item.textValue }, { default: () => item.textValue }),
      },
      attachTo: document.body,
    });

    const toolbar = wrapper.get('[role="toolbar"]');
    expect(toolbar.findAll("button")).toHaveLength(3);
    expect(toolbar.find('button[aria-label="Edit"]').exists()).toBe(true);
    expect(toolbar.find('button[aria-label="Copy"]').exists()).toBe(true);
  });

  it("updates the selected text when selectedItemCount changes", async () => {
    let updateCount: (value: SelectedItemCount) => void = () => {};
    const wrapper = mount(
      defineComponent({
        setup() {
          const selectedItemCount = ref<SelectedItemCount>(1);
          updateCount = (value) => {
            selectedItemCount.value = value;
          };

          return () =>
            h(ActionBar as any, {
              selectedItemCount: selectedItemCount.value,
              onClearSelection: vi.fn(),
            }, {
              default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    const selectedCountText = wrapper.get(".spectrum-ActionBar-selectedCount");
    expect(selectedCountText.text()).toBe("1 selected");

    updateCount(2);
    await nextTick();
    expect(wrapper.get(".spectrum-ActionBar-selectedCount").text()).toBe("2 selected");

    updateCount("all");
    await nextTick();
    expect(wrapper.get(".spectrum-ActionBar-selectedCount").text()).toBe("All selected");
  });

  it("calls onAction and clear selection when buttons are activated", async () => {
    const onAction = vi.fn();
    let clearHandled = false;

    const wrapper = mount(
      defineComponent({
        setup() {
          const selectedItemCount = ref<SelectedItemCount>(2);
          return () =>
            h(ActionBar as any, {
              selectedItemCount: selectedItemCount.value,
              onClearSelection: () => {
                clearHandled = true;
                selectedItemCount.value = 0;
              },
              onAction,
            }, {
              default: () => [
                h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" }),
                h(Item as any, { key: "copy", textValue: "Copy" }, { default: () => "Copy" }),
              ],
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await wrapper.get('button[aria-label="Edit"]').trigger("click");
    expect(onAction).toHaveBeenCalledWith("edit");

    await wrapper.get('button[aria-label="Clear selection"]').trigger("click");
    await nextTick();
    expect(clearHandled).toBe(true);
    expect(wrapper.find('[role="toolbar"]').exists()).toBe(false);
  });

  it("clears selection when pressing Escape", async () => {
    const onClearSelection = vi.fn();
    const wrapper = mount(
      defineComponent({
        setup() {
          const selectedItemCount = ref<SelectedItemCount>(1);
          return () =>
            h(ActionBar as any, {
              selectedItemCount: selectedItemCount.value,
              onClearSelection: () => {
                onClearSelection();
                selectedItemCount.value = 0;
              },
            }, {
              default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
            });
        },
      }),
      {
        attachTo: document.body,
      }
    );

    await wrapper.get('[role="toolbar"]').trigger("keydown", {
      key: "Escape",
    });
    await nextTick();

    expect(onClearSelection).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[role="toolbar"]').exists()).toBe(false);
  });

  it("respects disabledKeys", () => {
    const wrapper = mount(ActionBar as any, {
      props: {
        disabledKeys: ["edit"],
        selectedItemCount: 1,
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [
          h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" }),
          h(Item as any, { key: "copy", textValue: "Copy" }, { default: () => "Copy" }),
        ],
      },
      attachTo: document.body,
    });

    expect(wrapper.get('button[aria-label="Edit"]').attributes("disabled")).toBe("disabled");
    expect(wrapper.get('button[aria-label="Copy"]').attributes("disabled")).toBeUndefined();
  });

  it("announces actions as available on mount", () => {
    mount(ActionBar as any, {
      props: {
        selectedItemCount: 1,
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
      },
      attachTo: document.body,
    });

    expect(announceMock).toHaveBeenCalledTimes(1);
    expect(announceMock).toHaveBeenCalledWith("Actions available.");
  });

  it("syncs disabledKeys and selected count props without remount", async () => {
    const wrapper = mount(ActionBar as any, {
      props: {
        disabledKeys: [],
        selectedItemCount: 1,
        onClearSelection: vi.fn(),
      },
      slots: {
        default: () => [h(Item as any, { key: "edit", textValue: "Edit" }, { default: () => "Edit" })],
      },
      attachTo: document.body,
    });

    expect(wrapper.get('button[aria-label="Edit"]').attributes("disabled")).toBeUndefined();

    await wrapper.setProps({ disabledKeys: ["edit"], selectedItemCount: 2 });

    expect(wrapper.get('button[aria-label="Edit"]').attributes("disabled")).toBe("disabled");
    expect(wrapper.get(".spectrum-ActionBar-selectedCount").text()).toBe("2 selected");
  });
});
