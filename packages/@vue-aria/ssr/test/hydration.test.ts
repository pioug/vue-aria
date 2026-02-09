import { describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { provideSSR, useId } from "../src";

describe("SSR hydration", () => {
  it("hydrates with deterministic generated ids across nested providers", async () => {
    const IdNode = defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const id = useId();
        return () => h("div", { id: id.value, "data-label": props.label }, props.label);
      },
    });

    const NestedScope = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h("section", [h(IdNode, { label: "nested-a" }), h(IdNode, { label: "nested-b" })]);
      },
    });

    const App = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h("main", [h(IdNode, { label: "root" }), h(NestedScope)]);
      },
    });

    const serverHtml = await renderToString(createSSRApp(App));
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.append(container);

    const serverIds = Array.from(container.querySelectorAll<HTMLElement>("[id]"), (node) => node.id);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const app = createSSRApp(App);
    app.mount(container);

    const hydratedIds = Array.from(container.querySelectorAll<HTMLElement>("[id]"), (node) => node.id);

    expect(hydratedIds).toEqual(serverIds);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(
      warnSpy.mock.calls.some((call) =>
        call.some((value) => String(value).toLowerCase().includes("hydration"))
      )
    ).toBe(false);
    expect(
      errorSpy.mock.calls.some((call) =>
        call.some((value) => String(value).toLowerCase().includes("hydration"))
      )
    ).toBe(false);

    app.unmount();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
