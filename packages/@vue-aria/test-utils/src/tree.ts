import {act, within} from './testing';
import {BaseGridRowInteractionOpts, GridRowActionOpts, ToggleGridRowOpts, TreeTesterOpts, UserOpts} from './types';
import {getAltKey, getMetaKey, pressElement, triggerLongPress} from './events';

interface TreeToggleExpansionOpts extends BaseGridRowInteractionOpts {}
interface TreeToggleRowOpts extends ToggleGridRowOpts {}
interface TreeRowActionOpts extends GridRowActionOpts {}

export class TreeTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _tree: HTMLElement;

  constructor(opts: TreeTesterOpts) {
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._tree = root;
    // TODO: should all helpers do this?
    let tree = within(root).queryByRole('treegrid');
    if (root.getAttribute('role') !== 'treegrid' && tree) {
      this._tree = tree;
    }
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  };

  findRow(opts: {rowIndexOrText: number | string}): HTMLElement {
    let {
      rowIndexOrText
    } = opts;

    let row;
    if (typeof rowIndexOrText === 'number') {
      row = this.rows[rowIndexOrText];
    } else if (typeof rowIndexOrText === 'string') {
      row = (within(this.tree).getByText(rowIndexOrText).closest('[role=row]')) as HTMLElement;
    }

    return row;
  }

  private async keyboardNavigateToRow(opts: {row: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {row, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let rows = this.rows;
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the tree');
    }

    if (document.activeElement !== this._tree && !this._tree.contains(document.activeElement)) {
      act(() => this._tree.focus());
    }

    if (document.activeElement === this.tree) {
      await this.user.keyboard(`${selectionOnNav === 'none' ? `[${altKey}>]` : ''}[ArrowDown]${selectionOnNav === 'none' ? `[/${altKey}]` : ''}`);
    } else if (this._tree.contains(document.activeElement) && document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard('[ArrowLeft]');
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }
    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the tree');
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

  async toggleRowSelection(opts: TreeToggleRowOpts): Promise<void> {
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
      throw new Error('Target row not found in the tree.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

    // TODO: we early return here because the checkbox can't be keyboard navigated to if the row is disabled usually
    // but we may to check for disabledBehavior (aka if the disable row gets skipped when keyboard navigating or not)
    if (interactionType === 'keyboard' && (rowCheckbox?.getAttribute('disabled') === '' || row?.getAttribute('aria-disabled') === 'true')) {
      return;
    }

    // this would be better than the check to do nothing in events.ts
    // also, it'd be good to be able to trigger selection on the row instead of having to go to the checkbox directly
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
      let cell = within(row).getAllByRole('gridcell')[0];
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }

        // Note that long press interactions with rows is strictly touch only for grid rows
        await triggerLongPress({element: cell, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
      } else {
        // TODO add modifiers here? Maybe move into pressElement if we get more cases for different types of modifier keys
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

  async toggleRowExpansion(opts: TreeToggleExpansionOpts): Promise<void> {
    let {
      row,
      interactionType = this._interactionType
    } = opts;
    if (!this.tree.contains(document.activeElement)) {
      await act(async () => {
        this.tree.focus();
      });
    }

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the tree.');
    } else if (row.getAttribute('aria-expanded') == null) {
      throw new Error('Target row is not expandable.');
    }

    if (interactionType === 'mouse' || interactionType === 'touch') {
      let rowExpander = within(row).getAllByRole('button')[0]; // what happens if the button is not first? how can we differentiate?
      await pressElement(this.user, rowExpander, interactionType);
    } else if (interactionType === 'keyboard') {
      if (row?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      // TODO: We always Use Option/Ctrl when keyboard navigating so selection isn't changed
      // in selectionmode="replace"/highlight selection when navigating to the row that the user wants
      // to expand. Discuss if this is useful or not
      await this.keyboardNavigateToRow({row});
      if (row.getAttribute('aria-expanded') === 'true') {
        await this.user.keyboard('[ArrowLeft]');
      } else {
        await this.user.keyboard('[ArrowRight]');
      }
    }
  };

  async triggerRowAction(opts: TreeRowActionOpts): Promise<void> {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the tree.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      if (row?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      // TODO: same as above, uses the modifier key to make sure we don't modify selection state on row focus
      // as we keyboard navigate to the row we want activate
      await this.keyboardNavigateToRow({row});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  };

  get tree():  HTMLElement {
    return this._tree;
  }

  get rows(): HTMLElement[] {
    return within(this?.tree).queryAllByRole('row');
  }

  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.tree} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
