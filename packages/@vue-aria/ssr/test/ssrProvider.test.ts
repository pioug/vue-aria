import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { provideSSR, useId, useIsSSR } from "../src";

describe("SSR provider", () => {
  it("scopes generated ids per SSR provider", () => {
    const ids: string[] = [];

    const Child = defineComponent({
      setup() {
        const id = useId();
        ids.push(id.value);
        return () => h("div");
      },
    });

    const Root = defineComponent({
      setup() {
        provideSSR();
        return () => h("div", [h(Child), h(Child)]);
      },
    });

    mount(Root);

    expect(ids).toEqual(["v-aria-1", "v-aria-2"]);
  });

  it("creates deterministic nested prefixes", () => {
    const ids: Record<string, string> = {};

    const IdCapture = defineComponent({
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        ids[props.name] = useId().value;
        return () => h("div");
      },
    });

    const NestedScope = defineComponent({
      props: {
        name: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        provideSSR();
        return () => h(IdCapture, { name: props.name });
      },
    });

    const RootScope = defineComponent({
      setup() {
        provideSSR();
        return () =>
          h("div", [
            h(IdCapture, { name: "root" }),
            h(NestedScope, { name: "first" }),
            h(NestedScope, { name: "second" }),
          ]);
      },
    });

    mount(RootScope);

    expect(ids.root).toBe("v-aria-1");
    expect(ids.first).toBe("v-aria-1-1");
    expect(ids.second).toBe("v-aria-2-1");
  });

  it("exposes SSR rendering flag via useIsSSR", () => {
    const values: boolean[] = [];

    const Child = defineComponent({
      setup() {
        values.push(useIsSSR().value);
        return () => h("div");
      },
    });

    const WithoutProvider = defineComponent({
      setup() {
        return () => h(Child);
      },
    });

    mount(WithoutProvider);

    const WithProvider = defineComponent({
      setup() {
        provideSSR({ isSSR: true });
        return () => h(Child);
      },
    });

    mount(WithProvider);

    expect(values).toEqual([false, true]);
  });
});
