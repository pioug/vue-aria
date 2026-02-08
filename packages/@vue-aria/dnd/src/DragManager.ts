import { shallowRef, toValue } from "vue";
import { announce } from "@vue-aria/live-announcer";
import { nodeContains } from "@vue-aria/utils";
import { hideOthers, inertOthers, supportsInert } from "aria-hidden";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  DropItem,
  DropOperation,
  DropTarget,
  DragTypes,
} from "./types";
import { getTypes } from "./utils";

export interface DragTargetSession {
  element?: unknown;
  items: Array<Record<string, string>>;
  allowedDropOperations: DropOperation[];
  onDragEnd?: (event: {
    type: "dragend";
    x: number;
    y: number;
    dropOperation: DropOperation;
  }) => void;
}

export interface DragSession {
  dragTarget?: DragTargetSession;
  validDropTargets?: RegisteredDropTarget[];
  currentDropTarget?: RegisteredDropTarget | null;
  currentDropItem?: RegisteredDropItem | null;
  dropOperation?: DropOperation | null;
  [key: string]: unknown;
}

export interface RegisteredDropTarget {
  element: HTMLElement;
  preventFocusOnDrop?: boolean;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
  getDropOperation?: (
    types: Set<string> | DragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  onDropEnter?: (
    event: { type: "dropenter"; x: number; y: number },
    dragTarget: DragTargetSession
  ) => void;
  onDropExit?: (event: { type: "dropexit"; x: number; y: number }) => void;
  onDropTargetEnter?: (target: DropTarget | null) => void;
  onDropActivate?: (
    event: { type: "dropactivate"; x: number; y: number },
    target: DropTarget | null
  ) => void;
  onDrop?: (
    event: { type: "drop"; x: number; y: number; items: DropItem[]; dropOperation: DropOperation },
    target: DropTarget | null
  ) => void;
  onKeyDown?: (event: KeyboardEvent, dragTarget: DragTargetSession) => void;
}

export interface RegisteredDropItem {
  element: HTMLElement;
  target: DropTarget;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
  getDropOperation?: (
    types: Set<string> | DragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
}

const dragSession = shallowRef<DragSession | null>(null);
const dropTargets = new Map<HTMLElement, RegisteredDropTarget>();
const dropItems = new Map<HTMLElement, RegisteredDropItem>();
let cleanupActiveSession: (() => void) | null = null;

interface ManagedDragSession extends DragSession {
  dragTarget: DragTargetSession;
  validDropTargets: RegisteredDropTarget[];
  currentDropTarget: RegisteredDropTarget | null;
  currentDropItem: RegisteredDropItem | null;
  dropOperation: DropOperation | null;
  restoreAriaHidden: (() => void) | null;
}

function isManagedDragSession(session: DragSession | null): session is ManagedDragSession {
  return (
    session != null &&
    session.dragTarget != null &&
    Array.isArray(session.validDropTargets)
  );
}

function getCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function isHiddenFromAccessibility(element: HTMLElement): boolean {
  return Boolean(element.closest('[aria-hidden="true"], [inert]'));
}

function toDropItems(items: Array<Record<string, string>>): DropItem[] {
  return items.map((item) => ({
    kind: "text",
    types: new Set(Object.keys(item)),
    getText: (type: string) => Promise.resolve(item[type]),
  }));
}

function resolveActivateButtonRef(
  elementRef?: MaybeReactive<HTMLElement | null | undefined>
): HTMLElement | null {
  if (elementRef == null) {
    return null;
  }

  return toValue(elementRef) ?? null;
}

function setCurrentDropTarget(
  session: ManagedDragSession,
  target: RegisteredDropTarget | null,
  item?: RegisteredDropItem
): void {
  if (session.currentDropTarget !== target) {
    if (session.currentDropTarget?.onDropExit) {
      const { x, y } = getCenter(session.currentDropTarget.element);
      session.currentDropTarget.onDropExit({
        type: "dropexit",
        x,
        y,
      });
    }

    session.currentDropTarget = target;
    session.currentDropItem = null;

    if (target?.onDropEnter) {
      const { x, y } = getCenter(target.element);
      target.onDropEnter(
        {
          type: "dropenter",
          x,
          y,
        },
        session.dragTarget
      );
    }

    if (target) {
      target.element.focus();
    }
  }

  const nextItem =
    target && item == null ? getValidDropItemsForTarget(session, target)[0] : item;
  if (nextItem != null && nextItem !== session.currentDropItem) {
    session.currentDropTarget?.onDropTargetEnter?.(nextItem.target);
    nextItem.element.focus();
    session.currentDropItem = nextItem;
  }
}

function getVisibleDropItems(session: ManagedDragSession): RegisteredDropItem[] {
  const types = getTypes(session.dragTarget.items);
  return Array.from(dropItems.values()).filter((item) => {
    if (isHiddenFromAccessibility(item.element)) {
      return false;
    }

    const inValidTarget = session.validDropTargets.some((target) =>
      nodeContains(target.element, item.element)
    );
    if (!inValidTarget) {
      return false;
    }

    if (typeof item.getDropOperation === "function") {
      return (
        item.getDropOperation(types, session.dragTarget.allowedDropOperations) !==
        "cancel"
      );
    }

    return true;
  });
}

function hideOutside(session: ManagedDragSession): void {
  session.restoreAriaHidden?.();

  const visibleElements: Element[] = [];
  if (session.dragTarget.element instanceof Element) {
    visibleElements.push(session.dragTarget.element);
  }

  const visibleDropItems = getVisibleDropItems(session);
  for (const item of visibleDropItems) {
    visibleElements.push(item.element);
    const activateButton = resolveActivateButtonRef(item.activateButtonRef);
    if (activateButton) {
      visibleElements.push(activateButton);
    }
  }

  const visibleDropTargets = session.validDropTargets.filter((target) =>
    !visibleDropItems.some((item) => nodeContains(target.element, item.element))
  );
  for (const target of visibleDropTargets) {
    visibleElements.push(target.element);
    const activateButton = resolveActivateButtonRef(target.activateButtonRef);
    if (activateButton) {
      visibleElements.push(activateButton);
    }
  }

  if (visibleElements.length === 0) {
    session.restoreAriaHidden = null;
    return;
  }

  session.restoreAriaHidden = supportsInert()
    ? inertOthers(visibleElements)
    : hideOthers(visibleElements);
}

function updateValidDropTargets(session: ManagedDragSession): void {
  const types = getTypes(session.dragTarget.items);
  session.validDropTargets = Array.from(dropTargets.values()).filter((target) => {
    if (isHiddenFromAccessibility(target.element)) {
      return false;
    }

    if (typeof target.getDropOperation === "function") {
      return (
        target.getDropOperation(types, session.dragTarget.allowedDropOperations) !==
        "cancel"
      );
    }

    return true;
  });

  if (
    session.currentDropTarget &&
    !session.validDropTargets.includes(session.currentDropTarget)
  ) {
    setCurrentDropTarget(session, session.validDropTargets[0] ?? null);
  }

  hideOutside(session);
}

function moveToRelativeDropTarget(session: ManagedDragSession, step: 1 | -1): void {
  if (session.validDropTargets.length === 0) {
    setCurrentDropTarget(session, null);
    return;
  }

  if (!session.currentDropTarget) {
    const target =
      step > 0
        ? session.validDropTargets[0]
        : session.validDropTargets[session.validDropTargets.length - 1];
    setCurrentDropTarget(session, target ?? null);
    return;
  }

  const currentIndex = session.validDropTargets.indexOf(session.currentDropTarget);
  if (currentIndex < 0) {
    const target =
      step > 0
        ? session.validDropTargets[0]
        : session.validDropTargets[session.validDropTargets.length - 1];
    setCurrentDropTarget(session, target ?? null);
    return;
  }

  const nextIndex =
    (currentIndex + step + session.validDropTargets.length) %
    session.validDropTargets.length;
  setCurrentDropTarget(session, session.validDropTargets[nextIndex] ?? null);
}

function resolveDropOperation(
  session: ManagedDragSession,
  item?: RegisteredDropItem
): DropOperation {
  const types = getTypes(session.dragTarget.items);

  if (typeof item?.getDropOperation === "function") {
    return item.getDropOperation(types, session.dragTarget.allowedDropOperations);
  }

  if (typeof session.currentDropTarget?.getDropOperation === "function") {
    return session.currentDropTarget.getDropOperation(
      types,
      session.dragTarget.allowedDropOperations
    );
  }

  return session.dragTarget.allowedDropOperations[0] ?? "cancel";
}

function getValidDropItemsForTarget(
  session: ManagedDragSession,
  target: RegisteredDropTarget
): RegisteredDropItem[] {
  const types = getTypes(session.dragTarget.items);
  return Array.from(dropItems.values()).filter((item) => {
    if (!nodeContains(target.element, item.element)) {
      return false;
    }

    if (isHiddenFromAccessibility(item.element)) {
      return false;
    }

    if (typeof item.getDropOperation === "function") {
      return (
        item.getDropOperation(types, session.dragTarget.allowedDropOperations) !==
        "cancel"
      );
    }

    return true;
  });
}

function activateManagedSession(session: ManagedDragSession): void {
  const target = session.currentDropTarget;
  if (!target || typeof target.onDropActivate !== "function") {
    return;
  }

  const { x, y } = getCenter(target.element);
  target.onDropActivate(
    {
      type: "dropactivate",
      x,
      y,
    },
    session.currentDropItem?.target ?? null
  );
}

function getCurrentActivateButton(session: ManagedDragSession): HTMLElement | null {
  return (
    resolveActivateButtonRef(session.currentDropItem?.activateButtonRef) ??
    resolveActivateButtonRef(session.currentDropTarget?.activateButtonRef)
  );
}

function teardownManagedSession(): void {
  cleanupActiveSession?.();
  cleanupActiveSession = null;
}

function endManagedSession(session: ManagedDragSession, focusElement: HTMLElement | null): void {
  setCurrentDropTarget(session, null);
  session.restoreAriaHidden?.();
  session.restoreAriaHidden = null;
  teardownManagedSession();
  dragSession.value = null;

  const onDragEnd = session.dragTarget.onDragEnd;
  if (typeof onDragEnd === "function") {
    if (focusElement) {
      const { x, y } = getCenter(focusElement);
      onDragEnd({
        type: "dragend",
        x,
        y,
        dropOperation: session.dropOperation ?? "cancel",
      });
    } else {
      onDragEnd({
        type: "dragend",
        x: 0,
        y: 0,
        dropOperation: session.dropOperation ?? "cancel",
      });
    }
  }
}

function cancelManagedSession(session: ManagedDragSession): void {
  session.dropOperation = "cancel";
  const dragElement =
    session.dragTarget.element instanceof HTMLElement ? session.dragTarget.element : null;
  endManagedSession(session, dragElement);
  if (dragElement && !isHiddenFromAccessibility(dragElement)) {
    dragElement.focus();
  }
  announce("Drop canceled.");
}

function dropManagedSession(session: ManagedDragSession): void {
  const target = session.currentDropTarget;
  if (!target) {
    cancelManagedSession(session);
    return;
  }

  const item = session.currentDropItem ?? undefined;
  const dropOperation = resolveDropOperation(session, item);
  session.dropOperation = dropOperation;

  if (typeof target.onDrop === "function") {
    const { x, y } = getCenter(target.element);
    target.onDrop(
      {
        type: "drop",
        x,
        y,
        items: toDropItems(session.dragTarget.items),
        dropOperation,
      },
      item?.target ?? null
    );
  }

  endManagedSession(session, target.element);
  announce("Drop complete.");
}

function handleManagedKeyDown(event: KeyboardEvent): void {
  const session = dragSession.value;
  if (!isManagedDragSession(session)) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    cancelManagedSession(session);
    return;
  }

  if (event.key === "Tab" && !event.metaKey && !event.altKey && !event.ctrlKey) {
    event.preventDefault();
    event.stopPropagation();
    moveToRelativeDropTarget(session, event.shiftKey ? -1 : 1);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();

    const activateButton = getCurrentActivateButton(session);
    if (event.altKey || (activateButton && nodeContains(activateButton, event.target))) {
      activateManagedSession(session);
      return;
    }

    dropManagedSession(session);
    return;
  }

  session.currentDropTarget?.onKeyDown?.(event, session.dragTarget);
}

export function beginDragging(session: DragSession = {}): void {
  if (dragSession.value != null) {
    throw new Error("Cannot begin dragging while already dragging");
  }

  if (session.dragTarget) {
    const managedSession: ManagedDragSession = {
      ...session,
      dragTarget: session.dragTarget,
      validDropTargets: [],
      currentDropTarget: null,
      currentDropItem: null,
      dropOperation: null,
      restoreAriaHidden: null,
    };

    dragSession.value = managedSession;
    updateValidDropTargets(managedSession);
    if (managedSession.validDropTargets.length > 0) {
      setCurrentDropTarget(managedSession, managedSession.validDropTargets[0] ?? null);
    }

    document.addEventListener("keydown", handleManagedKeyDown, true);
    cleanupActiveSession = () => {
      document.removeEventListener("keydown", handleManagedKeyDown, true);
    };

    announce("Drag started.");
    return;
  }

  dragSession.value = session;
}

export function endDragging(): void {
  if (isManagedDragSession(dragSession.value)) {
    dragSession.value.restoreAriaHidden?.();
    dragSession.value.restoreAriaHidden = null;
  }
  teardownManagedSession();
  dragSession.value = null;
}

export function useDragSession(): ReadonlyRef<DragSession | null> {
  return dragSession as ReadonlyRef<DragSession | null>;
}

export function isVirtualDragging(): boolean {
  return dragSession.value != null;
}

export function registerDropTarget(target: RegisteredDropTarget): () => void {
  dropTargets.set(target.element, target);
  if (isManagedDragSession(dragSession.value)) {
    updateValidDropTargets(dragSession.value);
  }

  return () => {
    dropTargets.delete(target.element);
    if (isManagedDragSession(dragSession.value)) {
      updateValidDropTargets(dragSession.value);
    }
  };
}

export function registerDropItem(item: RegisteredDropItem): () => void {
  dropItems.set(item.element, item);
  return () => {
    dropItems.delete(item.element);
  };
}

export function getRegisteredDropTargets(): ReadonlyMap<HTMLElement, RegisteredDropTarget> {
  return dropTargets;
}

export function getRegisteredDropItems(): ReadonlyMap<HTMLElement, RegisteredDropItem> {
  return dropItems;
}

export function isValidDropTarget(element: Element): boolean {
  for (const target of dropTargets.keys()) {
    if (nodeContains(target, element)) {
      return true;
    }
  }

  return false;
}
