type Assertiveness = "assertive" | "polite";

const LIVEREGION_TIMEOUT_DELAY = 7000;

let liveAnnouncer: LiveAnnouncer | null = null;

type Message = string | { "aria-labelledby": string };

declare const IS_REACT_ACT_ENVIRONMENT: boolean | undefined;

declare const jest: unknown;

export function announce(
  message: Message,
  assertiveness: Assertiveness = "assertive",
  timeout: number = LIVEREGION_TIMEOUT_DELAY
): void {
  if (!liveAnnouncer) {
    liveAnnouncer = new LiveAnnouncer();

    const isActEnvironment =
      typeof IS_REACT_ACT_ENVIRONMENT === "boolean"
        ? IS_REACT_ACT_ENVIRONMENT
        : typeof jest !== "undefined";

    if (!isActEnvironment) {
      setTimeout(() => {
        if (liveAnnouncer?.isAttached()) {
          liveAnnouncer.announce(message, assertiveness, timeout);
        }
      }, 100);
    } else {
      liveAnnouncer.announce(message, assertiveness, timeout);
    }
  } else {
    liveAnnouncer.announce(message, assertiveness, timeout);
  }
}

export function clearAnnouncer(assertiveness: Assertiveness): void {
  if (liveAnnouncer) {
    liveAnnouncer.clear(assertiveness);
  }
}

export function destroyAnnouncer(): void {
  if (liveAnnouncer) {
    liveAnnouncer.destroy();
    liveAnnouncer = null;
  }
}

class LiveAnnouncer {
  node: HTMLElement | null = null;
  assertiveLog: HTMLElement | null = null;
  politeLog: HTMLElement | null = null;

  constructor() {
    if (typeof document !== "undefined") {
      this.node = document.createElement("div");
      this.node.dataset.liveAnnouncer = "true";
      Object.assign(this.node.style, {
        border: 0,
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        width: "1px",
        whiteSpace: "nowrap",
      });

      this.assertiveLog = this.createLog("assertive");
      this.node.appendChild(this.assertiveLog);

      this.politeLog = this.createLog("polite");
      this.node.appendChild(this.politeLog);

      document.body.prepend(this.node);
    }
  }

  isAttached() {
    return this.node?.isConnected;
  }

  createLog(ariaLive: string) {
    const node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", ariaLive);
    node.setAttribute("aria-relevant", "additions");
    return node;
  }

  destroy() {
    if (!this.node) {
      return;
    }

    document.body.removeChild(this.node);
    this.node = null;
  }

  announce(message: Message, assertiveness: Assertiveness = "assertive", timeout = LIVEREGION_TIMEOUT_DELAY) {
    if (!this.node) {
      return;
    }

    const node = document.createElement("div");
    if (typeof message === "object") {
      node.setAttribute("role", "img");
      node.setAttribute("aria-labelledby", message["aria-labelledby"]);
    } else {
      node.textContent = message;
    }

    if (assertiveness === "assertive") {
      this.assertiveLog?.appendChild(node);
    } else {
      this.politeLog?.appendChild(node);
    }

    if (message !== "") {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness: Assertiveness) {
    if (!this.node) {
      return;
    }

    if ((!assertiveness || assertiveness === "assertive") && this.assertiveLog) {
      this.assertiveLog.innerHTML = "";
    }

    if ((!assertiveness || assertiveness === "polite") && this.politeLog) {
      this.politeLog.innerHTML = "";
    }
  }
}
