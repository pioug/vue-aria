import { mount } from "@vue/test-utils";
import { I18nProvider } from "@vue-aria/i18n";
import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useBreadcrumbs } from "../src";
import { defineComponent, h } from "vue";

describe("useBreadcrumbs", () => {
  const run = (props: Record<string, unknown>) => {
    const scope = effectScope();
    const result = scope.run(() => useBreadcrumbs(props))!;
    scope.stop();
    return result;
  };

  it("handles defaults", () => {
    const { navProps } = run({});
    expect(navProps["aria-label"]).toBe("Breadcrumbs");
  });

  it("handles custom aria-label", () => {
    const { navProps } = run({ "aria-label": "test-label" });
    expect(navProps["aria-label"]).toBe("test-label");
  });

  it("uses localized default label from i18n provider locale", () => {
    const BreadcrumbProbe = defineComponent({
      setup() {
        const { navProps } = useBreadcrumbs({});
        return () => h("nav", { ...navProps, "data-testid": "breadcrumbs" });
      },
    });

    const App = defineComponent({
      setup() {
        return () =>
          h(I18nProvider, { locale: "fr-FR" }, { default: () => h(BreadcrumbProbe) });
      },
    });

    const wrapper = mount(App);
    expect(wrapper.find('[data-testid="breadcrumbs"]').attributes("aria-label")).toBe(
      "Chemin de navigation"
    );
  });
});
