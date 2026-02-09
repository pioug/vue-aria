import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { describe, expect, it } from "vitest";
import { useField } from "@vue-aria/label";
import { Field } from "../src";

describe("Label package SSR", () => {
  it("renders Field without errors", async () => {
    const App = defineComponent({
      name: "LabelSSRApp",
      setup() {
        const { labelProps, fieldProps, descriptionProps, errorMessageProps } = useField({
          label: "Field label",
        });

        return () =>
          h(
            Field,
            {
              label: "Field label",
              labelProps: labelProps.value,
              descriptionProps: descriptionProps.value,
              errorMessageProps: errorMessageProps.value,
            } as Record<string, unknown>,
            {
              default: () => [h("input", { ...fieldProps.value, type: "text" })],
            }
          );
      },
    });

    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("spectrum-Field");
    expect(html).toContain("spectrum-FieldLabel");
  });
});
