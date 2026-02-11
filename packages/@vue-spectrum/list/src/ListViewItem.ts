import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useGridListItem } from "@vue-aria/gridlist";
import type { UseListBoxStateResult } from "@vue-aria/listbox";
import type { Key } from "@vue-aria/types";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import type { NormalizedListViewItemData, SpectrumListViewSelectionMode } from "./types";

export interface SpectrumListViewItemProps {
  item?: NormalizedListViewItemData | undefined;
  state?: UseListBoxStateResult<NormalizedListViewItemData> | undefined;
  id?: Key | undefined;
  description?: string | undefined;
  textValue?: string | undefined;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
  selectionMode?: SpectrumListViewSelectionMode | undefined;
  onAction?: ((key: Key) => void) | undefined;
  density?: "compact" | "regular" | "spacious" | undefined;
  overflowMode?: "truncate" | "wrap" | undefined;
  UNSAFE_className?: string | undefined;
}

const FOCUSABLE_ROW_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"]):not([disabled])",
  "[contenteditable=\"true\"]",
].join(",");

const DISABLEABLE_ROW_CONTROL_SELECTOR = "button,input,select,textarea";
const ROW_DISABLED_ATTRIBUTE = "data-v-spectrum-listview-row-disabled";

function getFocusableRowElements(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>(FOCUSABLE_ROW_SELECTOR)).filter(
    (element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true"
  );
}

function getTextDirection(element: HTMLElement): "ltr" | "rtl" {
  const dirContainer = element.closest<HTMLElement>("[dir]");
  const direction =
    dirContainer?.getAttribute("dir") ??
    element.ownerDocument.documentElement.getAttribute("dir") ??
    "ltr";

  return direction.toLowerCase() === "rtl" ? "rtl" : "ltr";
}

function syncNestedDisabledState(row: HTMLElement | null, isDisabled: boolean): void {
  if (!row) {
    return;
  }

  const controls = Array.from(
    row.querySelectorAll<HTMLElement>(DISABLEABLE_ROW_CONTROL_SELECTOR)
  );
  for (const control of controls) {
    if (isDisabled) {
      if (!control.hasAttribute("disabled")) {
        control.setAttribute("disabled", "");
        control.setAttribute(ROW_DISABLED_ATTRIBUTE, "true");
      }
      continue;
    }

    if (control.getAttribute(ROW_DISABLED_ATTRIBUTE) === "true") {
      control.removeAttribute("disabled");
      control.removeAttribute(ROW_DISABLED_ATTRIBUTE);
    }
  }
}

export const ListViewItem = defineComponent({
  name: "ListViewItem",
  props: {
    item: {
      type: Object as PropType<NormalizedListViewItemData>,
      default: undefined,
    },
    state: {
      type: Object as PropType<UseListBoxStateResult<NormalizedListViewItemData>>,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<Key | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    textValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumListViewSelectionMode | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: Key) => void) | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<"compact" | "regular" | "spacious" | undefined>,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<"truncate" | "wrap" | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    if (!props.item || !props.state) {
      return () => null;
    }

    const rowRef = ref<HTMLElement | null>(null);
    const itemState = useGridListItem(
      {
        node: props.item!,
        isDisabled: props.item!.isDisabled,
        "aria-label": props.item!["aria-label"],
        isVirtualized: true,
        onAction: props.onAction,
      },
      props.state!,
      rowRef
    );

    const checkboxId = computed(() =>
      `v-spectrum-listview-checkbox-${String(props.item!.key)}`
    );

    const toVueRowProps = (rowProps: Record<string, unknown>): Record<string, unknown> => {
      const mapped = { ...rowProps };
      if ("onMouseDown" in mapped) {
        mapped.onMousedown = mapped.onMouseDown;
        delete mapped.onMouseDown;
      }
      if ("onMouseUp" in mapped) {
        mapped.onMouseup = mapped.onMouseUp;
        delete mapped.onMouseUp;
      }
      if ("onMouseEnter" in mapped) {
        mapped.onMouseenter = mapped.onMouseEnter;
        delete mapped.onMouseEnter;
      }
      if ("onMouseLeave" in mapped) {
        mapped.onMouseleave = mapped.onMouseLeave;
        delete mapped.onMouseLeave;
      }
      if ("onKeyDown" in mapped) {
        mapped.onKeydown = mapped.onKeyDown;
        delete mapped.onKeyDown;
      }
      if ("onKeyUp" in mapped) {
        mapped.onKeyup = mapped.onKeyUp;
        delete mapped.onKeyUp;
      }
      return mapped;
    };

    const syncRowChildrenState = () => {
      syncNestedDisabledState(rowRef.value, itemState.isDisabled.value);
    };

    onMounted(() => {
      void nextTick(() => {
        syncRowChildrenState();
      });
    });

    watch(
      () => itemState.isDisabled.value,
      () => {
        void nextTick(() => {
          syncRowChildrenState();
        });
      }
    );

    const onRowKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      const row = rowRef.value;
      if (!row) {
        return;
      }

      const activeElement = row.ownerDocument.activeElement;
      if (!(activeElement instanceof HTMLElement) || !row.contains(activeElement)) {
        return;
      }

      const focusables = getFocusableRowElements(row);
      if (focusables.length === 0) {
        return;
      }

      const isRtl = getTextDirection(row) === "rtl";
      const moveForward =
        event.key === (isRtl ? "ArrowLeft" : "ArrowRight");

      let nextFocusable: HTMLElement | null = null;

      if (activeElement === row) {
        nextFocusable = moveForward
          ? (focusables[0] ?? null)
          : (focusables[focusables.length - 1] ?? null);
      } else {
        const currentIndex = focusables.indexOf(activeElement);
        if (currentIndex < 0) {
          return;
        }

        const nextIndex = moveForward ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= 0 && nextIndex < focusables.length) {
          nextFocusable = focusables[nextIndex] ?? null;
        } else {
          nextFocusable = row;
        }
      }

      if (!nextFocusable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      nextFocusable.focus();
    };

    return () => {
      const selectionMode = props.selectionMode ?? "none";
      const rowProps = toVueRowProps(itemState.rowProps.value as Record<string, unknown>);
      const isSelected = itemState.isSelected.value;
      const isDisabled = itemState.isDisabled.value;
      const rowId = rowProps.id as string | undefined;

      const fallbackContent = [
        h(
          "span",
          {
            class: classNames("react-spectrum-ListView-itemLabel"),
          },
          props.item!.label
        ),
        props.item!.description
          ? h(
            "span",
            mergeProps(itemState.descriptionProps.value, {
              class: classNames("react-spectrum-ListView-itemDescription"),
            }),
            props.item!.description
          )
          : null,
      ];

      return h(
        "div",
        mergeProps(rowProps, {
          ref: (value: unknown) => {
            rowRef.value = value as HTMLElement | null;
            syncNestedDisabledState(rowRef.value, isDisabled);
          },
          class: classNames(
            "react-spectrum-ListView-item",
            `react-spectrum-ListView-item--${props.density ?? "regular"}`,
            {
              "is-focused": itemState.isFocused.value,
              "is-selected": isSelected,
              "is-disabled": isDisabled,
              "react-spectrum-ListView-item--truncate":
                (props.overflowMode ?? "truncate") === "truncate",
              "react-spectrum-ListView-item--wrap":
                (props.overflowMode ?? "truncate") === "wrap",
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          "aria-label": props.item!.label,
          onKeydown: onRowKeydown,
        }),
        [
          h(
            "div",
            mergeProps(itemState.gridCellProps.value, {
              class: classNames("react-spectrum-ListView-itemCell"),
            }),
            [
              selectionMode === "none"
                ? null
                : h("input", {
                  id: checkboxId.value,
                  type: "checkbox",
                  role: "checkbox",
                  checked: isSelected,
                  disabled: isDisabled,
                  tabindex: -1,
                  "aria-labelledby": rowId
                    ? `${checkboxId.value} ${rowId}`
                    : checkboxId.value,
                  "aria-label": "select",
                  class: classNames("react-spectrum-ListView-itemCheckbox"),
                  onClick: (event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  },
                }),
              slots.default?.({ item: props.item! }) ?? fallbackContent,
            ]
          ),
        ]
      );
    };
  },
});
