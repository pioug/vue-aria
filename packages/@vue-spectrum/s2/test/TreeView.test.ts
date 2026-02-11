import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  TreeViewItem as SpectrumTreeViewItem,
  TreeViewItemContent as SpectrumTreeViewItemContent,
} from "@vue-spectrum/tree";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import {
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  TreeViewLoadMoreItem,
} from "../src";
import { Provider } from "../src/Provider";

describe("@vue-spectrum/s2 TreeView", () => {
  it("renders TreeView with baseline classes", () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TreeView, {
            "aria-label": "Tree",
            size: "L",
            items: [
              { id: "projects", name: "Projects" },
              { id: "assets", name: "Assets" },
            ],
          }),
      },
    });

    const tree = wrapper.get(".s2-TreeView");
    expect(tree.classes()).toContain("s2-TreeView--L");
    expect(tree.attributes("data-s2-size")).toBe("L");
    expect(tree.attributes("role")).toBe("treegrid");
  });

  it("re-exports static tree slot helpers", () => {
    expect(TreeViewItem).toBe(SpectrumTreeViewItem);
    expect(TreeViewItemContent).toBe(SpectrumTreeViewItemContent);
  });

  it("supports load-more helper interactions", async () => {
    const onLoadMore = vi.fn();
    const wrapper = mount(TreeViewLoadMoreItem, {
      props: {
        onLoadMore,
      },
    });

    await wrapper.get("button").trigger("click");
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    await wrapper.setProps({
      loadingState: "loadingMore",
    });
    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(wrapper.find("[role=\"progressbar\"]").exists()).toBe(true);
  });
});
