import userEvent from "@testing-library/user-event";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { theme as defaultTheme } from "@vue-spectrum/theme-default";
import { Provider } from "../src/Provider";
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
  type S2SortDescriptor,
} from "../src/TableView";

describe("@vue-spectrum/s2 TableView", () => {
  it("renders baseline attrs and table semantics", async () => {
    const wrapper = mount(Provider, {
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TableView, {
            "aria-label": "People",
            columns: [
              { key: "name", title: "Name", allowsSorting: true, isRowHeader: true },
              { key: "role", title: "Role" },
            ],
            items: [
              { key: "a", name: "Ada", role: "Engineer" },
              { key: "b", name: "Grace", role: "Scientist" },
            ],
          }),
      },
    });

    await wrapper.vm.$nextTick();

    const grid = wrapper.get('.s2-TableView[role="grid"]');
    expect(grid.attributes("aria-label")).toBe("People");
    expect(grid.attributes("aria-colcount")).toBe("2");
    expect(grid.text()).toContain("Ada");
    expect(grid.text()).toContain("Grace");
  });

  it("supports sort callback on sortable headers", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const wrapper = mount(Provider, {
      attachTo: document.body,
      props: {
        theme: defaultTheme,
      },
      slots: {
        default: () =>
          h(TableView, {
            "aria-label": "People",
            columns: [
              { key: "name", title: "Name", allowsSorting: true, isRowHeader: true },
              { key: "role", title: "Role", allowsSorting: true },
            ],
            items: [
              { key: "a", name: "Ada", role: "Engineer" },
              { key: "b", name: "Grace", role: "Scientist" },
            ],
            onSortChange,
          }),
      },
    });

    await wrapper.vm.$nextTick();
    const firstHeader = wrapper.get('[role="columnheader"]');
    await user.click(firstHeader.element);

    expect(onSortChange).toHaveBeenCalledTimes(1);
    const firstSort = onSortChange.mock.calls[0]?.[0] as S2SortDescriptor;
    expect(firstSort.column).toBe("name");
    expect(firstSort.direction).toBe("ascending");
  });

  it("supports static table composition exports", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const wrapper = mount(Provider, {
        props: {
          theme: defaultTheme,
        },
        slots: {
          default: () =>
            h(
              TableView,
              {
                "aria-label": "Slots table",
              },
              {
                default: () => [
                  h(TableHeader, null, {
                    default: () => [
                      h(Column, { id: "name", isRowHeader: true }, { default: () => "Name" }),
                      h(Column, { id: "role" }, { default: () => "Role" }),
                    ],
                  }),
                  h(TableBody, null, {
                    default: () => [
                      h(Row, { id: "a" }, {
                        default: () => [
                          h(Cell, null, { default: () => "Ada" }),
                          h(Cell, null, { default: () => "Engineer" }),
                        ],
                      }),
                      h(Row, { id: "b" }, {
                        default: () => [
                          h(Cell, null, { default: () => "Grace" }),
                          h(Cell, null, { default: () => "Scientist" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }
            ),
        },
      });

      await wrapper.vm.$nextTick();
      const grid = wrapper.get('[role="grid"]');
      expect(grid.text()).toContain("Ada");
      expect(grid.text()).toContain("Scientist");
    } finally {
      warnSpy.mockRestore();
    }
  });
});
