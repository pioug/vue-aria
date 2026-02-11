import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import { TagGroup } from "../src/TagGroup";

describe("@vue-spectrum/s2 TagGroup", () => {
  it("renders baseline attrs and grid roles", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TagGroup, {
            "aria-label": "tag group",
            items: [
              { key: "1", label: "Tag 1", "aria-label": "Tag 1" },
              { key: "2", label: "Tag 2", "aria-label": "Tag 2" },
            ],
          }),
      },
    });

    await wrapper.vm.$nextTick();

    wrapper.get(".s2-TagGroup");
    const group = wrapper.get('[role="grid"]');
    expect(group.attributes("aria-label")).toBe("tag group");
    expect(wrapper.findAll('[role="row"]').length).toBe(2);
  });

  it("emits onRemove when delete key is pressed", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TagGroup, {
            "aria-label": "tag group",
            allowsRemoving: true,
            onRemove,
            items: [
              { key: "1", label: "Tag 1", "aria-label": "Tag 1" },
              { key: "2", label: "Tag 2", "aria-label": "Tag 2" },
              { key: "3", label: "Tag 3", "aria-label": "Tag 3" },
            ],
          }),
      },
    });

    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('[role="row"]');
    (rows[1]?.element as HTMLElement).focus();
    await user.keyboard("{Delete}");

    expect(onRemove).toHaveBeenCalledTimes(1);
    const removedSet = onRemove.mock.calls[0]?.[0] as Set<string>;
    expect(Array.from(removedSet)).toEqual(["2"]);
  });
});
