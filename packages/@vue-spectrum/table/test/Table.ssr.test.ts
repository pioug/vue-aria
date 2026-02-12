import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { Cell, Column, Row, TableBody, TableHeader, TableView } from "../src";

describe("TableView SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TableSSRApp",
      setup() {
        return () =>
          h(
            TableView,
            {
              "aria-label": "Table",
            },
            {
              default: () => [
                h(TableHeader, null, {
                  default: () => [
                    h(Column, { id: "foo", isRowHeader: true }, () => "Foo"),
                    h(Column, { id: "bar" }, () => "Bar"),
                    h(Column, { id: "baz" }, () => "Baz"),
                  ],
                }),
                h(TableBody, null, {
                  default: () => [
                    h(Row, { id: "row-1" }, {
                      default: () => [
                        h(Cell, () => "Foo 1"),
                        h(Cell, () => "Bar 1"),
                        h(Cell, () => "Baz 1"),
                      ],
                    }),
                    h(Row, { id: "row-2" }, {
                      default: () => [
                        h(Cell, () => "Foo 2"),
                        h(Cell, () => "Bar 2"),
                        h(Cell, () => "Baz 2"),
                      ],
                    }),
                  ],
                }),
              ],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TableView");
    expect(html).toContain("Foo 1");
    expect(html).toContain("Baz 2");
  });
});

describe("Table Nested Rows SSR", () => {
  it("should render without errors", async () => {
    const columns = [
      { key: "foo", title: "Foo", isRowHeader: true },
      { key: "bar", title: "Bar" },
      { key: "baz", title: "Baz" },
    ];

    const items = [
      {
        key: "row-1",
        foo: "Lvl 1 Foo 1",
        bar: "Lvl 1 Bar 1",
        baz: "Lvl 1 Baz 1",
        childRows: [
          {
            key: "row-1-1",
            foo: "Lvl 2 Foo 1",
            bar: "Lvl 2 Bar 1",
            baz: "Lvl 2 Baz 1",
          },
        ],
      },
    ];

    const App = defineComponent({
      name: "TableNestedRowsSSRApp",
      setup() {
        return () =>
          h(TableView, {
            "aria-label": "example table with nested rows",
            columns,
            items,
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TableView");
    expect(html).toContain("Lvl 1 Foo 1");
  });
});

describe("Table Static SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TableStaticSSRApp",
      setup() {
        return () =>
          h(
            TableView,
            {
              "aria-label": "Example table with static contents",
            },
            {
              default: () => [
                h(TableHeader, null, {
                  default: () => [
                    h(Column, null, () => "Name"),
                    h(Column, null, () => "Type"),
                    h(Column, null, () => "Date Modified"),
                  ],
                }),
                h(TableBody, null, {
                  default: () => [
                    h(Row, null, {
                      default: () => [
                        h(Cell, null, () => "Games"),
                        h(Cell, null, () => "File folder"),
                        h(Cell, null, () => "6/7/2020"),
                      ],
                    }),
                    h(Row, null, {
                      default: () => [
                        h(Cell, null, () => "Program Files"),
                        h(Cell, null, () => "File folder"),
                        h(Cell, null, () => "4/7/2021"),
                      ],
                    }),
                  ],
                }),
              ],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TableView");
    expect(html).toContain("Program Files");
  });
});
