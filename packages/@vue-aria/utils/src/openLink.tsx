/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getCurrentInstance, inject, provide} from 'vue';

import {focusWithoutScrolling} from './focusWithoutScrolling';
import {isFirefox, isIPad, isMac, isWebKit} from './platform';

export type Href = string;

export interface RouterOptions {
  [key: string]: unknown;
}

export interface LinkDOMProps {
  href?: Href;
  target?: string;
  rel?: string;
  download?: string;
  ping?: string;
  referrerPolicy?: string;
}

export interface SyntheticLinkDOMAttributes {
  'data-href'?: string;
  'data-target'?: string;
  'data-rel'?: string;
  'data-download'?: string;
  'data-ping'?: string;
  'data-referrer-policy'?: string;
}

interface Router {
  isNative: boolean;
  open: (target: Element, modifiers: Modifiers, href: Href, routerOptions: RouterOptions | undefined) => void;
  useHref: (href: Href) => string;
}

const defaultRouter: Router = {
  isNative: true,
  open: openSyntheticLink,
  useHref: (href) => href
};

const routerSymbol = Symbol('vue-aria-router');

interface RouterProviderProps {
  navigate: (path: Href, routerOptions: RouterOptions | undefined) => void;
  useHref?: (href: Href) => string;
}

/**
 * A RouterProvider accepts a `navigate` function from a framework or client-side router,
 * and provides it to nested Vue Aria link helpers to enable client-side navigation.
 */
export function RouterProvider(props: RouterProviderProps): Router {
  let {navigate, useHref} = props;

  let ctx: Router = {
    isNative: false,
    open: (target: Element, modifiers: Modifiers, href: Href, routerOptions: RouterOptions | undefined) => {
      getSyntheticLink(target, (link) => {
        if (shouldClientNavigate(link, modifiers)) {
          navigate(href, routerOptions);
        } else {
          openLink(link, modifiers);
        }
      });
    },
    useHref: useHref || ((href) => href)
  };

  if (getCurrentInstance()) {
    provide(routerSymbol, ctx);
  }

  return ctx;
}

export function useRouter(): Router {
  return inject(routerSymbol, defaultRouter);
}

interface Modifiers {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export function shouldClientNavigate(link: HTMLAnchorElement, modifiers: Modifiers): boolean {
  if (typeof location === 'undefined') {
    return false;
  }

  // Use getAttribute here instead of link.target.
  let target = link.getAttribute('target');
  return (
    (!target || target === '_self') &&
    link.origin === location.origin &&
    !link.hasAttribute('download') &&
    !modifiers.metaKey && // open in new tab (mac)
    !modifiers.ctrlKey && // open in new tab (windows)
    !modifiers.altKey && // download
    !modifiers.shiftKey
  );
}

type OpenLinkFn = (target: HTMLAnchorElement, modifiers: Modifiers, setOpening?: boolean) => void;
type OpenLinkWithState = OpenLinkFn & {isOpening: boolean};

export const openLink: OpenLinkWithState = ((target: HTMLAnchorElement, modifiers: Modifiers, setOpening = true) => {
  let {metaKey, ctrlKey, altKey, shiftKey} = modifiers;

  // Firefox does not recognize keyboard events as a user action by default.
  if (isFirefox() && window.event?.type?.startsWith('key') && target.target === '_blank') {
    if (isMac()) {
      metaKey = true;
    } else {
      ctrlKey = true;
    }
  }

  // WebKit does not support firing click events with modifier keys, but does support keyboard events.
  let event =
    isWebKit() && isMac() && !isIPad() && process.env.NODE_ENV !== 'test'
      ? // keyIdentifier is non-standard, but it's what WebKit expects.
        new KeyboardEvent('keydown', {
          key: 'Enter',
          metaKey,
          ctrlKey,
          altKey,
          shiftKey
        })
      : new MouseEvent('click', {
          metaKey,
          ctrlKey,
          altKey,
          shiftKey,
          detail: 1,
          bubbles: true,
          cancelable: true
        });

  openLink.isOpening = setOpening;
  focusWithoutScrolling(target);
  target.dispatchEvent(event);
  openLink.isOpening = false;
}) as OpenLinkWithState;

// https://github.com/parcel-bundler/parcel/issues/8724
openLink.isOpening = false;

function getSyntheticLink(target: Element, open: (link: HTMLAnchorElement) => void) {
  if (target instanceof HTMLAnchorElement) {
    open(target);
  } else if (target.hasAttribute('data-href')) {
    let link = document.createElement('a');
    link.href = target.getAttribute('data-href')!;
    if (target.hasAttribute('data-target')) {
      link.target = target.getAttribute('data-target')!;
    }
    if (target.hasAttribute('data-rel')) {
      link.rel = target.getAttribute('data-rel')!;
    }
    if (target.hasAttribute('data-download')) {
      link.download = target.getAttribute('data-download')!;
    }
    if (target.hasAttribute('data-ping')) {
      link.ping = target.getAttribute('data-ping')!;
    }
    if (target.hasAttribute('data-referrer-policy')) {
      link.referrerPolicy = target.getAttribute('data-referrer-policy')!;
    }
    target.appendChild(link);
    open(link);
    target.removeChild(link);
  }
}

function openSyntheticLink(target: Element, modifiers: Modifiers) {
  getSyntheticLink(target, (link) => openLink(link, modifiers));
}

export function useSyntheticLinkProps(props: LinkDOMProps): SyntheticLinkDOMAttributes {
  let router = useRouter();
  let href = router.useHref(props.href ?? '');
  return {
    'data-href': props.href ? href : undefined,
    'data-target': props.target,
    'data-rel': props.rel,
    'data-download': props.download,
    'data-ping': props.ping,
    'data-referrer-policy': props.referrerPolicy
  };
}

/** @deprecated - For backward compatibility. */
export function getSyntheticLinkProps(props: LinkDOMProps): SyntheticLinkDOMAttributes {
  return {
    'data-href': props.href,
    'data-target': props.target,
    'data-rel': props.rel,
    'data-download': props.download,
    'data-ping': props.ping,
    'data-referrer-policy': props.referrerPolicy
  };
}

export function useLinkProps(props?: LinkDOMProps): LinkDOMProps {
  let router = useRouter();
  let href = router.useHref(props?.href ?? '');
  return {
    href: props?.href ? href : undefined,
    target: props?.target,
    rel: props?.rel,
    download: props?.download,
    ping: props?.ping,
    referrerPolicy: props?.referrerPolicy
  };
}

interface LinkClickEvent extends MouseEvent {
  currentTarget: EventTarget & HTMLAnchorElement;
  isDefaultPrevented?: () => boolean;
}

export function handleLinkClick(
  event: LinkClickEvent,
  router: Router,
  href: Href | undefined,
  routerOptions: RouterOptions | undefined
): void {
  let isDefaultPrevented =
    typeof event.isDefaultPrevented === 'function' ? event.isDefaultPrevented() : event.defaultPrevented;

  // If a custom router is provided, prevent default and forward if this link should client navigate.
  if (
    !router.isNative &&
    event.currentTarget instanceof HTMLAnchorElement &&
    event.currentTarget.href &&
    !isDefaultPrevented &&
    shouldClientNavigate(event.currentTarget, event) &&
    href
  ) {
    event.preventDefault();
    router.open(event.currentTarget, event, href, routerOptions);
  }
}
