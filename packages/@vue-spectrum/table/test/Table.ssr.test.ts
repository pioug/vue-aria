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

describe("Table Static SSR", () => {
  it("should render without errors", async () => {
    const App = defineComponent({
      name: "TableStaticSSRApp",
      setup() {
        return () =>
          h(TableView, {
            "aria-label": "Example table with static contents",
            columns: [
              { key: "name", title: "Name", isRowHeader: true },
              { key: "type", title: "Type" },
              { key: "date", title: "Date Modified" },
            ],
            items: [
              { key: "games", name: "Games", type: "File folder", date: "6/7/2020" },
              { key: "program-files", name: "Program Files", type: "File folder", date: "4/7/2021" },
            ],
          });
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("react-spectrum-TableView");
    expect(html).toContain("Program Files");
  });
});
