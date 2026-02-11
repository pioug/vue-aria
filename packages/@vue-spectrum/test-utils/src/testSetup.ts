/**
 * Mocks screen width to simulate mobile experience, useful for testing tray rendering.
 * Width is clamped to the maximum value allowed for mobile rendering.
 */
export function simulateMobile(width: number = 700): void {
  getSpyAPI().spyOn(window.screen, "width", "get").mockImplementation(() =>
    Math.min(Math.max(width, 0), 700)
  );
}

/**
 * Mocks screen width to simulate standard desktop experience.
 * Width is clamped to the minimum value allowed for desktop rendering.
 */
export function simulateDesktop(width: number = 701): void {
  getSpyAPI().spyOn(window.screen, "width", "get").mockImplementation(() =>
    Math.max(width, 701)
  );
}

interface SpyAPI {
  spyOn: (object: object, methodName: string, accessType?: "get" | "set") => {
    mockImplementation: (fn: () => number) => unknown;
  };
}

function getSpyAPI(): SpyAPI {
  const globalWithJest = globalThis as {
    jest?: SpyAPI;
    vi?: SpyAPI;
  };

  if (globalWithJest.jest?.spyOn) {
    return globalWithJest.jest;
  }

  if (globalWithJest.vi?.spyOn) {
    return globalWithJest.vi;
  }

  throw new Error(
    "simulateMobile/simulateDesktop require a global jest or vi spy API."
  );
}
