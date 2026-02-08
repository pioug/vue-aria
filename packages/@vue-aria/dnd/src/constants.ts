export interface IDropOperation {
  readonly none: 0;
  readonly cancel: 0;
  readonly move: number;
  readonly copy: number;
  readonly link: number;
  readonly all: number;
}

export enum DROP_OPERATION {
  none = 0,
  cancel = 0,
  move = 1 << 0,
  copy = 1 << 1,
  link = 1 << 2,
  all = move | copy | link,
}

interface DropOperationAllowed extends IDropOperation {
  readonly copyMove: number;
  readonly copyLink: number;
  readonly linkMove: number;
  readonly all: number;
  readonly uninitialized: number;
}

export const DROP_OPERATION_ALLOWED: DropOperationAllowed = {
  ...DROP_OPERATION,
  copyMove: DROP_OPERATION.copy | DROP_OPERATION.move,
  copyLink: DROP_OPERATION.copy | DROP_OPERATION.link,
  linkMove: DROP_OPERATION.link | DROP_OPERATION.move,
  all: DROP_OPERATION.all,
  uninitialized: DROP_OPERATION.all,
};

interface EffectAllowed {
  0: "none" | "cancel";
  1: "move";
  2: "copy";
  3: "copyMove";
  4: "link";
  5: "linkMove";
  6: "copyLink";
  7: "all";
}

type DropEffect = "none" | "link" | "copy" | "move";
type DropOperation = "cancel" | "link" | "copy" | "move";

export const DROP_EFFECT_TO_DROP_OPERATION: Record<DropEffect, DropOperation> = {
  none: "cancel",
  link: "link",
  copy: "copy",
  move: "move",
};

function invert<T extends string | number, C extends string | number>(
  object: Record<T, C>
): Record<C, T> {
  const result = {} as Record<C, T>;
  for (const key in object) {
    result[object[key]] = key as T;
  }

  return result;
}

export const EFFECT_ALLOWED: EffectAllowed =
  invert(DROP_OPERATION_ALLOWED) as unknown as EffectAllowed;
EFFECT_ALLOWED[DROP_OPERATION.all] = "all";

export const DROP_OPERATION_TO_DROP_EFFECT: Record<DropOperation, DropEffect> =
  invert(DROP_EFFECT_TO_DROP_OPERATION);

export const NATIVE_DRAG_TYPES: Set<string> = new Set([
  "text/plain",
  "text/uri-list",
  "text/html",
]);
export const CUSTOM_DRAG_TYPE = "application/vnd.react-aria.items+json";
export const GENERIC_TYPE = "application/octet-stream";
