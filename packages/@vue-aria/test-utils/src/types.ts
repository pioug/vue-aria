export type Orientation = "horizontal" | "vertical";
export type Direction = "ltr" | "rtl";

export interface UserOpts {
  interactionType?: "mouse" | "touch" | "keyboard";
  advanceTimer?: (time: number) => unknown | Promise<unknown>;
}

export interface BaseTesterOpts extends UserOpts {
  /** @private */
  user?: {
    click: (element: Element) => Promise<void>;
    dblClick: (element: Element) => Promise<void>;
    hover: (element: Element) => Promise<void>;
    pointer: (opts: { target: Element; keys?: string; coords?: Record<string, unknown> }) => Promise<void>;
    keyboard: (keys: string) => Promise<void>;
    tab: (opts?: { shift?: boolean }) => Promise<void>;
  };
  root: HTMLElement;
}

export interface CheckboxGroupTesterOpts extends BaseTesterOpts {}

export interface ComboBoxTesterOpts extends BaseTesterOpts {
  trigger?: HTMLElement;
}

export interface DialogTesterOpts extends BaseTesterOpts {
  overlayType?: "modal" | "popover";
}

export interface GridListTesterOpts extends BaseTesterOpts {}

export interface ListBoxTesterOpts extends BaseTesterOpts {
  advanceTimer?: UserOpts["advanceTimer"];
}

export interface MenuTesterOpts extends BaseTesterOpts {
  isSubmenu?: boolean;
  rootMenu?: HTMLElement;
}

export interface RadioGroupTesterOpts extends BaseTesterOpts {
  direction?: Direction;
}

export interface SelectTesterOpts extends BaseTesterOpts {}

export interface TableTesterOpts extends BaseTesterOpts {
  advanceTimer?: UserOpts["advanceTimer"];
}

export interface TabsTesterOpts extends BaseTesterOpts {
  direction?: Direction;
}

export interface TreeTesterOpts extends BaseTesterOpts {
  advanceTimer?: UserOpts["advanceTimer"];
}

export interface BaseGridRowInteractionOpts {
  row: number | string | HTMLElement;
  interactionType?: UserOpts["interactionType"];
}

export interface ToggleGridRowOpts extends BaseGridRowInteractionOpts {
  needsLongPress?: boolean;
  checkboxSelection?: boolean;
  selectionBehavior?: "toggle" | "replace";
}

export interface GridRowActionOpts extends BaseGridRowInteractionOpts {
  needsDoubleClick?: boolean;
}
