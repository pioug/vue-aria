import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

export type Key = string | number;

export interface CollectionElement<T> {
  [key: string]: unknown;
}

export type ItemElement<T> = CollectionElement<T> | null;
export type SectionElement<T> = CollectionElement<T> | null;
export type CollectionChildren<T> =
  | CollectionElement<T>
  | CollectionElement<T>[]
  | ((item: T) => CollectionElement<T>)
  | null;

export interface CollectionBase<T> {
  children: CollectionChildren<T>;
  items?: Iterable<T>;
  disabledKeys?: Iterable<Key>;
}

export interface Collection<T> extends Iterable<T> {
  readonly size: number;
  getKeys(): Iterable<Key>;
  getItem(key: Key): T | null;
  at(idx: number): T | null;
  getKeyBefore(key: Key): Key | null;
  getKeyAfter(key: Key): Key | null;
  getFirstKey(): Key | null;
  getLastKey(): Key | null;
  getChildren?(key: Key): Iterable<T>;
  getTextValue?(key: Key): string;
  filter?(filterFn: (nodeValue: string, node: T) => boolean): Collection<T>;
}

export interface Node<T> {
  type: string;
  key: Key;
  value: T | null;
  level: number;
  hasChildNodes: boolean;
  childNodes: Iterable<Node<T>>;
  rendered: unknown;
  textValue: string;
  "aria-label"?: string;
  index: number;
  wrapper?: (element: unknown) => unknown;
  parentKey?: Key | null;
  prevKey?: Key | null;
  nextKey?: Key | null;
  props?: Record<string, unknown>;
  shouldInvalidate?: (context: Record<string, unknown>) => boolean;
}

export interface SelectionBase {
  disallowEmptySelection?: boolean;
  disabledKeys?: Iterable<Key>;
}

export interface DOMProps {
  [key: string]: unknown;
}

export interface AriaLabelingProps extends DOMProps {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export interface StyleProps {
  [key: string]: unknown;
}

export type ItemRenderer<T> = (item: T) => ItemElement<T>;

export type Orientation = "horizontal" | "vertical";

export type Alignment = "start" | "center" | "end";

export interface PressEvents {
  onPress?: () => void;
  onPressStart?: () => void;
  onPressChange?: () => void;
  onPressEnd?: () => void;
}

export interface AsyncLoadable {
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export interface FocusableProps {
  autoFocus?: boolean;
  isDisabled?: boolean;
}

export interface FocusableDOMProps extends FocusableProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface FocusEvents {
  onFocus?: () => void;
  onBlur?: () => void;
  onFocusChange?: (isFocused: boolean) => void;
}

export interface ValueBase<T = unknown, U = unknown> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  // Optional alternate value representation retained for parity with React Spectrum generics.
  readonly valueRef?: U;
}

export type ValidationState = "valid" | "invalid";
export type ValidationErrors = Array<string> | Record<string, string | string[]>;
export interface Validation<T = unknown> {
  validationState?: ValidationState;
  isInvalid?: boolean;
  validate?: (value?: T) => ValidationErrors;
}

export interface SpectrumHelpTextProps {
  description?: string;
  errorMessage?: string;
}

export interface SpectrumFieldValidation<T = unknown> extends Validation<T> {}

export interface InputBase {
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
}

export interface TextInputBase {
  placeholder?: string;
}

export interface InputDOMProps {
  disabled?: boolean;
  name?: string;
  autoComplete?: string;
  placeholder?: string;
}

export type LoadingState = "loading" | "sorting" | "loadingMore" | "error" | "idle" | "filtering";

export interface TextInputDOMProps extends InputDOMProps {
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  type?: string;
  inputMode?: string;
  autoCorrect?: string;
  spellCheck?: string | boolean;
}

export interface HelpTextProps {
  "aria-describedby"?: string;
  description?: string;
}

export interface LabelableProps {
  label?: string;
  labelPosition?: "side" | "top";
}

export interface SpectrumHelpTextProps extends HelpTextProps {}

export interface SpectrumLabelableProps extends LabelableProps {}

export interface AriaValidationProps {
  "aria-invalid"?: boolean | "true" | "false";
}

export interface LinkDOMProps {
  href?: Href;
}

export type Href = string | URL;

export interface SpectrumLabelableProps extends DOMProps {
  label?: string;
  placeholder?: string;
}

export interface SpectrumTextInputBase extends DOMProps {}

export interface RouterOptions {
  navigate?: (to: string) => void;
}

export interface Sortable {
  onSortChange?: (key: string) => void;
}

export interface ColorVersion {
  version?: "light" | "dark";
}

export interface ViewStyleProps extends StyleProps {}

export interface FlexStyleProps extends StyleProps {}

export interface GridStyleProps extends StyleProps {}

export type DimensionValue = number | string;

export type RangeValue<T extends number = number> = {
  start: T;
  end: T;
};

export interface ItemProps<T> {
  children?: ItemElement<T>;
  title?: ItemElement<T>;
}

export interface Expandable {
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
}

export interface RefObject<T = unknown> {
  current: T | null;
}

export interface ValidationResult {
  ok: boolean;
}

export type LabelPosition = "top" | "side";

export type NecessityIndicator = "icon" | "label";

export type Direction = "horizontal" | "vertical";

export interface SingleSelection extends SelectionBase {
  selectedKey?: Key | null;
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key | null) => void;
}

export interface MultipleSelection extends SelectionBase {
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: "all" | Iterable<Key>;
  defaultSelectedKeys?: "all" | Iterable<Key>;
  onSelectionChange?: (keys: Selection) => void;
}

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";
export type Selection = "all" | Set<Key>;

export interface SpectrumSelectionProps {
  selectionStyle?: "checkbox" | "highlight";
}

export type FocusStrategy = "first" | "last";
export type DisabledBehavior = "selection" | "all";

export type DropOperation = "copy" | "link" | "move" | "cancel" | "none";
export type DropPosition = "on" | "before" | "after";

export interface DragItem {
  [type: string]: string;
}

export interface TextDropItem {
  kind: "text";
  types: Set<string>;
}

export interface FileDropItem {
  kind: "file";
  type: string;
  name: string;
}

export interface DirectoryDropItem {
  kind: "directory";
  name: string;
}

export type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;

export interface RootDropTarget {
  type: "root";
  id?: Key;
}

export interface ItemDropTarget {
  type: "item";
  key: Key;
  dropPosition: DropPosition;
}

export type DropTarget = RootDropTarget | ItemDropTarget;

export interface DragTypes {
  toArray(): string[];
  has?(type: string | symbol): boolean;
}

export interface DroppableCollectionMoveEvent {
  target: DropTarget;
}

export interface DraggableCollectionProps {
  getItems(keys: Set<Key>, items: unknown[]): unknown[];
  isDisabled?: boolean;
  onDragStart?: (e: DraggableCollectionStartEvent) => void;
  onDragMove?: (e: DraggableCollectionMoveEvent) => void;
  onDragEnd?: (e: DraggableCollectionEndEvent) => void;
}

export type MaybeReactive<T> = MaybeRefOrGetter<T>;

export type ReadonlyRef<T> = Readonly<Ref<T>> | Readonly<ComputedRef<T>>;

export interface DraggableCollectionStartEvent {
  keys: Set<Key>;
}

export interface DraggableCollectionMoveEvent {
  keys: Set<Key>;
}

export interface DraggableCollectionEndEvent {
  keys: Set<Key>;
  dropOperation?: DropOperation;
}

export interface DroppableCollectionProps {
  acceptedDragTypes?: "all" | Array<string | symbol>;
  onInsert?: (e: { items: DropItem[]; target: ItemDropTarget }) => void;
  onRootDrop?: (e: { items: DropItem[]; dropOperation: DropOperation }) => void;
  onItemDrop?: (e: { items: DropItem[]; isInternal: boolean; target: ItemDropTarget; dropOperation: DropOperation }) => void;
  onReorder?: (e: { keys: Set<Key>; target: ItemDropTarget; dropOperation: DropOperation }) => void;
  onMove?: (e: { keys: Set<Key>; target: ItemDropTarget; dropOperation: DropOperation }) => void;
  shouldAcceptItemDrop?: (target: ItemDropTarget, types: DragTypes) => boolean;
  onDropEnter?: (e: { target: DropTarget }) => void;
  onDropExit?: (e: { target: DropTarget }) => void;
  onDrop?: (e: { target: DropTarget; items: DropItem[] }) => void;
  getDropOperation?: (target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation;
}
