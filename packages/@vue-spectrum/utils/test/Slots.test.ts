import { mount } from "@vue/test-utils";
import { computed, defineComponent, h, type PropType } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useId } from "@vue-aria/ssr";
import {
  ClearSlots,
  SlotProvider,
  cssModuleToSlots,
  useSlotProps,
} from "../src";

interface ConsumerProps {
  slot?: string;
  id?: string;
  label?: string | null;
  isDisabled?: boolean;
  isQuiet?: boolean;
  UNSAFE_className?: string;
  onPress?: () => void;
}

const TestConsumer = defineComponent({
  name: "TestConsumer",
  props: {
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | null | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const resolvedProps = computed(() =>
      useSlotProps(
        props as unknown as ConsumerProps & Record<string, unknown>,
        "slotname"
      )
    );

    return () =>
      h(
        "button",
        {
          "data-testid": "slot-consumer",
          onClick: resolvedProps.value.onPress,
          "data-id": resolvedProps.value.id,
          "data-label":
            resolvedProps.value.label === null
              ? "null"
              : resolvedProps.value.label,
          "data-class": resolvedProps.value.UNSAFE_className,
          "data-disabled":
            resolvedProps.value.isDisabled === undefined
              ? undefined
              : String(Boolean(resolvedProps.value.isDisabled)),
          "data-quiet":
            resolvedProps.value.isQuiet === undefined
              ? undefined
              : String(Boolean(resolvedProps.value.isQuiet)),
        },
        "push me"
      );
  },
});

const TestConsumerWithUseId = defineComponent({
  name: "TestConsumerWithUseId",
  props: {
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const resolvedProps = computed(() =>
      useSlotProps(
        props as unknown as ConsumerProps & Record<string, unknown>,
        "slotname"
      )
    );
    const resolvedId = useId(computed(() => resolvedProps.value.id));

    return () =>
      h(
        "button",
        {
          "data-testid": "slot-consumer-useid",
          id: resolvedId.value,
        },
        "push me"
      );
  },
});

describe("Slots", () => {
  it("sets slot props from context", () => {
    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: { UNSAFE_className: "foo", isDisabled: true, isQuiet: true },
        },
      },
      slots: {
        default: () => h(TestConsumer),
      },
    });

    const consumer = wrapper.get('[data-testid="slot-consumer"]');
    expect(consumer.attributes("data-class")).toBe("foo");
    expect(consumer.attributes("data-disabled")).toBe("true");
    expect(consumer.attributes("data-quiet")).toBe("true");
  });

  it("slot props override local props while merging UNSAFE_className", () => {
    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: {
            UNSAFE_className: "foo",
            isDisabled: false,
            isQuiet: false,
            label: null,
          },
        },
      },
      slots: {
        default: () =>
          h(TestConsumer, {
            UNSAFE_className: "bar",
            isDisabled: true,
            isQuiet: true,
            label: "boop",
          }),
      },
    });

    const consumer = wrapper.get('[data-testid="slot-consumer"]');
    expect(consumer.attributes("data-class")).toMatch(/foo|bar/);
    expect(consumer.attributes("data-class")).toContain("foo");
    expect(consumer.attributes("data-class")).toContain("bar");
    expect(consumer.attributes("data-disabled")).toBe("false");
    expect(consumer.attributes("data-quiet")).toBe("false");
    expect(consumer.attributes("data-label")).toBe("null");
  });

  it("does not let undefined slot values override local props", () => {
    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: {
            label: undefined,
          },
        },
      },
      slots: {
        default: () =>
          h(TestConsumer, {
            label: "boop",
          }),
      },
    });

    expect(wrapper.get('[data-testid="slot-consumer"]').attributes("data-label")).toBe(
      "boop"
    );
  });

  it("chains local and slot event handlers", async () => {
    const slotPress = vi.fn();
    const localPress = vi.fn();

    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: {
            onPress: slotPress,
          },
        },
      },
      slots: {
        default: () =>
          h(TestConsumer, {
            onPress: localPress,
          }),
      },
    });

    await wrapper.get('[data-testid="slot-consumer"]').trigger("click");

    expect(slotPress).toHaveBeenCalledTimes(1);
    expect(localPress).toHaveBeenCalledTimes(1);
  });

  it("keeps user-provided ids", () => {
    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: {
            id: "foo",
          },
        },
      },
      slots: {
        default: () => h(TestConsumer, { id: "bar" }),
      },
    });

    expect(wrapper.get('[data-testid="slot-consumer"]').attributes("data-id")).toBe("bar");
  });

  it("keeps user-provided ids when slot id is generated via useId with a default", () => {
    const App = defineComponent({
      setup() {
        const slotId = useId("foo");

        return () =>
          h(
            SlotProvider,
            {
              slots: {
                slotname: {
                  id: slotId.value,
                },
              },
            },
            {
              default: () => h(TestConsumerWithUseId, { id: "bar" }),
            }
          );
      },
    });

    const wrapper = mount(App);
    const consumer = wrapper.get('[data-testid="slot-consumer-useid"]');

    expect(consumer.attributes("id")).toBe("bar");
  });

  it("keeps user-provided ids when slot id is generated via useId", () => {
    const App = defineComponent({
      setup() {
        const slotId = useId();

        return () =>
          h(
            SlotProvider,
            {
              slots: {
                slotname: {
                  id: slotId.value,
                },
              },
            },
            {
              default: () => h(TestConsumerWithUseId, { id: "bar" }),
            }
          );
      },
    });

    const wrapper = mount(App);
    const consumer = wrapper.get('[data-testid="slot-consumer-useid"]');

    expect(consumer.attributes("id")).toBe("bar");
  });

  it("clears slots for nested consumers", () => {
    const wrapper = mount(SlotProvider, {
      props: {
        slots: {
          slotname: {
            label: "from-provider",
          },
        },
      },
      slots: {
        default: () =>
          h(ClearSlots, null, {
            default: () =>
              h(TestConsumer, {
                label: "local",
              }),
          }),
      },
    });

    expect(wrapper.get('[data-testid="slot-consumer"]').attributes("data-label")).toBe(
      "local"
    );
  });

  it("maps css modules into slot class objects", () => {
    expect(
      cssModuleToSlots({
        icon: "icon-class",
        label: "label-class",
      })
    ).toEqual({
      icon: { UNSAFE_className: "icon-class" },
      label: { UNSAFE_className: "label-class" },
    });
  });
});
