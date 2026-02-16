import {act, within} from './testing';
import {BaseTester} from "./_base";
import {getAltKey, getMetaKey, pressElement, triggerLongPress} from './events';
import {GridListTesterOpts, GridRowActionOpts, ToggleGridRowOpts, UserOpts} from './types';

interface GridListToggleRowOpts extends ToggleGridRowOpts {}
interface GridListRowActionOpts extends GridRowActionOpts {}

export class GridListTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _gridlist: HTMLElement;

  constructor(opts: GridListTesterOpts) {
    super(opts);
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._gridlist = root;
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  findRow(opts: {rowIndexOrText: number | string}): HTMLElement {
    let {rowIndexOrText} = opts;
    let row;
    if (typeof rowIndexOrText === 'number') {
      row = this.rows[rowIndexOrText];
    } else if (typeof rowIndexOrText === 'string') {
      row = (within(this.gridlist).getByText(rowIndexOrText).closest('[role=row]')) as HTMLElement;
    }
    return row;
  }

  private async keyboardNavigateToRow(opts: {row: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {row, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let rows = this.rows;
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the gridlist');
    }

    if (document.activeElement !== this._gridlist && !this._gridlist.contains(document.activeElement)) {
      act(() => this._gridlist.focus());
    }

    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>][ArrowDown][/${altKey}]`);
    } else if (document.activeElement === this._gridlist) {
      await this.user.keyboard('[ArrowDown]');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the gridlist');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>]`);
    }
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[/${altKey}]`);
    }
  };

  async toggleRowSelection(opts: GridListToggleRowOpts): Promise<void> {
    let {
      row,
      needsLongPress,
      checkboxSelection = true,
      interactionType = this._interactionType,
      selectionBehavior = 'toggle'
    } = opts;

    let altKey = getAltKey();
    let metaKey = getMetaKey();

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the gridlist.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

    if (interactionType === 'keyboard' && (rowCheckbox?.getAttribute('disabled') === '' || row?.getAttribute('aria-disabled') === 'true')) {
      return;
    }

    if (interactionType === 'keyboard' && (!checkboxSelection || !rowCheckbox)) {
      await this.keyboardNavigateToRow({row, selectionOnNav: selectionBehavior === 'replace' ? 'none' : 'default'});
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[${altKey}>]`);
      }
      await this.user.keyboard('[Space]');
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[/${altKey}]`);
      }
      return;
    }
    if (rowCheckbox && checkboxSelection) {
      await pressElement(this.user, rowCheckbox, interactionType);
    } else {
      let cell = within(row).queryAllByRole('gridcell')[0];
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }
        await triggerLongPress({element: cell, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
      } else {
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[${metaKey}>]`);
        }
        await pressElement(this.user, row, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  };

  async triggerRowAction(opts: GridListRowActionOpts): Promise<void> {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the gridlist.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      if (row?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToRow({row, selectionOnNav: 'none'});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  }

  get gridlist(): HTMLElement {
    return this._gridlist;
  }

  get rows(): HTMLElement[] {
    return within(this?.gridlist).queryAllByRole('row');
  }

  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.gridlist} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
