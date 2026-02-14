import { createApp, defineComponent, h } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import { BreakpointProvider } from "../src/BreakpointProvider";
import { dimensionValue, getResponsiveProp, useStyleProps, viewStyleProps } from "../src/styleProps";

function mount(component: unknown) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component as Parameters<typeof createApp>[0]);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("styleProps", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("resolves dimension values with spectrum token fallback", () => {
    expect(dimensionValue(24)).toBe("24px");
    expect(dimensionValue("200px")).toBe("200px");
    expect(dimensionValue("size-100")).toBe("var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100))");
  });

  it("resolves responsive props from matched breakpoints", () => {
    expect(getResponsiveProp({ base: "a", M: "b", L: "c" }, ["L", "M", "base"])).toBe("c");
    expect(getResponsiveProp({ base: "a", L: "c" }, ["M", "base"])).toBe("a");
  });

  it("derives responsive style props from breakpoint context", () => {
    const Probe = defineComponent({
      name: "StylePropsProbe",
      props: {
        width: {
          type: Object,
          required: true,
        },
      },
      setup(props) {
        const { styleProps } = useStyleProps(props as unknown as Record<string, unknown>);
        return () =>
          h("div", {
            "data-testid": "probe",
            ...styleProps.value,
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(BreakpointProvider, { matchedBreakpoints: ["M", "base"] }, () =>
              h(Probe, {
                width: {
                  base: "100px",
                  M: "200px",
                },
              })
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.style.width).toBe("200px");
    unmount();
  });

  it("applies extended view style props", () => {
    const Probe = defineComponent({
      name: "ViewStylePropsProbe",
      setup() {
        const { styleProps } = useStyleProps(
          {
            backgroundColor: "gray-50",
            borderWidth: "thin",
            borderColor: "default",
            borderRadius: "regular",
          },
          viewStyleProps
        );
        return () =>
          h("div", {
            "data-testid": "probe",
            ...styleProps.value,
          });
      },
    });

    const { container, unmount } = mount(Probe);
    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.style.backgroundColor).toContain("var(--spectrum-alias-background-color-gray-50");
    expect(probe?.style.borderWidth).toBe("var(--spectrum-alias-border-size-thin)");
    expect(probe?.style.borderStyle).toBe("solid");
    expect(probe?.style.boxSizing).toBe("border-box");
    expect(probe?.style.borderColor).toBe("var(--spectrum-alias-border-color)");
    expect(probe?.style.borderRadius).toBe("var(--spectrum-alias-border-radius-regular)");
    unmount();
  });
});
