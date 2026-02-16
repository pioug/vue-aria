interface WithinResult {
  queryAllByRole(role: string): HTMLElement[];
  queryByRole(role: string): HTMLElement | null;
  getByRole(role: string): HTMLElement;
  queryAllByText(text: string): HTMLElement[];
  queryByText(text: string): HTMLElement | null;
  getByText(text: string): HTMLElement;
  queryAllByLabelText(text: string): HTMLElement[];
  queryByLabelText(text: string): HTMLElement | null;
  getByLabelText(text: string): HTMLElement;
  getAllByRole(role: string): HTMLElement[];
}

function normalizeText(text: string | null): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function normalizeRole(role: string): string {
  return role.replace(/\"/g, "\\\"");
}

const implicitRoleSelectors: Record<string, string[]> = {
  button: ["button"],
};

function collectNodesByRole(root: Element, role: string): HTMLElement[] {
  const normalizedRole = normalizeRole(role);
  const selectors = [`[role="${normalizedRole}"]`, ...(implicitRoleSelectors[normalizedRole] ?? [])];
  const seen = new Set<HTMLElement>();

  const addNode = (node: HTMLElement | null) => {
    if (node != null) {
      seen.add(node);
    }
  };

  if ((root as HTMLElement).matches?.(`[role="${normalizedRole}"]`)) {
    addNode(root as HTMLElement);
  }

  for (const selector of selectors) {
    for (const node of root.querySelectorAll<HTMLElement>(selector)) {
      addNode(node);
    }
  }

  return Array.from(seen);
}

function collectNodesByText(root: Element, text: string): HTMLElement[] {
  const normalized = normalizeText(text);
  const matches: HTMLElement[] = [];
  if (normalizeText(root.textContent) === normalized) {
    matches.push(root as HTMLElement);
  }

  matches.push(...Array.from(root.querySelectorAll<HTMLElement>("*")).filter((node) => {
    return normalizeText(node.textContent ?? "") === normalized;
  }));

  return matches;
}

function collectNodesByLabelText(root: Element, text: string): HTMLElement[] {
  const normalized = normalizeText(text);
  const labels = collectNodesByText(root, normalized)
    .filter((node): node is HTMLElement => node.tagName.toLowerCase() === "label");

  const matches: HTMLElement[] = [];
  for (const label of labels) {
    const targetId = label.getAttribute("for");
    if (targetId) {
      const target = root.ownerDocument.getElementById(targetId);
      if (target) {
        matches.push(target as HTMLElement);
        continue;
      }
    }

    const control = label.querySelector<HTMLElement>("input,button,select,textarea");
    if (control) {
      matches.push(control);
      continue;
    }
  }

  if (matches.length === 0) {
    const aria = Array.from(root.querySelectorAll<HTMLElement>(`[aria-label="${normalizeRole(normalized)}"]`));
    matches.push(...aria);
  }

  return matches;
}

export function within(root: Element): WithinResult {
  return {
    queryAllByRole(role) {
      return collectNodesByRole(root, role);
    },
    queryByRole(role) {
      return collectNodesByRole(root, role)[0] ?? null;
    },
    getByRole(role) {
      const value = collectNodesByRole(root, role);
      if (value[0] == null) {
        throw new Error(`Unable to find an element with the role '${role}'.`);
      }

      return value[0];
    },
    queryAllByText(text) {
      const list = [root as HTMLElement, ...collectNodesByText(root, text)];
      const map = new Set<HTMLElement>();
      for (const node of list) {
        map.add(node);
      }

      return Array.from(map);
    },
    queryByText(text) {
      return collectNodesByText(root, text)[0] ?? null;
    },
    getByText(text) {
      const value = collectNodesByText(root, text);
      if (value[0] == null) {
        throw new Error(`Unable to find element with text '${text}'.`);
      }

      return value[0];
    },
    queryAllByLabelText(text) {
      return collectNodesByLabelText(root, text);
    },
    queryByLabelText(text) {
      return collectNodesByLabelText(root, text)[0] ?? null;
    },
    getByLabelText(text) {
      const value = collectNodesByLabelText(root, text);
      if (value[0] == null) {
        throw new Error(`Unable to find an element with label text '${text}'.`);
      }

      return value[0];
    },
    getAllByRole(role) {
      const value = collectNodesByRole(root, role);
      if (value.length === 0) {
        throw new Error(`Unable to find elements with the role '${role}'.`);
      }

      return value;
    },
  };
}

export function act<T>(callback: () => T | Promise<T>): T | Promise<T> {
  return callback();
}

export async function waitFor<T>(callback: () => T | Promise<T>, timeout = 200, interval = 5): Promise<T> {
  const startedAt = Date.now();
  let lastError: unknown = null;

  while (Date.now() - startedAt <= timeout) {
    try {
      const next = callback();
      return await Promise.resolve(next);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw lastError ?? new Error("Timed out while waiting for assertion");
}
