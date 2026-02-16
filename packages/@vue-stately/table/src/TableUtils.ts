import type { ColumnSize, Key } from "./types";

export function isStatic(width?: ColumnSize | null): boolean {
  return (
    width != null
    && (!isNaN(width as number) || String(width).match(/^(\d+)(?=%$)/) !== null)
  );
}

export function parseFractionalUnit(width?: ColumnSize | null): number {
  if (!width || typeof width === "number") {
    return 1;
  }

  const match = width.match(/^(.+)(?=fr$)/);
  if (!match) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `width: ${width} is not a supported format, width should be a number (ex. 150), percentage (ex. '50%') or fr unit (ex. '2fr')`,
        "defaulting to '1fr'"
      );
    }
    return 1;
  }

  return parseFloat(match[0]);
}

export function parseStaticWidth(width: number | string, tableWidth: number): number {
  if (typeof width === "string") {
    const match = width.match(/^(\d+)(?=%$)/);
    if (!match) {
      throw new Error("Only percentages or numbers are supported for static column widths");
    }
    return tableWidth * (parseFloat(match[0]) / 100);
  }

  return width;
}

export function getMaxWidth(
  maxWidth: number | string | null | undefined,
  tableWidth: number
): number {
  return maxWidth != null ? parseStaticWidth(maxWidth, tableWidth) : Number.MAX_SAFE_INTEGER;
}

export function getMinWidth(minWidth: number | string, tableWidth: number): number {
  return minWidth != null ? parseStaticWidth(minWidth, tableWidth) : 0;
}

export interface IColumn {
  minWidth?: number | string;
  maxWidth?: number | string;
  width?: number | string;
  defaultWidth?: number | string;
  key: Key;
}

interface FlexItem {
  frozen: boolean;
  baseSize: number;
  hypotheticalMainSize: number;
  min: number;
  max: number;
  flex: number;
  targetMainSize: number;
  violation: number;
}

export function calculateColumnSizes(
  availableWidth: number,
  columns: IColumn[],
  changedColumns: Map<Key, ColumnSize>,
  getDefaultWidth?: (index: number) => ColumnSize | null | undefined,
  getDefaultMinWidth?: (index: number) => ColumnSize | null | undefined
): number[] {
  let hasNonFrozenItems = false;
  const flexItems: FlexItem[] = columns.map((column, index) => {
    const width: ColumnSize = (changedColumns.get(column.key) != null
      ? changedColumns.get(column.key) ?? "1fr"
      : column.width ?? column.defaultWidth ?? getDefaultWidth?.(index) ?? "1fr") as ColumnSize;
    let frozen = false;
    let baseSize = 0;
    let flex = 0;
    let targetMainSize = 0;

    if (isStatic(width)) {
      baseSize = parseStaticWidth(width, availableWidth);
      frozen = true;
    } else {
      flex = parseFractionalUnit(width);
      if (flex <= 0) {
        frozen = true;
      }
    }

    const min = getMinWidth(column.minWidth ?? getDefaultMinWidth?.(index) ?? 0, availableWidth);
    const max = getMaxWidth(column.maxWidth, availableWidth);
    const hypotheticalMainSize = Math.max(min, Math.min(baseSize, max));

    if (frozen) {
      targetMainSize = hypotheticalMainSize;
    } else if (baseSize > hypotheticalMainSize) {
      frozen = true;
      targetMainSize = hypotheticalMainSize;
    }

    if (!frozen) {
      hasNonFrozenItems = true;
    }

    return {
      frozen,
      baseSize,
      hypotheticalMainSize,
      min,
      max,
      flex,
      targetMainSize,
      violation: 0,
    };
  });

  while (hasNonFrozenItems) {
    let usedWidth = 0;
    let flexFactors = 0;
    flexItems.forEach((item) => {
      if (item.frozen) {
        usedWidth += item.targetMainSize;
      } else {
        usedWidth += item.baseSize;
        flexFactors += item.flex;
      }
    });

    const remainingFreeSpace = availableWidth - usedWidth;
    if (remainingFreeSpace > 0) {
      flexItems.forEach((item) => {
        if (!item.frozen) {
          const ratio = item.flex / flexFactors;
          item.targetMainSize = item.baseSize + ratio * remainingFreeSpace;
        }
      });
    }

    let totalViolation = 0;
    flexItems.forEach((item) => {
      item.violation = 0;
      if (!item.frozen) {
        const targetMainSize = item.targetMainSize;
        item.targetMainSize = Math.max(item.min, Math.min(targetMainSize, item.max));
        item.violation = item.targetMainSize - targetMainSize;
        totalViolation += item.violation;
      }
    });

    hasNonFrozenItems = false;
    flexItems.forEach((item) => {
      if (totalViolation === 0 || Math.sign(totalViolation) === Math.sign(item.violation)) {
        item.frozen = true;
      } else if (!item.frozen) {
        hasNonFrozenItems = true;
      }
    });
  }

  return cascadeRounding(flexItems);
}

function cascadeRounding(flexItems: FlexItem[]): number[] {
  let floatingPointTotal = 0;
  let integerTotal = 0;
  const roundedArray: number[] = [];
  flexItems.forEach((item) => {
    const floating = item.targetMainSize;
    const integer = Math.round(floating + floatingPointTotal) - integerTotal;
    floatingPointTotal += floating;
    integerTotal += integer;
    roundedArray.push(integer);
  });

  return roundedArray;
}
