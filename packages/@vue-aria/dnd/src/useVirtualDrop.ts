export interface VirtualDropResult {
  dropIndex?: number;
}

export function useVirtualDrop(): VirtualDropResult {
  return {dropIndex: undefined};
}
