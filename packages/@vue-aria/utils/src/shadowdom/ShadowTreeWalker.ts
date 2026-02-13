import { nodeContains } from "./DOMFunctions";
import { shadowDOM } from "@vue-aria/flags";

export class ShadowTreeWalker implements TreeWalker {
  public readonly filter: NodeFilter | null;
  public readonly root: Node;
  public readonly whatToShow: number;

  private _doc: Document;
  private _walkerStack: Array<TreeWalker> = [];
  private _currentNode: Node;
  private _currentSetFor: Set<TreeWalker> = new Set();

  constructor(doc: Document, root: Node, whatToShow?: number, filter?: NodeFilter | null) {
    this._doc = doc;
    this.root = root;
    this.filter = filter ?? null;
    this.whatToShow = whatToShow ?? NodeFilter.SHOW_ALL;
    this._currentNode = root;

    this._walkerStack.unshift(doc.createTreeWalker(root, whatToShow, this._acceptNode));

    const shadowRoot = (root as Element).shadowRoot;
    if (shadowRoot) {
      const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, { acceptNode: this._acceptNode });
      this._walkerStack.unshift(walker);
    }
  }

  private _acceptNode = (node: Node): number => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const shadowRoot = (node as Element).shadowRoot;

      if (shadowRoot) {
        const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, { acceptNode: this._acceptNode });
        this._walkerStack.unshift(walker);
        return NodeFilter.FILTER_ACCEPT;
      }

      if (typeof this.filter === "function") {
        return this.filter(node);
      }

      if (this.filter?.acceptNode) {
        return this.filter.acceptNode(node);
      }

      if (this.filter === null) {
        return NodeFilter.FILTER_ACCEPT;
      }
    }

    return NodeFilter.FILTER_SKIP;
  };

  public get currentNode(): Node {
    return this._currentNode;
  }

  public set currentNode(node: Node) {
    if (!nodeContains(this.root, node)) {
      throw new Error("Cannot set currentNode to a node that is not contained by the root node.");
    }

    const walkers: TreeWalker[] = [];
    let curNode: Node | null | undefined = node;
    let currentWalkerCurrentNode = node;

    this._currentNode = node;

    while (curNode && curNode !== this.root) {
      if (curNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        const shadowRoot = curNode as ShadowRoot;
        const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, { acceptNode: this._acceptNode });

        walkers.push(walker);
        walker.currentNode = currentWalkerCurrentNode;

        this._currentSetFor.add(walker);
        curNode = currentWalkerCurrentNode = shadowRoot.host;
      } else {
        curNode = curNode.parentNode;
      }
    }

    const walker = this._doc.createTreeWalker(this.root, this.whatToShow, { acceptNode: this._acceptNode });
    walkers.push(walker);
    walker.currentNode = currentWalkerCurrentNode;

    this._currentSetFor.add(walker);
    this._walkerStack = walkers;
  }

  public get doc(): Document {
    return this._doc;
  }

  public firstChild(): Node | null {
    const currentNode = this.currentNode;
    const newNode = this.nextNode();
    if (!nodeContains(currentNode, newNode)) {
      this.currentNode = currentNode;
      return null;
    }
    if (newNode) {
      this.currentNode = newNode;
    }
    return newNode;
  }

  public lastChild(): Node | null {
    const walker = this._walkerStack[0];
    const newNode = walker.lastChild();
    if (newNode) {
      this.currentNode = newNode;
    }
    return newNode;
  }

  public nextNode(): Node | null {
    const nextNode = this._walkerStack[0].nextNode();

    if (nextNode) {
      const shadowRoot = (nextNode as Element).shadowRoot;
      if (shadowRoot) {
        let nodeResult: number | undefined;

        if (typeof this.filter === "function") {
          nodeResult = this.filter(nextNode);
        } else if (this.filter?.acceptNode) {
          nodeResult = this.filter.acceptNode(nextNode);
        }

        if (nodeResult === NodeFilter.FILTER_ACCEPT) {
          this.currentNode = nextNode;
          return nextNode;
        }

        const newNode = this.nextNode();
        if (newNode) {
          this.currentNode = newNode;
        }
        return newNode;
      }

      this.currentNode = nextNode;
      return nextNode;
    }

    if (this._walkerStack.length > 1) {
      this._walkerStack.shift();
      const newNode = this.nextNode();
      if (newNode) {
        this.currentNode = newNode;
      }
      return newNode;
    }

    return null;
  }

  public previousNode(): Node | null {
    const currentWalker = this._walkerStack[0];

    if (currentWalker.currentNode === currentWalker.root) {
      if (this._currentSetFor.has(currentWalker)) {
        this._currentSetFor.delete(currentWalker);

        if (this._walkerStack.length > 1) {
          this._walkerStack.shift();
          const newNode = this.previousNode();
          if (newNode) {
            this.currentNode = newNode;
          }
          return newNode;
        }

        return null;
      }

      return null;
    }

    const previousNode = currentWalker.previousNode();

    if (previousNode) {
      const shadowRoot = (previousNode as Element).shadowRoot;
      if (shadowRoot) {
        let nodeResult: number | undefined;

        if (typeof this.filter === "function") {
          nodeResult = this.filter(previousNode);
        } else if (this.filter?.acceptNode) {
          nodeResult = this.filter.acceptNode(previousNode);
        }

        if (nodeResult === NodeFilter.FILTER_ACCEPT) {
          this.currentNode = previousNode;
          return previousNode;
        }

        const newNode = this.lastChild();
        if (newNode) {
          this.currentNode = newNode;
        }
        return newNode;
      }

      this.currentNode = previousNode;
      return previousNode;
    }

    if (this._walkerStack.length > 1) {
      this._walkerStack.shift();
      const newNode = this.previousNode();
      if (newNode) {
        this.currentNode = newNode;
      }
      return newNode;
    }

    return null;
  }

  public nextSibling(): Node | null {
    return null;
  }

  public previousSibling(): Node | null {
    return null;
  }

  public parentNode(): Node | null {
    return null;
  }
}

export function createShadowTreeWalker(
  doc: Document,
  root: Node,
  whatToShow?: number,
  filter?: NodeFilter | null
): TreeWalker {
  if (shadowDOM()) {
    return new ShadowTreeWalker(doc, root, whatToShow, filter);
  }

  return doc.createTreeWalker(root, whatToShow, filter);
}
