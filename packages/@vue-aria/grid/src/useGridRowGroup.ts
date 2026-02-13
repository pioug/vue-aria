export interface GridRowGroupAria {
  rowGroupProps: Record<string, unknown>;
}

export function useGridRowGroup(): GridRowGroupAria {
  return {
    rowGroupProps: {
      role: "rowgroup",
    },
  };
}
