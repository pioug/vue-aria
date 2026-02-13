import { getCurrentInstance, inject, provide } from "vue";
import { focusWithoutScrolling } from "./focusWithoutScrolling";

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

  if (target.hasAttribute("data-target")) {
    link.target = target.getAttribute("data-target") ?? "";
  }

  if (target.hasAttribute("data-rel")) {
    link.rel = target.getAttribute("data-rel") ?? "";
  }

  if (target.hasAttribute("data-download")) {
    link.download = target.getAttribute("data-download") ?? "";
  }

  if (target.hasAttribute("data-ping")) {
    link.ping = target.getAttribute("data-ping") ?? "";
  }

  if (target.hasAttribute("data-referrer-policy")) {
    link.referrerPolicy = target.getAttribute("data-referrer-policy") ?? "";
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

export interface OpenLinkFn {
  (
    target: HTMLAnchorElement,
    modifiers: Modifiers,
    setOpening?: boolean
  ): void;
  isOpening: boolean;
}

export const openLink: OpenLinkFn = ((
  target: HTMLAnchorElement,
  modifiers: Modifiers,
  setOpening = true
) => {
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

  openLink.isOpening = setOpening;
  try {
    focusWithoutScrolling(target);
    target.dispatchEvent(event);
  } finally {
    openLink.isOpening = false;
  }
}) as OpenLinkFn;

openLink.isOpening = false;

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
    "data-download": props?.download,
    "data-ping": props?.ping,
    "data-referrer-policy": props?.referrerPolicy,
  };
}

export function getSyntheticLinkProps(props?: LinkDOMProps): Record<string, unknown> {
  return {
    "data-href": props?.href,
    "data-target": props?.target,
    "data-rel": props?.rel,
    "data-download": props?.download,
    "data-ping": props?.ping,
    "data-referrer-policy": props?.referrerPolicy,
  };
}
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
