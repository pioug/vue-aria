import { fireEvent, render } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { ColorArea } from "../src";

describe("ColorArea", () => {
  it("emits a color when the area is clicked", () => {
    const onChange = vi.fn();

    const tree = render(ColorArea, {
      props: {
        value: "#ff0000",
        onChange,
      },
    });

    const area = tree.getByRole("application") as HTMLElement;
    expect(area.getAttribute("aria-label")).toBe("Color area");
    vi.spyOn(area, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(area, {
      clientX: 100,
      clientY: 50,
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextColor = onChange.mock.calls[0]?.[0] as string;
    expect(nextColor.startsWith("#")).toBe(true);
  });

  it("localizes default labels from i18n locale", () => {
    const App = defineComponent({
      name: "ColorAreaLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(ColorArea, {
            value: "#ff0000",
          });
      },
    });

    const tree = render(App);
    const area = tree.getByRole("application", { name: "Zone de couleur" });
    expect(area).toBeTruthy();
    expect(
      tree.container.querySelector('[aria-label="Position de la couleur"]')
    ).not.toBeNull();
  });
});
