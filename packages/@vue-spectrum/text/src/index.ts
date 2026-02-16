import { h } from "vue";

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

export const Text = (props: TextProps, { slots, attrs }) =>
  h(
    props.as ?? "span",
    {
      ...attrs,
      class: ["spectrum-Text", attrs.class],
    },
    slots.default ? slots.default() : resolveContent(props.children)
  );

export const Heading = (props: HeadingProps & Record<string, unknown>, { slots, attrs }) => {
  const level = (props.level as HeadingProps["level"]) ?? 1;
  const Tag = `h${Math.max(1, Math.min(6, level))}`;
  return h(
    Tag,
    {
      ...attrs,
      class: ["spectrum-Heading", attrs.class],
    },
    slots.default ? slots.default() : resolveContent((props as { children?: unknown }).children)
  );
};

export const Keyboard = (_props: KeyboardProps, { slots, attrs }) =>
  h(
    "kbd",
    {
      ...attrs,
      class: ["spectrum-Keyboard", attrs.class],
    },
    slots.default ? slots.default() : []
  );
