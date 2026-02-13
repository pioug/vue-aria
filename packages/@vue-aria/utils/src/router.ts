import { getCurrentInstance, inject, provide } from "vue";

export type Href = string;

export interface RouterOptions {
  [key: string]: unknown;
}

export interface Modifiers {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface Router {
  isNative: boolean;
  open: (
    target: Element,
    modifiers: Modifiers,
    href: Href,
    routerOptions: RouterOptions | undefined
  ) => void;
  useHref: (href: Href) => string;
}

export interface ProvideRouterOptions {
  navigate: (path: Href, routerOptions: RouterOptions | undefined) => void;
  useHref?: (href: Href) => string;
}

export interface LinkDOMProps {
  href?: Href | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  download?: string | boolean | undefined;
  ping?: string | undefined;
  referrerPolicy?: string | undefined;
}

const ROUTER_SYMBOL: unique symbol = Symbol("vue-aria-router");

function getSyntheticLink(
  target: Element,
  open: (link: HTMLAnchorElement) => void
): void {
  if (target instanceof HTMLAnchorElement) {
    open(target);
    return;
  }

  const href = target.getAttribute("data-href");
  if (!href) {
    return;
  }

  const link = document.createElement("a");
  link.href = href;

  const targetAttr = target.getAttribute("data-target");
  if (targetAttr) {
    link.target = targetAttr;
  }

  const rel = target.getAttribute("data-rel");
  if (rel) {
    link.rel = rel;
  }

  const download = target.getAttribute("data-download");
  if (download) {
    link.download = download;
  }

  const ping = target.getAttribute("data-ping");
  if (ping) {
    link.ping = ping;
  }

  const referrerPolicy = target.getAttribute("data-referrer-policy");
  if (referrerPolicy) {
    link.referrerPolicy = referrerPolicy;
  }

  target.appendChild(link);
  open(link);
  target.removeChild(link);
}

export function shouldClientNavigate(
  link: HTMLAnchorElement,
  modifiers: Modifiers
): boolean {
  if (typeof location === "undefined") {
    return false;
  }

  const target = link.getAttribute("target");
  return (
    (!target || target === "_self") &&
    link.origin === location.origin &&
    !link.hasAttribute("download") &&
    !modifiers.metaKey &&
    !modifiers.ctrlKey &&
    !modifiers.altKey &&
    !modifiers.shiftKey
  );
}

export function openLink(target: HTMLAnchorElement, modifiers: Modifiers): void {
  const { metaKey, ctrlKey, altKey, shiftKey } = modifiers;
  const event = new MouseEvent("click", {
    metaKey,
    ctrlKey,
    altKey,
    shiftKey,
    detail: 1,
    bubbles: true,
    cancelable: true,
  });

  target.dispatchEvent(event);
}

function openSyntheticLink(target: Element, modifiers: Modifiers): void {
  getSyntheticLink(target, (link) => openLink(link, modifiers));
}

const defaultRouter: Router = {
  isNative: true,
  open: (target, modifiers) => {
    openSyntheticLink(target, modifiers);
  },
  useHref: (href) => href,
};

export function provideRouter(options: ProvideRouterOptions): Router {
  const router: Router = {
    isNative: false,
    open: (target, modifiers, href, routerOptions) => {
      getSyntheticLink(target, (link) => {
        if (shouldClientNavigate(link, modifiers)) {
          options.navigate(href, routerOptions);
          return;
        }

        openLink(link, modifiers);
      });
    },
    useHref: options.useHref ?? ((href) => href),
  };

  if (getCurrentInstance()) {
    provide(ROUTER_SYMBOL, router);
  }

  return router;
}

export function useRouter(): Router {
  if (!getCurrentInstance()) {
    return defaultRouter;
  }

  return inject<Router>(ROUTER_SYMBOL, defaultRouter);
}

export function useLinkProps(props?: LinkDOMProps): LinkDOMProps {
  const router = useRouter();
  const href = props?.href;
  return {
    href: href ? router.useHref(href) : undefined,
    target: props?.target,
    rel: props?.rel,
    download: props?.download,
    ping: props?.ping,
    referrerPolicy: props?.referrerPolicy,
  };
}

export function useSyntheticLinkProps(props?: LinkDOMProps): Record<string, unknown> {
  const router = useRouter();
  const href = props?.href;
  const resolvedHref = href ? router.useHref(href) : undefined;

  return {
    "data-href": resolvedHref,
    "data-target": props?.target,
    "data-rel": props?.rel,
    "data-download":
      props?.download === undefined ? undefined : String(props.download),
    "data-ping": props?.ping,
    "data-referrer-policy": props?.referrerPolicy,
  };
}

export const getSyntheticLinkProps = useSyntheticLinkProps;
export const RouterProvider = provideRouter;

export function handleLinkClick(
  event: MouseEvent,
  router: Router,
  href: Href | undefined,
  routerOptions: RouterOptions | undefined
): void {
  const target = event.currentTarget;
  if (
    !router.isNative &&
    target instanceof HTMLAnchorElement &&
    target.href &&
    !event.defaultPrevented &&
    shouldClientNavigate(target, event) &&
    href
  ) {
    event.preventDefault();
    router.open(target, event, href, routerOptions);
  }
}
