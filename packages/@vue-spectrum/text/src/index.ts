import { defineComponent, h } from "vue";

export interface TextProps {
  as?: keyof HTMLElementTagNameMap;
  children?: unknown;
}

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: unknown;
}

export interface KeyboardProps {
  children?: unknown;
}

const resolveContent = (content: unknown) => (Array.isArray(content) ? content : [content]);

export const Text = defineComponent({
  name: "SpectrumText",
  props: {
    as: {
      type: String as () => keyof HTMLElementTagNameMap,
      required: false,
      default: "span",
    },
    children: {
      type: null as unknown as () => unknown,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        props.as,
        {
          ...attrs,
          class: ["spectrum-Text", attrs.class],
        },
        slots.default ? slots.default() : resolveContent(props.children)
      );
  },
});

export const Heading = defineComponent({
  name: "SpectrumHeading",
  props: {
    level: {
      type: Number as () => HeadingProps["level"],
      required: false,
      default: 1,
    },
    children: {
      type: null as unknown as () => unknown,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const Tag = `h${Math.max(1, Math.min(6, props.level ?? 1))}`;
    return () =>
      h(
        Tag,
        {
          ...attrs,
          class: ["spectrum-Heading", attrs.class],
        },
        slots.default ? slots.default() : resolveContent(props.children)
      );
  },
});

export const Keyboard = defineComponent({
  name: "SpectrumKeyboard",
  setup(_, { slots, attrs }) {
    return () =>
      h(
        "kbd",
        {
          ...attrs,
          class: ["spectrum-Keyboard", attrs.class],
        },
        slots.default ? slots.default() : []
      );
  },
});
