import { nodeContains, useLayoutEffect } from "@vue-aria/utils";
import { ref } from "vue";

export type AriaLandmarkRole =
  | "main"
  | "region"
  | "search"
  | "navigation"
  | "form"
  | "banner"
  | "contentinfo"
  | "complementary";

export interface AriaLandmarkProps {
  role: AriaLandmarkRole;
  focus?: (direction: "forward" | "backward") => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface LandmarkAria {
  landmarkProps: Record<string, unknown>;
}

const LANDMARK_API_VERSION = 1;

interface LandmarkManagerApi {
  version: number;
  createLandmarkController(): LandmarkController;
  registerLandmark(landmark: Landmark): () => void;
}

interface Landmark {
  ref: { current: Element | null };
  role: AriaLandmarkRole;
  label?: string;
  lastFocused?: Element;
  focus: (direction: "forward" | "backward") => void;
  blur: () => void;
}

export interface LandmarkControllerOptions {
  from?: Element;
}

export interface LandmarkController {
  focusNext(opts?: LandmarkControllerOptions): boolean;
  focusPrevious(opts?: LandmarkControllerOptions): boolean;
  focusMain(): boolean;
  navigate(direction: "forward" | "backward", opts?: LandmarkControllerOptions): boolean;
  dispose(): void;
}

const landmarkSymbol = Symbol.for("react-aria-landmark-manager");

function subscribe(fn: () => void) {
  if (typeof document === "undefined") {
    return () => {};
  }

  document.addEventListener("react-aria-landmark-manager-change", fn);
  return () => document.removeEventListener("react-aria-landmark-manager-change", fn);
}

function getLandmarkManager(): LandmarkManagerApi | null {
  if (typeof document === "undefined") {
    return null;
  }

  const doc = document as Document & Record<symbol, LandmarkManagerApi | undefined>;
  const instance = doc[landmarkSymbol];
  if (instance && instance.version >= LANDMARK_API_VERSION) {
    return instance;
  }

  doc[landmarkSymbol] = new LandmarkManager();
  document.dispatchEvent(new CustomEvent("react-aria-landmark-manager-change"));
  return doc[landmarkSymbol] ?? null;
}

function useLandmarkManager(): LandmarkManagerApi | null {
  return getLandmarkManager();
}

class LandmarkManager implements LandmarkManagerApi {
  private landmarks: Array<Landmark> = [];
  private isListening = false;
  private refCount = 0;
  public version = LANDMARK_API_VERSION;

  constructor() {
    this.f6Handler = this.f6Handler.bind(this);
    this.focusinHandler = this.focusinHandler.bind(this);
    this.focusoutHandler = this.focusoutHandler.bind(this);
  }

  private setupIfNeeded() {
    if (this.isListening) {
      return;
    }

    document.addEventListener("keydown", this.f6Handler, { capture: true });
    document.addEventListener("focusin", this.focusinHandler, { capture: true });
    document.addEventListener("focusout", this.focusoutHandler, { capture: true });
    this.isListening = true;
  }

  private teardownIfNeeded() {
    if (!this.isListening || this.landmarks.length > 0 || this.refCount > 0) {
      return;
    }

    document.removeEventListener("keydown", this.f6Handler, { capture: true });
    document.removeEventListener("focusin", this.focusinHandler, { capture: true });
    document.removeEventListener("focusout", this.focusoutHandler, { capture: true });
    this.isListening = false;
  }

  private focusLandmark(landmark: Element, direction: "forward" | "backward") {
    this.landmarks.find((l) => l.ref.current === landmark)?.focus?.(direction);
  }

  private getLandmarksByRole(role: AriaLandmarkRole) {
    return new Set(this.landmarks.filter((l) => l.role === role));
  }

  private getLandmarkByRole(role: AriaLandmarkRole) {
    return this.landmarks.find((l) => l.role === role);
  }

  private addLandmark(newLandmark: Landmark) {
    this.setupIfNeeded();
    if (this.landmarks.find((landmark) => landmark.ref === newLandmark.ref) || !newLandmark.ref.current) {
      return;
    }

    if (this.landmarks.filter((landmark) => landmark.role === "main").length > 1 && process.env.NODE_ENV !== "production") {
      console.error('Page can contain no more than one landmark with the role "main".');
    }

    if (this.landmarks.length === 0) {
      this.landmarks = [newLandmark];
      this.checkLabels(newLandmark.role);
      return;
    }

    let start = 0;
    let end = this.landmarks.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      const comparedPosition = newLandmark.ref.current.compareDocumentPosition(this.landmarks[mid].ref.current as Node);
      const isNewAfterExisting = Boolean(
        (comparedPosition & Node.DOCUMENT_POSITION_PRECEDING) || (comparedPosition & Node.DOCUMENT_POSITION_CONTAINS)
      );

      if (isNewAfterExisting) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    this.landmarks.splice(start, 0, newLandmark);
    this.checkLabels(newLandmark.role);
  }

  private updateLandmark(landmark: Pick<Landmark, "ref"> & Partial<Landmark>) {
    const index = this.landmarks.findIndex((l) => l.ref === landmark.ref);
    if (index >= 0) {
      this.landmarks[index] = { ...this.landmarks[index], ...landmark };
      this.checkLabels(this.landmarks[index].role);
    }
  }

  private removeLandmark(ref: { current: Element | null }) {
    this.landmarks = this.landmarks.filter((landmark) => landmark.ref !== ref);
    this.teardownIfNeeded();
  }

  private checkLabels(role: AriaLandmarkRole) {
    const landmarksWithRole = this.getLandmarksByRole(role);
    if (landmarksWithRole.size > 1) {
      const duplicatesWithoutLabel = [...landmarksWithRole].filter((landmark) => !landmark.label);
      if (duplicatesWithoutLabel.length > 0 && process.env.NODE_ENV !== "production") {
        console.warn(
          `Page contains more than one landmark with the '${role}' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute: `,
          duplicatesWithoutLabel.map((landmark) => landmark.ref.current)
        );
      } else if (process.env.NODE_ENV !== "production") {
        const labels = [...landmarksWithRole].map((landmark) => landmark.label);
        const duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);

        duplicateLabels.forEach((label) => {
          console.warn(
            `Page contains more than one landmark with the '${role}' role and '${label}' label. If two or more landmarks on a page share the same role, they must have unique labels: `,
            [...landmarksWithRole].filter((landmark) => landmark.label === label).map((landmark) => landmark.ref.current)
          );
        });
      }
    }
  }

  private closestLandmark(element: Element) {
    const landmarkMap = new Map(this.landmarks.map((l) => [l.ref.current, l] as const));
    let currentElement: Element | null = element;
    while (currentElement && !landmarkMap.has(currentElement) && currentElement !== document.body && currentElement.parentElement) {
      currentElement = currentElement.parentElement;
    }

    return landmarkMap.get(currentElement);
  }

  private getNextLandmark(element: Element, { backward }: { backward?: boolean }) {
    const currentLandmark = this.closestLandmark(element);
    let nextLandmarkIndex = backward ? this.landmarks.length - 1 : 0;
    if (currentLandmark) {
      nextLandmarkIndex = this.landmarks.indexOf(currentLandmark) + (backward ? -1 : 1);
    }

    const wrapIfNeeded = () => {
      if (nextLandmarkIndex < 0) {
        if (
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              detail: { direction: "backward" },
              bubbles: true,
              cancelable: true,
            })
          )
        ) {
          return true;
        }

        nextLandmarkIndex = this.landmarks.length - 1;
      } else if (nextLandmarkIndex >= this.landmarks.length) {
        if (
          !element.dispatchEvent(
            new CustomEvent("react-aria-landmark-navigation", {
              detail: { direction: "forward" },
              bubbles: true,
              cancelable: true,
            })
          )
        ) {
          return true;
        }

        nextLandmarkIndex = 0;
      }

      if (nextLandmarkIndex < 0 || nextLandmarkIndex >= this.landmarks.length) {
        return true;
      }

      return false;
    };

    if (wrapIfNeeded()) {
      return undefined;
    }

    const i = nextLandmarkIndex;
    while (this.landmarks[nextLandmarkIndex].ref.current?.closest('[aria-hidden=true]')) {
      nextLandmarkIndex += backward ? -1 : 1;
      if (wrapIfNeeded()) {
        return undefined;
      }

      if (nextLandmarkIndex === i) {
        break;
      }
    }

    return this.landmarks[nextLandmarkIndex];
  }

  private f6Handler(event: KeyboardEvent) {
    if (event.key === "F6") {
      const handled = event.altKey ? this.focusMain() : this.navigate(event.target as Element, event.shiftKey);
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  private focusMain() {
    const main = this.getLandmarkByRole("main");
    if (main && main.ref.current && nodeContains(document, main.ref.current)) {
      this.focusLandmark(main.ref.current, "forward");
      return true;
    }

    return false;
  }

  private navigate(from: Element, backward: boolean) {
    const nextLandmark = this.getNextLandmark(from, { backward });
    if (!nextLandmark) {
      return false;
    }

    if (nextLandmark.lastFocused) {
      const lastFocused = nextLandmark.lastFocused;
      if (nodeContains(document.body, lastFocused)) {
        (lastFocused as HTMLElement).focus();
        return true;
      }
    }

    if (nextLandmark.ref.current && nodeContains(document, nextLandmark.ref.current)) {
      this.focusLandmark(nextLandmark.ref.current, backward ? "backward" : "forward");
      return true;
    }

    return false;
  }

  private focusinHandler(event: FocusEvent) {
    const currentLandmark = this.closestLandmark(event.target as Element);
    if (currentLandmark && currentLandmark.ref.current !== event.target) {
      this.updateLandmark({ ref: currentLandmark.ref, lastFocused: event.target as Element });
    }

    const previousFocusedElement = event.relatedTarget as Element | null;
    if (previousFocusedElement) {
      const closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (closestPreviousLandmark && closestPreviousLandmark.ref.current === previousFocusedElement) {
        closestPreviousLandmark.blur();
      }
    }
  }

  private focusoutHandler(event: FocusEvent) {
    const previousFocusedElement = event.target as Element;
    const nextFocusedElement = event.relatedTarget;
    if (!nextFocusedElement || nextFocusedElement === document) {
      const closestPreviousLandmark = this.closestLandmark(previousFocusedElement);
      if (closestPreviousLandmark && closestPreviousLandmark.ref.current === previousFocusedElement) {
        closestPreviousLandmark.blur();
      }
    }
  }

  public createLandmarkController(): LandmarkController {
    let instance: LandmarkManager | null = this;
    instance.refCount++;
    instance.setupIfNeeded();
    return {
      navigate(direction, opts) {
        const element = opts?.from || (document.activeElement as Element);
        return instance!.navigate(element, direction === "backward");
      },
      focusNext(opts) {
        const element = opts?.from || (document.activeElement as Element);
        return instance!.navigate(element, false);
      },
      focusPrevious(opts) {
        const element = opts?.from || (document.activeElement as Element);
        return instance!.navigate(element, true);
      },
      focusMain() {
        return instance!.focusMain();
      },
      dispose() {
        if (instance) {
          instance.refCount--;
          instance.teardownIfNeeded();
          instance = null;
        }
      },
    };
  }

  public registerLandmark(landmark: Landmark): () => void {
    if (this.landmarks.find((l) => l.ref === landmark.ref)) {
      this.updateLandmark(landmark);
    } else {
      this.addLandmark(landmark);
    }

    return () => this.removeLandmark(landmark.ref);
  }
}

export function UNSTABLE_createLandmarkController(): LandmarkController {
  let instance: LandmarkManagerApi | null = getLandmarkManager();
  let controller = instance?.createLandmarkController();

  const unsubscribe = subscribe(() => {
    controller?.dispose();
    instance = getLandmarkManager();
    controller = instance?.createLandmarkController();
  });

  return {
    navigate(direction, opts) {
      return controller!.navigate(direction, opts);
    },
    focusNext(opts) {
      return controller!.focusNext(opts);
    },
    focusPrevious(opts) {
      return controller!.focusPrevious(opts);
    },
    focusMain() {
      return controller!.focusMain();
    },
    dispose() {
      controller?.dispose();
      unsubscribe();
      controller = undefined;
      instance = null;
    },
  };
}

export function useLandmark(props: AriaLandmarkProps, refValue: { current: Element | null }): LandmarkAria {
  const { role, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, focus } = props;
  const manager = useLandmarkManager();
  const label = ariaLabel || ariaLabelledby;
  const isLandmarkFocused = ref(false);

  const defaultFocus = () => {
    isLandmarkFocused.value = true;
  };

  const blur = () => {
    isLandmarkFocused.value = false;
  };

  useLayoutEffect(() => {
    if (manager) {
      return manager.registerLandmark({ ref: refValue, label, role, focus: focus || defaultFocus, blur });
    }
  });

  useLayoutEffect(() => {
    if (isLandmarkFocused.value) {
      (refValue.current as HTMLElement | null)?.focus();
    }
  }, [isLandmarkFocused]);

  const landmarkProps: Record<string, unknown> = {
    role,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  Object.defineProperty(landmarkProps, "tabIndex", {
    enumerable: true,
    configurable: true,
    get: () => (isLandmarkFocused.value ? -1 : undefined),
  });

  return {
    landmarkProps,
  };
}
