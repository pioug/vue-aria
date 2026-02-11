import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, type PropType } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Divider } from "@vue-spectrum/divider";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { ActionGroup, Item } from "../src";

type ToolbarOrientation = "horizontal" | "vertical";

const Toolbar = defineComponent({
  name: "ToolbarHarness",
  props: {
    orientation: {
      type: String as PropType<ToolbarOrientation>,
      default: "horizontal",
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          role: "toolbar",
          "aria-label": props.ariaLabel,
          "aria-labelledby": props.ariaLabel ? undefined : props.ariaLabelledby,
          "aria-orientation": props.orientation,
        },
        slots.default?.()
      );
  },
});

function renderWithProvider(component: ReturnType<typeof defineComponent>) {
  const App = defineComponent({
    name: "ActionGroupToolbarProviderHarness",
    setup() {
      return () =>
        h(
          Provider,
          {
            theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
          },
          {
            default: () => h(component),
          }
        );
    },
  });

  return render(App);
}

function createToolbarScenario(orientation: ToolbarOrientation = "horizontal") {
  return defineComponent({
    name: "ActionGroupToolbarScenario",
    setup() {
      return () =>
        h(Toolbar, { orientation, "aria-label": "Toolbar actions" }, {
          default: () => [
            h(
              ActionGroup,
              {
                "aria-label": "align",
              },
              {
                default: () => [
                  h(Item, { id: "alignleft" }, () => "Align left"),
                  h(Item, { id: "aligncenter" }, () => "Align center"),
                  h(Item, { id: "alignright" }, () => "Align right"),
                ],
              }
            ),
            h(Divider, {
              orientation: orientation === "horizontal" ? "vertical" : "horizontal",
            }),
            h(
              ActionGroup,
              {
                "aria-label": "zoom",
              },
              {
                default: () => [
                  h(Item, { id: "zoomin" }, () => "Zoom in"),
                  h(Item, { id: "zoomout" }, () => "Zoom out"),
                ],
              }
            ),
          ],
        });
    },
  });
}

describe("Toolbar", () => {
  it("renders action buttons for nested action groups", () => {
    const tree = renderWithProvider(createToolbarScenario("horizontal"));

    expect(tree.getAllByRole("button")).toHaveLength(5);
    expect(tree.getByRole("button", { name: "Align left" })).toBeTruthy();
    expect(tree.getByRole("button", { name: "Zoom out" })).toBeTruthy();
  });

  it("renders vertical separators in horizontal orientation", () => {
    const tree = renderWithProvider(createToolbarScenario("horizontal"));

    const separators = tree.getAllByRole("separator");
    expect(separators).toHaveLength(1);
    expect(separators[0]?.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("renders horizontal separators in vertical orientation", () => {
    const tree = renderWithProvider(createToolbarScenario("vertical"));

    const separators = tree.getAllByRole("separator");
    expect(separators).toHaveLength(1);
    expect(separators[0]?.getAttribute("aria-orientation")).toBeNull();
  });

  it("uses aria-label precedence over aria-labelledby", () => {
    const App = defineComponent({
      name: "ToolbarLabelPrecedenceHarness",
      setup() {
        return () =>
          h("div", null, [
            h("span", { id: "toolbar-id" }, "Toolbar label from id"),
            h(Toolbar, {
              ariaLabel: "Toolbar explicit label",
              ariaLabelledby: "toolbar-id",
            }, {
              default: () =>
                h(ActionGroup, {
                  "aria-label": "group",
                  items: [{ key: "a", label: "Action" }],
                }),
            }),
          ]);
      },
    });

    const tree = renderWithProvider(App);
    const toolbar = tree.getByRole("toolbar", { name: "Toolbar explicit label" });

    expect(toolbar.getAttribute("aria-labelledby")).toBeNull();
  });

  it("supports actions and submenu-style selection groups inside the toolbar", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();

    const App = defineComponent({
      name: "ToolbarActionSelectionHarness",
      setup() {
        return () =>
          h(Toolbar, { "aria-label": "Actions" }, {
            default: () => [
              h(
                ActionGroup,
                {
                  "aria-label": "manage",
                  onAction,
                },
                {
                  default: () => [
                    h(Item, { id: "alignleft", "data-testid": "alignLeft" }, () =>
                      "Align Left"
                    ),
                    h(Item, { id: "alignright" }, () => "Align Right"),
                  ],
                }
              ),
              h(Divider, { orientation: "vertical" }),
              h(
                ActionGroup,
                {
                  "aria-label": "layout",
                  selectionMode: "single",
                  onSelectionChange,
                },
                {
                  default: () => [
                    h(Item, { id: "list" }, () => "List"),
                    h(Item, { id: "grid", "data-testid": "grid" }, () => "Grid"),
                  ],
                }
              ),
            ],
          });
      },
    });

    const tree = renderWithProvider(App);
    await user.click(tree.getByTestId("alignLeft"));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("alignleft");

    await user.click(tree.getByTestId("grid"));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });
});
