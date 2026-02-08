export type LiveAssertiveness = "assertive" | "polite";
export type LiveMessage = string | { "aria-labelledby": string };

const DEFAULT_TIMEOUT = 7000;

let liveAnnouncer: LiveAnnouncer | null = null;

class LiveAnnouncer {
  private node: HTMLElement | null = null;
  private assertiveLog: HTMLElement | null = null;
  private politeLog: HTMLElement | null = null;

  constructor() {
    if (typeof document === "undefined") {
      return;
    }

    this.node = document.createElement("div");
    this.node.dataset.liveAnnouncer = "true";
    Object.assign(this.node.style, {
      border: "0",
      clip: "rect(0 0 0 0)",
      clipPath: "inset(50%)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: "0",
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
    });

    this.assertiveLog = this.createLog("assertive");
    this.politeLog = this.createLog("polite");

    this.node.append(this.assertiveLog, this.politeLog);
    document.body.prepend(this.node);
  }

  private createLog(assertiveness: LiveAssertiveness): HTMLElement {
    const node = document.createElement("div");
    node.setAttribute("role", "log");
    node.setAttribute("aria-live", assertiveness);
    node.setAttribute("aria-relevant", "additions");
    return node;
  }

  isAttached(): boolean {
    return Boolean(this.node?.isConnected);
  }

  announce(
    message: LiveMessage,
    assertiveness: LiveAssertiveness,
    timeout: number
  ): void {
    const target = assertiveness === "assertive" ? this.assertiveLog : this.politeLog;
    if (!target) {
      return;
    }

    const node = document.createElement("div");
    if (typeof message === "string") {
      node.textContent = message;
    } else {
      node.setAttribute("role", "img");
      node.setAttribute("aria-labelledby", message["aria-labelledby"]);
    }

    target.appendChild(node);

    if (message !== "") {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness?: LiveAssertiveness): void {
    if ((!assertiveness || assertiveness === "assertive") && this.assertiveLog) {
      this.assertiveLog.innerHTML = "";
    }

    if ((!assertiveness || assertiveness === "polite") && this.politeLog) {
      this.politeLog.innerHTML = "";
    }
  }

  destroy(): void {
    if (this.node?.parentNode) {
      this.node.parentNode.removeChild(this.node);
    }

    this.node = null;
    this.assertiveLog = null;
    this.politeLog = null;
  }
}

export function announce(
  message: LiveMessage,
  assertiveness: LiveAssertiveness = "assertive",
  timeout: number = DEFAULT_TIMEOUT
): void {
  if (!liveAnnouncer) {
    liveAnnouncer = new LiveAnnouncer();
  }

  if (!liveAnnouncer.isAttached()) {
    return;
  }

  liveAnnouncer.announce(message, assertiveness, timeout);
}

export function clearAnnouncer(assertiveness?: LiveAssertiveness): void {
  liveAnnouncer?.clear(assertiveness);
}

export function destroyAnnouncer(): void {
  liveAnnouncer?.destroy();
  liveAnnouncer = null;
}
