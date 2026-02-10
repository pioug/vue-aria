import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/vue";
import {
  defineComponent,
  h,
  nextTick,
  ref,
  type PropType,
} from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideRouter } from "@vue-aria/utils";
import { Link } from "../src";

const TooltipTrigger = defineComponent({
  name: "TooltipTrigger",
  props: {
    onOpenChange: {
      type: Function as PropType<((isOpen: boolean) => void) | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const isOpen = ref(false);

    const setOpen = (next: boolean) => {
      if (isOpen.value === next) {
        return;
      }

      isOpen.value = next;
      props.onOpenChange?.(next);
    };

    return () =>
      h(
        "div",
        {
          onFocusin: () => setOpen(true),
          onFocusout: (event: FocusEvent) => {
            const currentTarget = event.currentTarget;
            const relatedTarget = event.relatedTarget;

            if (
              currentTarget instanceof HTMLElement &&
              relatedTarget instanceof Node &&
              currentTarget.contains(relatedTarget)
            ) {
              return;
            }

            setOpen(false);
          },
        },
        [
          slots.default?.() ?? null,
          isOpen.value
            ? h("div", { role: "tooltip" }, "Helpful information.")
            : null,
        ]
      );
  },
});

describe("Link", () => {
  it("handles defaults", async () => {
    const onPressSpy = vi.fn();
    const user = userEvent.setup();
    const { getByText } = render(Link, {
      props: {
        onPress: onPressSpy,
      },
      slots: {
        default: "Click me",
      },
    });

    const link = getByText("Click me");
    await user.click(link);

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it("supports UNSAFE_className", () => {
    const { getByText } = render(Link, {
      props: {
        UNSAFE_className: "test-class",
      },
      slots: {
        default: "Click me",
      },
    });

    const link = getByText("Click me");
    expect(link.getAttribute("class")).toContain("test-class");
  });

  it("wraps string children to span", () => {
    const { getByRole } = render(Link, {
      slots: {
        default: "Click me",
      },
    });

    const link = getByRole("link");

    expect(link.nodeName).toBe("SPAN");
    expect(link.getAttribute("tabindex")).toBe("0");
  });

  it("supports href", () => {
    const { getByRole } = render(Link, {
      props: {
        href: "https://adobe.com",
      },
      slots: {
        default: "Click me",
      },
    });

    const link = getByRole("link") as HTMLAnchorElement;

    expect(link.nodeName).toBe("A");
    expect(link.href).toBe("https://adobe.com/");
  });

  it("wraps custom child element", async () => {
    const user = userEvent.setup();
    const onPressSpy = vi.fn();
    const linkRef = ref<HTMLAnchorElement | null>(null);
    const { getByRole } = render(Link, {
      props: {
        UNSAFE_className: "test-class",
        onPress: onPressSpy,
      },
      slots: {
        default: () =>
          h(
            "a",
            {
              href: "#only-hash-in-jsdom",
              ref: linkRef,
            },
            "Click me"
          ),
      },
    });

    await nextTick();
    const link = getByRole("link") as HTMLAnchorElement;

    expect(link.nodeName).toBe("A");
    expect(linkRef.value).toBe(link);
    expect(link.getAttribute("class")).toContain("test-class");
    expect(link.getAttribute("href")).toBe("#only-hash-in-jsdom");

    await user.click(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it("supports custom data attributes", () => {
    const { getByRole } = render(Link, {
      props: {
        "data-testid": "test",
      } as Record<string, unknown>,
      slots: {
        default: "Click me",
      },
    });

    const link = getByRole("link");
    expect(link.getAttribute("data-testid")).toBe("test");
  });

  it("supports autoFocus", async () => {
    const { getByRole } = render(Link, {
      props: {
        autoFocus: true,
      },
      slots: {
        default: "Click me",
      },
    });

    await nextTick();
    await nextTick();
    const link = getByRole("link");

    expect(document.activeElement).toBe(link);
  });

  it("supports a wrapping tooltip trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const App = defineComponent({
      name: "LinkTooltipApp",
      setup() {
        return () =>
          h("div", null, [
            h(
              TooltipTrigger,
              {
                onOpenChange,
              },
              {
                default: () => [h(Link, null, () => "Click me")],
              }
            ),
            h("button", { type: "button" }, "Next target"),
          ]);
      },
    });

    const { getByRole, queryByRole } = render(App);

    expect(queryByRole("tooltip")).toBeNull();

    await user.tab();
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(getByRole("tooltip").textContent).toContain("Helpful information.");

    await user.tab();
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    expect(queryByRole("tooltip")).toBeNull();
  });

  it("supports RouterProvider", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    const App = defineComponent({
      name: "LinkRouterApp",
      setup() {
        provideRouter({
          navigate,
          useHref: (href) => `/base${href}`,
        });

        return () =>
          h(
            Link,
            {
              href: "/foo",
              routerOptions: {
                foo: "bar",
              },
            },
            () => "Click me"
          );
      },
    });

    const { getByRole } = render(App);
    const link = getByRole("link");

    expect(link.getAttribute("href")).toBe("/base/foo");

    await user.click(link);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/foo", {
      foo: "bar",
    });
  });
});
