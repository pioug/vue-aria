import {act, waitFor, within} from './testing';
import {BaseTester} from "./_base";
import {getAltKey, getMetaKey, pressElement, triggerLongPress} from './events';
import {GridRowActionOpts, TableTesterOpts, ToggleGridRowOpts, UserOpts} from './types';

interface TableToggleRowOpts extends ToggleGridRowOpts {}
interface TableToggleSortOpts {
  column: number | string | HTMLElement;
  interactionType?: UserOpts['interactionType'];
}
interface TableColumnHeaderActionOpts extends TableToggleSortOpts {
  action: number;
}
interface TableRowActionOpts extends GridRowActionOpts {}

export class TableTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _table: HTMLElement;

  constructor(opts: TableTesterOpts) {
    let {root, user, interactionType, advanceTimer} = opts;
    super(opts);
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;
    this._table = root;
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  private async keyboardNavigateToRow(opts: {row: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {row, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let rows = this.rows;
    let targetIndex = rows.indexOf(row);
    if (targetIndex === -1) {
      throw new Error('Row provided is not in the table');
    }

    if (document.activeElement !== this._table && !this._table.contains(document.activeElement)) {
      act(() => this._table.focus());
    }

    if (document.activeElement === this._table) {
      await this.user.keyboard('[ArrowDown]');
    }

    if (this.rowGroups[0]?.contains(document.activeElement)) {
      do {
        await this.user.keyboard('[ArrowDown]');
      } while (!this.rowGroups[1]?.contains(document.activeElement));
    }

    if (this.rowGroups[1]?.contains(document.activeElement) && document.activeElement!.getAttribute('role') !== 'row') {
      do {
        await this.user.keyboard('[ArrowLeft]');
      } while (document.activeElement!.getAttribute('role') !== 'row');
    }

    let currIndex = rows.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('Current active element is not on any of the table rows');
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

  async toggleRowSelection(opts: TableToggleRowOpts): Promise<void> {
    let {
      row,
      needsLongPress,
      checkboxSelection = true,
      interactionType = this._interactionType,
      selectionBehavior = 'toggle'
    } = opts;

    let altKey = getMetaKey();
    let metaKey = getMetaKey();

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the table.');
    }

    let rowCheckbox = within(row).queryByRole('checkbox');

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
        await pressElement(this.user, cell, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  };

  async toggleSort(opts: TableToggleSortOpts): Promise<void> {
    let {
      column,
      interactionType = this._interactionType,
    } = opts;

    let columnheader;
    if (typeof column === 'number') {
      columnheader = this.columns[column];
    } else if (typeof column === 'string') {
      columnheader = within(this.rowGroups[0]).getByText(column);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role') || '')) {
        columnheader = columnheader.parentElement;
      }
    } else {
      columnheader = column;
    }

    let menuButton = within(columnheader as HTMLElement).queryByRole('button');
    if (menuButton) {
      let currentSort = columnheader?.getAttribute('aria-sort');
      if (interactionType === 'keyboard' && document.activeElement !== menuButton) {
        await pressElement(this.user, columnheader as HTMLElement, interactionType);
      } else {
        await pressElement(this.user, menuButton, interactionType);
      }

      await waitFor(() => {
        if (menuButton.getAttribute('aria-controls') == null) {
          throw new Error('No aria-controls found on table column dropdown menu trigger element.');
        } else {
          return true;
        }
      });

      let menuId = menuButton.getAttribute('aria-controls');
      await waitFor(() => {
        if (!menuId || document.getElementById(menuId) == null) {
          throw new Error(`Table column header menu with id of ${menuId} not found in document.`);
        } else {
          return true;
        }
      });

      if (menuId) {
        let menu = document.getElementById(menuId);
        if (menu) {
          let options = within(menu).queryAllByRole('menuitem');
          if (options[0]) {
            if (currentSort === 'ascending') {
              await pressElement(this.user, options[1], interactionType);
            } else {
              await pressElement(this.user, options[0], interactionType);
            }

            await waitFor(() => {
              if (document.contains(menu)) {
                throw new Error('Expected table column menu listbox to not be in the document after selecting an option');
              } else {
                return true;
              }
            });
          }
        }
      }

      if (!this._advanceTimer) {
        throw new Error('No advanceTimers provided for table transition.');
      }
      await act(async () => {
        await this._advanceTimer?.(200);
      });

      await waitFor(() => {
        if (document.activeElement !== menuButton) {
          throw new Error(`Expected the document.activeElement to be the table column menu button but got ${document.activeElement}`);
        } else {
          return true;
        }
      });
    } else {
      await pressElement(this.user, columnheader as HTMLElement, interactionType);
    }
  }

  async triggerColumnHeaderAction(opts: TableColumnHeaderActionOpts): Promise<void> {
    let {
      column,
      interactionType = this._interactionType,
      action,
    } = opts;

    let columnheader;
    if (typeof column === 'number') {
      columnheader = this.columns[column];
    } else if (typeof column === 'string') {
      columnheader = within(this.rowGroups[0]).getByText(column);
      while (columnheader && !/columnheader/.test(columnheader.getAttribute('role') || '')) {
        columnheader = columnheader.parentElement;
      }
    } else {
      columnheader = column;
    }

    let menuButton = within(columnheader as HTMLElement).queryByRole('button');
    if (menuButton) {
      if (interactionType === 'keyboard' && document.activeElement !== menuButton) {
        await pressElement(this.user, columnheader as HTMLElement, interactionType);
      } else {
        await pressElement(this.user, menuButton, interactionType);
      }

      await waitFor(() => {
        if (menuButton.getAttribute('aria-controls') == null) {
          throw new Error('No aria-controls found on table column dropdown menu trigger element.');
        } else {
          return true;
        }
      });

      let menuId = menuButton.getAttribute('aria-controls');
      await waitFor(() => {
        if (!menuId || document.getElementById(menuId) == null) {
          throw new Error(`Table column header menu with id of ${menuId} not found in document.`);
        } else {
          return true;
        }
      });

      if (menuId) {
        let menu = document.getElementById(menuId);
        if (menu) {
          let options = within(menu).queryAllByRole('menuitem');
          await pressElement(this.user, options[action], interactionType);

          await waitFor(() => {
            if (document.contains(menu)) {
              throw new Error('Expected table column menu listbox to not be in the document after selecting an option');
            } else {
              return true;
            }
          });
        }
      }

      if (!this._advanceTimer) {
        throw new Error('No advanceTimers provided for table transition.');
      }
      await act(async () => {
        await this._advanceTimer?.(200);
      });

      await waitFor(() => {
        if (document.activeElement !== menuButton) {
          throw new Error(`Expected the document.activeElement to be the table column menu button but got ${document.activeElement}`);
        } else {
          return true;
        }
      });
    } else {
      throw new Error('No menu button found on table column header.');
    }
  }

  async triggerRowAction(opts: TableRowActionOpts): Promise<void> {
    let {
      row,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof row === 'string' || typeof row === 'number') {
      row = this.findRow({rowIndexOrText: row});
    }

    if (!row) {
      throw new Error('Target row not found in the table.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(row);
    } else if (interactionType === 'keyboard') {
      await this.keyboardNavigateToRow({row, selectionOnNav: 'none'});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, row, interactionType);
    }
  }

  async toggleSelectAll(opts: {interactionType?: UserOpts['interactionType']} = {}): Promise<void> {
    let {interactionType = this._interactionType} = opts;
    let checkbox = within(this.table).getByLabelText('Select All');
    if (interactionType === 'keyboard') {
      await this.user.click(checkbox);
    } else {
      await pressElement(this.user, checkbox, interactionType);
    }
  }

  findRow(opts: {rowIndexOrText: number | string}): HTMLElement {
    let {rowIndexOrText} = opts;
    let row;
    let rows = this.rows;
    let bodyRowGroup = this.rowGroups[1];
    if (typeof rowIndexOrText === 'number') {
      row = rows[rowIndexOrText];
    } else if (typeof rowIndexOrText === 'string') {
      row = within(bodyRowGroup).getByText(rowIndexOrText);
      while (row && row.getAttribute('role') !== 'row') {
        if (row.parentElement) {
          row = row.parentElement;
        } else {
          break;
        }
      }
    }

    return row;
  }

  findCell(opts: {text: string}): HTMLElement {
    let {text} = opts;
    let cell = within(this.table).getByText(text);
    if (cell) {
      while (cell && !/gridcell|rowheader|columnheader/.test(cell.getAttribute('role') || '')) {
        if (cell.parentElement) {
          cell = cell.parentElement;
        } else {
          break;
        }
      }
    }

    return cell;
  }

  get table(): HTMLElement {
    return this._table;
  }

  get rowGroups(): HTMLElement[] {
    let table = this._table;
    return table ? within(table).queryAllByRole('rowgroup') : [];
  }

  get columns(): HTMLElement[] {
    let headerRowGroup = this.rowGroups[0];
    return headerRowGroup ? within(headerRowGroup).queryAllByRole('columnheader') : [];
  }

  get rows(): HTMLElement[] {
    let bodyRowGroup = this.rowGroups[1];
    return bodyRowGroup ? within(bodyRowGroup).queryAllByRole('row') : [];
  }

  get selectedRows(): HTMLElement[] {
    return this.rows.filter(row => row.getAttribute('aria-selected') === 'true');
  }

  get rowHeaders(): HTMLElement[] {
    return within(this.table).queryAllByRole('rowheader');
  }

  cells(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.table} = opts;
    return within(element).queryAllByRole('gridcell');
  }
}
