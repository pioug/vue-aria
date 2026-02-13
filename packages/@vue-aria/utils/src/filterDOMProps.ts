export interface FilterDOMPropsOptions {
  labelable?: boolean;
}

const DOM_PROP_NAMES = new Set([
  "id",
  "role",
  "title",
  "lang",
  "dir",
  "hidden",
  "class",
  "style",
  "slot",
  "tabIndex",
  "tabindex",
  "href",
  "target",
  "rel",
  "download",
  "type",
  "name",
  "value",
  "form",
  "disabled",
  "required",
  "readOnly",
  "readonly",
  "placeholder",
  "autoComplete",
  "autocomplete",
  "autoFocus",
  "autofocus",
  "autoCorrect",
  "autocorrect",
  "spellCheck",
  "spellcheck",
  "inputMode",
  "inputmode",
  "enterKeyHint",
  "enterkeyhint",
  "min",
  "max",
  "step",
  "pattern",
  "multiple",
  "size",
  "rows",
  "cols",
  "rowSpan",
  "colSpan",
  "width",
  "height",
  "accept",
  "capture",
  "maxLength",
  "minLength",
]);

const LABELABLE_ARIA = new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details",
]);

export function filterDOMProps(
  props: Record<string, unknown>,
  options: FilterDOMPropsOptions = {}
): Record<string, unknown> {
  const labelable = options.labelable ?? true;
  const domProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) {
      continue;
    }

    if (key.startsWith("data-")) {
      domProps[key] = value;
      continue;
    }

    if (key.startsWith("aria-")) {
      if (!labelable && LABELABLE_ARIA.has(key)) {
        continue;
      }
      domProps[key] = value;
      continue;
    }

    if (DOM_PROP_NAMES.has(key)) {
      domProps[key] = value;
    }
  }

  return domProps;
}
