import { ModalProvider, useModal } from "@vue-aria/overlays";
import { useRouter } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import { Checkbox } from "@vue-spectrum/checkbox";
import { theme as defaultTheme } from "@vue-spectrum/theme";
import { Switch } from "@vue-spectrum/switch";
import { keepSpectrumClassNames, useBreakpoint, useStyleProps } from "@vue-spectrum/utils";
import { createApp, defineComponent, h, nextTick, ref, type PropType } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UNSAFE_resetSpectrumClassNames } from "../../utils/src/classNames";
import { Provider, useProviderProps } from "../src/Provider";
import type { Theme } from "../src/types";

const theme: Theme = defaultTheme;
const defaultLightClass = Object.values(theme.light ?? {})[0] as string;
const defaultDarkClass = Object.values(theme.dark ?? {})[0] as string;

const mediaQueryLight = "(prefers-color-scheme: light)";
const mediaQueryDark = "(prefers-color-scheme: dark)";
const mediaQueryMinXSmall = "(min-width: 190px)";
const mediaQueryMinSmall = "(min-width: 640px)";
const mediaQueryMinMedium = "(min-width: 768px)";
const mediaQueryMinLarge = "(min-width: 1024px)";

type MatchMediaChangeListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryList {
  media: string;
  matches: boolean;
  onchange: MatchMediaChangeListener | null;
  addListener: (listener: MatchMediaChangeListener) => void;
  removeListener: (listener: MatchMediaChangeListener) => void;
  addEventListener: (type: string, listener: MatchMediaChangeListener) => void;
  removeEventListener: (type: string, listener: MatchMediaChangeListener) => void;
  dispatchEvent: (event: Event) => boolean;
}

function createMatchMediaController(initialActiveQueries: Set<string>) {
  let activeQueries = new Set(initialActiveQueries);
  const lists = new Map<string, MockMediaQueryList>();
  const listeners = new Map<string, Set<MatchMediaChangeListener>>();

  const getListeners = (query: string) => {
    let set = listeners.get(query);
    if (!set) {
      set = new Set();
      listeners.set(query, set);
    }
    return set;
  };

  const notifyQuery = (query: string, nextMatches: boolean) => {
    const list = lists.get(query);
    if (!list || list.matches === nextMatches) {
      return;
    }

    list.matches = nextMatches;
    const event = { matches: nextMatches, media: query } as MediaQueryListEvent;
    for (const listener of getListeners(query)) {
      listener(event);
    }
    list.onchange?.(event);
  };

  const matchMedia = vi.fn().mockImplementation((query: string): MockMediaQueryList => {
    const existing = lists.get(query);
    if (existing) {
      return existing;
    }

    const list: MockMediaQueryList = {
      media: query,
      matches: activeQueries.has(query),
      onchange: null,
      addListener: (listener) => {
        getListeners(query).add(listener);
      },
      removeListener: (listener) => {
        getListeners(query).delete(listener);
      },
      addEventListener: (type, listener) => {
        if (type === "change") {
          getListeners(query).add(listener);
        }
      },
      removeEventListener: (type, listener) => {
        if (type === "change") {
          getListeners(query).delete(listener);
        }
      },
      dispatchEvent: () => true,
    };
    lists.set(query, list);
    return list;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    setActiveQueries(nextQueries: Set<string>) {
      activeQueries = new Set(nextQueries);
      for (const query of lists.keys()) {
        notifyQuery(query, activeQueries.has(query));
      }
    },
  };
}

function mount(component: any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("Provider", () => {
  let matchMediaController: ReturnType<typeof createMatchMediaController>;

  beforeEach(() => {
    matchMediaController = createMatchMediaController(new Set());
  });

  afterEach(() => {
    UNSAFE_resetSpectrumClassNames();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("uses OS theme by default - dark", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryDark]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider).not.toBeNull();
    expect(provider?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider?.classList.contains("spectrum")).toBe(true);
    expect(provider?.style.isolation).toBe("isolate");
    unmount();
  });

  it("uses OS theme by default - light", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains(defaultLightClass)).toBe(true);
    unmount();
  });

  it("can be set to dark regardless of OS setting", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains(defaultDarkClass)).toBe(true);
    unmount();
  });

  it("nested providers follow their ancestors by default", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider2?.classList.contains(defaultDarkClass)).toBe(true);
    unmount();
  });

  it("nested providers can update to follow their ancestors", async () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryDark]));
    const outerColorScheme = ref<"light" | "dark" | undefined>(undefined);

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: outerColorScheme.value,
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider2?.classList.contains(defaultDarkClass)).toBe(true);

    outerColorScheme.value = "light";
    await nextTick();

    expect(provider1?.classList.contains(defaultLightClass)).toBe(true);
    expect(provider2?.classList.contains(defaultLightClass)).toBe(true);
    unmount();
  });

  it("nested providers can be explicitly set to something else", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                colorScheme: "dark",
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    colorScheme: "light",
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider2?.classList.contains(defaultLightClass)).toBe(true);
    unmount();
  });

  it("renders an available color scheme automatically when parent one is missing in child theme", () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryDark]));
    const lightOnlyTheme: Theme = {
      global: {},
      light: { "spectrum--light": "spectrum--light" },
      medium: { "spectrum--medium": "spectrum--medium" },
      large: { "spectrum--large": "spectrum--large" },
    };

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    theme: lightOnlyTheme,
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider2?.classList.contains("spectrum--light")).toBe(true);
    unmount();
  });

  it("passes inherited provider props via useProviderProps", () => {
    const Probe = defineComponent({
      name: "Probe",
      setup() {
        const merged = useProviderProps({});

        return () =>
          h("div", {
            "data-testid": "probe",
            "data-readonly": String((merged as { isReadOnly?: boolean }).isReadOnly),
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.readonly).toBe("true");
    unmount();
  });

  it("preserves inherited provider values when local props are undefined", () => {
    const Probe = defineComponent({
      name: "UndefinedOverrideProbe",
      setup() {
        const merged = useProviderProps({
          isReadOnly: undefined,
          isDisabled: undefined,
        });

        return () =>
          h("div", {
            "data-testid": "probe",
            "data-readonly": String((merged as { isReadOnly?: boolean }).isReadOnly),
            "data-disabled": String((merged as { isDisabled?: boolean }).isDisabled),
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
                isDisabled: true,
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.readonly).toBe("true");
    expect(probe?.dataset.disabled).toBe("true");
    unmount();
  });

  it("lets explicit local provider-prop values override inherited values", () => {
    const Probe = defineComponent({
      name: "ExplicitOverrideProbe",
      setup() {
        const merged = useProviderProps({
          isReadOnly: false,
          isDisabled: false,
        });

        return () =>
          h("div", {
            "data-testid": "probe",
            "data-readonly": String((merged as { isReadOnly?: boolean }).isReadOnly),
            "data-disabled": String((merged as { isDisabled?: boolean }).isDisabled),
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
                isDisabled: true,
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="probe"]') as HTMLElement | null;
    expect(probe?.dataset.readonly).toBe("false");
    expect(probe?.dataset.disabled).toBe("false");
    unmount();
  });

  it("passes read-only provider props to child controls", () => {
    const onChangeSpy = vi.fn();
    const ToggleProbe = defineComponent({
      name: "ToggleProbe",
      props: {
        testid: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const merged = useProviderProps({});
        return () =>
          h(
            "button",
            {
              "data-testid": props.testid,
              "aria-readonly": String((merged as { isReadOnly?: boolean }).isReadOnly ?? false),
              onClick: () => {
                if (!(merged as { isReadOnly?: boolean }).isReadOnly) {
                  onChangeSpy();
                }
              },
            },
            "toggle"
          );
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
              },
              () => [
                h(ToggleProbe, { testid: "checkbox-probe" }),
                h(ToggleProbe, { testid: "switch-probe" }),
              ]
            );
        },
      })
    );

    const checkboxProbe = container.querySelector('[data-testid="checkbox-probe"]') as HTMLButtonElement | null;
    const switchProbe = container.querySelector('[data-testid="switch-probe"]') as HTMLButtonElement | null;

    expect(checkboxProbe?.getAttribute("aria-readonly")).toBe("true");
    expect(switchProbe?.getAttribute("aria-readonly")).toBe("true");

    checkboxProbe?.click();
    switchProbe?.click();
    expect(onChangeSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("forwards read-only props to spectrum checkbox and switch components", () => {
    const onChangeSpy = vi.fn();

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isReadOnly: true,
              },
              () => [
                h(
                  Checkbox as any,
                  {
                    onChange: onChangeSpy,
                  },
                  () => "Test Checkbox"
                ),
                h(
                  Switch as any,
                  {
                    onChange: onChangeSpy,
                  },
                  () => "Test Switch"
                ),
              ]
            );
        },
      })
    );

    const checkboxInput = container.querySelector(".spectrum-Checkbox-input") as HTMLInputElement | null;
    const switchInput = container.querySelector(".spectrum-ToggleSwitch-input") as HTMLInputElement | null;

    expect(checkboxInput?.getAttribute("aria-readonly")).toBe("true");
    expect(switchInput?.getAttribute("aria-readonly")).toBe("true");

    checkboxInput?.click();
    switchInput?.click();
    expect(onChangeSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("nested providers merge shared props for descendants", () => {
    const onPressSpy = vi.fn();
    const ActionProbe = defineComponent({
      name: "ActionProbe",
      setup() {
        const merged = useProviderProps({});
        return () =>
          h(
            "button",
            {
              "data-testid": "action-probe",
              "data-quiet": String((merged as { isQuiet?: boolean }).isQuiet ?? false),
              "aria-disabled": String((merged as { isDisabled?: boolean }).isDisabled ?? false),
              onClick: () => {
                if (!(merged as { isDisabled?: boolean }).isDisabled) {
                  onPressSpy();
                }
              },
            },
            "action"
          );
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isDisabled: true,
              },
              () =>
                h(
                  Provider,
                  {
                    isQuiet: true,
                  },
                  () => h(ActionProbe)
                )
            );
        },
      })
    );

    const actionProbe = container.querySelector('[data-testid="action-probe"]') as HTMLButtonElement | null;
    expect(actionProbe?.dataset.quiet).toBe("true");
    expect(actionProbe?.getAttribute("aria-disabled")).toBe("true");

    actionProbe?.click();
    expect(onPressSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("forwards nested provider disabled and emphasized props to spectrum checkbox components", () => {
    const onChangeSpy = vi.fn();

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isDisabled: true,
              },
              () =>
                h(
                  Provider,
                  {
                    isEmphasized: true,
                  },
                  () =>
                    h(
                      Checkbox as any,
                      {
                        onChange: onChangeSpy,
                      },
                      () => "Nested checkbox"
                    )
                )
            );
        },
      })
    );

    const checkboxLabel = container.querySelector(".spectrum-Checkbox") as HTMLElement | null;
    const checkboxInput = container.querySelector(".spectrum-Checkbox-input") as HTMLInputElement | null;
    expect(checkboxLabel).not.toBeNull();
    expect(checkboxLabel?.classList.contains("spectrum-Checkbox--quiet")).toBe(false);
    expect(checkboxInput?.disabled).toBe(true);

    checkboxInput?.click();
    expect(onChangeSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("forwards nested provider disabled and quiet props to spectrum action buttons", () => {
    const onPressSpy = vi.fn();

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                isDisabled: true,
              },
              () =>
                h(
                  Provider,
                  {
                    isQuiet: true,
                  },
                  () =>
                    h(
                      ActionButton as any,
                      {
                        onPress: onPressSpy,
                      },
                      () => "Hello"
                    )
                )
            );
        },
      })
    );

    const actionButton = container.querySelector(".spectrum-ActionButton") as HTMLButtonElement | null;
    expect(actionButton).not.toBeNull();
    expect(actionButton?.classList.contains("spectrum-ActionButton--quiet")).toBe(true);
    expect(actionButton?.disabled).toBe(true);

    actionButton?.click();
    expect(onPressSpy).not.toHaveBeenCalled();
    unmount();
  });

  it("provides router context to descendants when router is set", () => {
    const Probe = defineComponent({
      name: "RouterProbe",
      setup() {
        const router = useRouter();
        return () =>
          h("div", {
            "data-testid": "router-probe",
            "data-href": router.useHref("/test"),
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                router: {
                  navigate: vi.fn(),
                  useHref: (href: string) => `/app${href}`,
                },
              },
              () => h(Probe)
            );
        },
      })
    );

    const probe = container.querySelector('[data-testid="router-probe"]') as HTMLElement | null;
    expect(probe?.dataset.href).toBe("/app/test");
    unmount();
  });

  it("applies modal provider aria state on the wrapper", async () => {
    const ActiveModal = defineComponent({
      name: "ActiveModal",
      setup() {
        useModal();
        return () => h("div", { "data-testid": "modal-node" });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () => h(ModalProvider, null, () => h(ActiveModal))
            );
        },
      })
    );

    await nextTick();
    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.getAttribute("aria-hidden")).toBe("true");
    unmount();
  });

  it("warns when nested language directions conflict", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = document.createElement("div");
    host.setAttribute("dir", "rtl");
    document.body.appendChild(host);
    const app = createApp(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                locale: "en-US",
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    app.mount(host);
    await nextTick();

    expect(warnSpy).toHaveBeenCalledWith("Language directions cannot be nested. ltr inside rtl.");
    app.unmount();
    host.remove();
  });

  it("adds compatibility classes when keepSpectrumClassNames is enabled", () => {
    keepSpectrumClassNames();

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () => h("div", "hello")
            );
        },
      })
    );

    const provider = container.querySelector('[data-testid="provider"]') as HTMLElement | null;
    expect(provider?.classList.contains("react-spectrum-provider")).toBe(true);
    unmount();
  });

  it("only updates breakpoint observers when the range changes", async () => {
    matchMediaController.setActiveQueries(new Set(["(min-width: 768px)"]));
    const onBreakpointChange = vi.fn<(breakpoint: string) => void>();

    const Probe = defineComponent({
      name: "BreakpointProbe",
      setup() {
        const context = useBreakpoint();
        const previousBreakpoint = ref<string | null>(null);

        return () => {
          const breakpoint = context?.value.matchedBreakpoints[0] ?? "base";
          if (breakpoint !== previousBreakpoint.value) {
            onBreakpointChange(breakpoint);
            previousBreakpoint.value = breakpoint;
          }

          return h("button", { type: "button" }, "push me");
        };
      },
    });

    const { unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
              },
              () => h(Probe)
            );
        },
      })
    );

    expect(onBreakpointChange).toHaveBeenCalledTimes(1);
    expect(onBreakpointChange).toHaveBeenNthCalledWith(1, "M");

    matchMediaController.setActiveQueries(new Set(["(min-width: 1024px)"]));
    window.dispatchEvent(new Event("resize"));
    await nextTick();

    expect(onBreakpointChange).toHaveBeenCalledTimes(2);
    expect(onBreakpointChange).toHaveBeenNthCalledWith(2, "L");

    window.dispatchEvent(new Event("resize"));
    await nextTick();
    expect(onBreakpointChange).toHaveBeenCalledTimes(2);

    unmount();
  });

  it.each`
    name                    | mediaQuery               | providerProps          | expected
    ${"default"}            | ${mediaQueryMinXSmall}   | ${{}}                  | ${"192px"}
    ${"default"}            | ${mediaQueryMinSmall}    | ${{}}                  | ${"1000px"}
    ${"default"}            | ${mediaQueryMinMedium}   | ${{}}                  | ${"2000px"}
    ${"default"}            | ${mediaQueryMinLarge}    | ${{}}                  | ${"3000px"}
    ${"custom breakpoints"} | ${mediaQueryMinXSmall}   | ${{ breakpoints: { S: 480, M: 640, L: 1024 } }} | ${"192px"}
    ${"custom breakpoints"} | ${"(min-width: 480px)"}  | ${{ breakpoints: { S: 480, M: 640, L: 1024 } }} | ${"1000px"}
    ${"custom breakpoints"} | ${"(min-width: 640px)"}  | ${{ breakpoints: { S: 480, M: 640, L: 1024 } }} | ${"2000px"}
    ${"custom breakpoints"} | ${"(min-width: 1024px)"} | ${{ breakpoints: { S: 480, M: 640, L: 1024 } }} | ${"3000px"}
  `("applies responsive width values ($name $mediaQuery)", ({ mediaQuery, providerProps, expected }) => {
    matchMediaController.setActiveQueries(new Set([mediaQuery]));

    const ResponsiveProbe = defineComponent({
      name: "ResponsiveProbe",
      props: {
        width: {
          type: [String, Object] as PropType<
            string | { base?: string; S?: string; M?: string; L?: string }
          >,
          required: true,
        },
      },
      setup(props) {
        const { styleProps } = useStyleProps(props as unknown as Record<string, unknown>);
        return () =>
          h("div", {
            "data-testid": "field",
            ...styleProps.value,
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
                ...(providerProps as Record<string, unknown>),
              },
              () =>
                h(ResponsiveProbe, {
                  width: {
                    base: "192px",
                    S: "1000px",
                    M: "2000px",
                    L: "3000px",
                  },
                })
            );
        },
      })
    );

    const field = container.querySelector('[data-testid="field"]') as HTMLElement | null;
    expect(field?.style.width).toBe(expected);
    unmount();
  });

  it.each`
    mediaQuery             | expected
    ${mediaQueryMinXSmall} | ${"192px"}
    ${mediaQueryMinSmall}  | ${"192px"}
    ${mediaQueryMinMedium} | ${"192px"}
    ${mediaQueryMinLarge}  | ${"3000px"}
  `("uses base width when intermediate sizes are omitted ($mediaQuery)", ({ mediaQuery, expected }) => {
    matchMediaController.setActiveQueries(new Set([mediaQuery]));

    const ResponsiveProbe = defineComponent({
      name: "ResponsiveProbeOmitted",
      props: {
        width: {
          type: [String, Object] as PropType<string | { base?: string; L?: string }>,
          required: true,
        },
      },
      setup(props) {
        const { styleProps } = useStyleProps(props as unknown as Record<string, unknown>);
        return () =>
          h("div", {
            "data-testid": "field",
            ...styleProps.value,
          });
      },
    });

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider",
              },
              () =>
                h(ResponsiveProbe, {
                  width: {
                    base: "192px",
                    L: "3000px",
                  },
                })
            );
        },
      })
    );

    const field = container.querySelector('[data-testid="field"]') as HTMLElement | null;
    expect(field?.style.width).toBe(expected);
    unmount();
  });

  it("throws when no theme is provided and no parent provider exists", () => {
    expect(() =>
      mount(
        defineComponent({
          setup() {
            return () => h(Provider, {}, () => h("div", "hello"));
          },
        })
      )
    ).toThrowError("theme not found");
  });

  it("rerenders when OS preferred theme changes while on auto", async () => {
    matchMediaController.setActiveQueries(new Set([mediaQueryLight]));

    const { container, unmount } = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              {
                theme,
                "data-testid": "provider-1",
              },
              () =>
                h(
                  Provider,
                  {
                    "data-testid": "provider-2",
                  },
                  () => h("div", "hello")
                )
            );
        },
      })
    );

    const provider1 = container.querySelector('[data-testid="provider-1"]') as HTMLElement | null;
    const provider2 = container.querySelector('[data-testid="provider-2"]') as HTMLElement | null;
    expect(provider1?.classList.contains(defaultLightClass)).toBe(true);
    expect(provider2?.classList.contains(defaultLightClass)).toBe(true);

    matchMediaController.setActiveQueries(new Set([mediaQueryDark]));
    await nextTick();

    expect(provider1?.classList.contains(defaultDarkClass)).toBe(true);
    expect(provider2?.classList.contains(defaultDarkClass)).toBe(true);
    unmount();
  });
});
