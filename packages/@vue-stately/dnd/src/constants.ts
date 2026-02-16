import type { DropOperation } from "./types";

export interface IDropOperation {
  copy: boolean;
  move: boolean;
  link: boolean;
  none: boolean;
}

export enum DROP_OPERATION {
  none = "none",
  copy = "copy",
  move = "move",
  link = "link",
  copyMove = "copyMove",
  copyLink = "copyLink",
  linkMove = "linkMove",
  all = "all",
}

export const DROP_OPERATION_ALLOWED: Record<string, DropOperation[]> = {
  none: ["none"],
  copy: ["copy"],
  move: ["move"],
  link: ["link"],
  copyMove: ["copy", "move"],
  copyLink: ["copy", "link"],
  linkMove: ["link", "move"],
  all: ["copy", "link", "move", "none"],
};

export const EFFECT_ALLOWED: Record<string, DropOperation> = {
  none: "none",
  copy: "copy",
  move: "move",
  link: "link",
};

export const NATIVE_DRAG_TYPES = new Set(["text/plain", "text/uri-list", "text/html"]);
export const CUSTOM_DRAG_TYPE = "application/vnd.react-aria.items+json";
export const GENERIC_TYPE = "application/octet-stream";
