const ignoredWarnFragments = [
  'inject() can only be used inside setup() or functional components.',
  'onScopeDispose() is called when there is no active effect scope to be associated with.'
];

const originalWarn = console.warn;

console.warn = (...args: unknown[]) => {
  const text = args.map((value) => String(value)).join(' ');
  if (ignoredWarnFragments.some((fragment) => text.includes(fragment))) {
    return;
  }
  originalWarn(...args);
};
