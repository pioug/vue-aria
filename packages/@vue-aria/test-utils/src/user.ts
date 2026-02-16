import {CheckboxGroupTester} from './checkboxgroup';
import {
  CheckboxGroupTesterOpts,
  ComboBoxTesterOpts,
  DialogTesterOpts,
  GridListTesterOpts,
  ListBoxTesterOpts,
  MenuTesterOpts,
  RadioGroupTesterOpts,
  SelectTesterOpts,
  TableTesterOpts,
  TabsTesterOpts,
  TreeTesterOpts,
  UserOpts,
} from './types';
import {ComboBoxTester} from './combobox';
import {DialogTester} from './dialog';
import {GridListTester} from './gridlist';
import {ListBoxTester} from './listbox';
import {MenuTester} from './menu';
import {pointerMap} from './userEventMaps';
import {RadioGroupTester} from './radiogroup';
import {SelectTester} from './select';
import {TableTester} from './table';
import {TabsTester} from './tabs';
import {TreeTester} from './tree';

type KeyMap = {
  MouseLeft: {pointerType: 'mouse'; button: 'primary'; height?: number; width?: number; pressure?: number};
  MouseRight: {pointerType: 'mouse'; button: 'secondary'};
  MouseMiddle: {pointerType: 'mouse'; button: 'auxiliary'};
  TouchA: {pointerType: 'touch'; height?: number; width?: number};
  TouchB: {pointerType: 'touch'};
  TouchC: {pointerType: 'touch'};
};

type UserActions = {
  click: (element: Element) => Promise<void>;
  dblClick: (element: Element) => Promise<void>;
  hover: (element: Element) => Promise<void>;
  pointer: (opts: {target: Element; keys?: string; coords?: Record<string, unknown>}) => Promise<void>;
  keyboard: (keys: string) => Promise<void>;
  tab: (opts?: {shift?: boolean}) => Promise<void>;
};

type BaseMouseEvent = {bubbles: boolean; cancelable: boolean; detail?: number; bubblesDefault?: boolean; [key: string]: unknown};

let keyToUtil: {
  CheckboxGroup: typeof CheckboxGroupTester,
  ComboBox: typeof ComboBoxTester,
  Dialog: typeof DialogTester,
  GridList: typeof GridListTester,
  ListBox: typeof ListBoxTester,
  Menu: typeof MenuTester,
  RadioGroup: typeof RadioGroupTester,
  Select: typeof SelectTester,
  Table: typeof TableTester,
  Tabs: typeof TabsTester,
  Tree: typeof TreeTester,
} = {
  CheckboxGroup: CheckboxGroupTester,
  ComboBox: ComboBoxTester,
  Dialog: DialogTester,
  GridList: GridListTester,
  ListBox: ListBoxTester,
  Menu: MenuTester,
  RadioGroup: RadioGroupTester,
  Select: SelectTester,
  Table: TableTester,
  Tabs: TabsTester,
  Tree: TreeTester,
} as const;

export type PatternNames = keyof typeof keyToUtil;

type Tester<T extends PatternNames> =
  T extends 'CheckboxGroup' ? CheckboxGroupTester :
  T extends 'ComboBox' ? ComboBoxTester :
  T extends 'Dialog' ? DialogTester :
  T extends 'GridList' ? GridListTester :
  T extends 'ListBox' ? ListBoxTester :
  T extends 'Menu' ? MenuTester :
  T extends 'RadioGroup' ? RadioGroupTester :
  T extends 'Select' ? SelectTester :
  T extends 'Table' ? TableTester :
  T extends 'Tabs' ? TabsTester :
  T extends 'Tree' ? TreeTester :
  never;

type TesterOpts<T extends PatternNames> =
  T extends 'CheckboxGroup' ? CheckboxGroupTesterOpts :
  T extends 'ComboBox' ? ComboBoxTesterOpts :
  T extends 'Dialog' ? DialogTesterOpts :
  T extends 'GridList' ? GridListTesterOpts :
  T extends 'ListBox' ? ListBoxTesterOpts :
  T extends 'Menu' ? MenuTesterOpts :
  T extends 'RadioGroup' ? RadioGroupTesterOpts :
  T extends 'Select' ? SelectTesterOpts :
  T extends 'Table' ? TableTesterOpts :
  T extends 'Tabs' ? TabsTesterOpts :
  T extends 'Tree' ? TreeTesterOpts :
  never;

const defaultAdvanceTimer = (waitTime: number | undefined) => new Promise((resolve) => setTimeout(resolve, waitTime));

function resolveModifiers() {
  let alt = false;
  let control = false;
  let meta = false;
  let shift = false;
  return {
    reset() {
      alt = false;
      control = false;
      meta = false;
      shift = false;
    },
    set(name: string, value: boolean) {
      switch (name) {
        case "Alt":
        case "AltLeft":
        case "ControlLeft":
          control = value;
          break;
        case "MetaLeft":
          meta = value;
          break;
        case "Shift":
          shift = value;
          break;
      }
    },
    getState() {
      return {altKey: alt || control, ctrlKey: control, metaKey: meta, shiftKey: shift};
    },
    press(name: string, mode: "down" | "up") {
      const down = mode === "down";
      if (name === "Alt") {
        control = down;
      } else if (name === "ControlLeft") {
        control = down;
      } else if (name === "MetaLeft") {
        meta = down;
      } else if (name === "Shift") {
        shift = down;
      } else if (name === "ShiftLeft") {
        shift = down;
      }
    },
  };
}

function dispatchKeyboard(target: Element, type: "keydown" | "keyup", key: string, modifiers: {altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean}) {
  const init = {
    bubbles: true,
    cancelable: true,
    key,
    code: `Key${key}`,
    altKey: modifiers.altKey,
    ctrlKey: modifiers.ctrlKey,
    metaKey: modifiers.metaKey,
    shiftKey: modifiers.shiftKey,
  };
  target.dispatchEvent(new KeyboardEvent(type, init));
}

function parsePointerToken(keys = ""): KeyMap[keyof KeyMap] {
  const token = /\[[^\]]+\]/.exec(keys)?.[0];
  const key = token ? token.slice(1, -1) : keys;
  const mapped = pointerMap.find(item => item.name === key);
  return (mapped ?? pointerMap[0]) as unknown as KeyMap[keyof KeyMap];
}

function createMouseEvent(target: Element, type: string, options: Record<string, unknown> = {}) {
  if (typeof MouseEvent === "undefined") {
    return null;
  }
  const init = {bubbles: true, cancelable: true, ...options};
  return new MouseEvent(type, init as BaseMouseEvent);
}

function createPointerEvent(target: Element, type: string, options: Record<string, unknown> = {}) {
  if (typeof PointerEvent === "undefined") {
    return createMouseEvent(target, type, options);
  }
  const init = {bubbles: true, cancelable: true, ...options};
  return new PointerEvent(type, init);
}

function setMouseCoords(eventInit: Record<string, unknown> = {}, opts: {coords?: Record<string, unknown>}): Record<string, unknown> {
  return {...eventInit, ...opts.coords};
}

function toElements(target: Element): Element {
  return target;
}

class InternalUser implements UserActions {
  async click(element: Element): Promise<void> {
    await this.pointer({target: element, keys: "[MouseLeft]"});
  }

  async dblClick(element: Element): Promise<void> {
    await this.click(element);
    await this.click(element);
  }

  async hover(element: Element): Promise<void> {
    const mouseOver = createMouseEvent(element, "mouseover", {});
    if (mouseOver) {
      element.dispatchEvent(mouseOver);
    }
  }

  async pointer(opts: {target: Element; keys?: string; coords?: Record<string, unknown>}): Promise<void> {
    let pointerType = parsePointerToken(opts.keys ?? "");
    let pointerDown = createPointerEvent(opts.target, "pointerdown", {
      ...pointerType,
      ...(opts.coords ? setMouseCoords({}, opts) : {}),
    });

    if (pointerDown) {
      opts.target.dispatchEvent(pointerDown);
    }

    let mouseDown = createMouseEvent(opts.target, "mousedown", {
      button: pointerType.button === "primary" ? 0 : pointerType.button === "secondary" ? 2 : 1,
      ...(opts.coords ? setMouseCoords({}, opts) : {}),
    });
    if (mouseDown) {
      opts.target.dispatchEvent(mouseDown);
    }

    opts.target.dispatchEvent(new Event("click", {bubbles: true, cancelable: true}));
    let mouseUp = createMouseEvent(opts.target, "mouseup", {
      button: pointerType.button === "primary" ? 0 : pointerType.button === "secondary" ? 2 : 1,
      ...(opts.coords ? setMouseCoords({}, opts) : {}),
    });
    if (mouseUp) {
      opts.target.dispatchEvent(mouseUp);
    }
    const pointerUp = createPointerEvent(opts.target, "pointerup", {
      ...pointerType,
      ...(opts.coords ? setMouseCoords({}, opts) : {}),
    });
    if (pointerUp) {
      opts.target.dispatchEvent(pointerUp);
    }
  }

  async keyboard(keys: string): Promise<void> {
    const target = ((document.activeElement as Element | null) ?? document.body) || document.documentElement;
    const modifierState = resolveModifiers();
    const tokens = keys.match(/\[[^\]]+\]|./g) ?? [];
    for (const token of tokens) {
      if (!token) {
        continue;
      }

      if (!token.startsWith("[") || !token.endsWith("]")) {
        dispatchKeyboard(target, "keydown", token, modifierState.getState());
        dispatchKeyboard(target, "keyup", token, modifierState.getState());
        continue;
      }

      const body = token.slice(1, -1);
      if (body.startsWith("/")) {
        modifierState.press(body.slice(1), "up");
        dispatchKeyboard(target, "keyup", body.slice(1), modifierState.getState());
      } else if (body.endsWith(">")) {
        const key = body.slice(0, -1);
        modifierState.press(key, "down");
        dispatchKeyboard(target, "keydown", key, modifierState.getState());
      } else {
        dispatchKeyboard(target, "keydown", body, modifierState.getState());
        dispatchKeyboard(target, "keyup", body, modifierState.getState());
      }
    }
    // ensure we don't retain held modifier state between calls
    modifierState.reset();
  }

  async tab(opts?: {shift?: boolean}): Promise<void> {
    if (opts?.shift) {
      await this.keyboard("[Shift>][Tab][/Shift]");
    } else {
      await this.keyboard("[Tab]");
    }
  }
}

export class User {
  private user: UserActions;
  interactionType: UserOpts['interactionType'];
  advanceTimer: UserOpts['advanceTimer'];

  constructor(opts: UserOpts = {}) {
    let {interactionType, advanceTimer} = opts;
    this.user = new InternalUser();
    this.interactionType = interactionType;
    this.advanceTimer = advanceTimer || defaultAdvanceTimer;
  }

  createTester<T extends PatternNames>(patternName: T, opts: TesterOpts<T>): Tester<T> {
    return new (keyToUtil)[patternName]({interactionType: this.interactionType, advanceTimer: this.advanceTimer, ...opts, user: this.user}) as Tester<T>;
  }
}
