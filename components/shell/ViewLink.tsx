'use client';

import { useLocale } from 'next-intl';
import type { ComponentProps, MouseEvent } from 'react';
import type { Locale } from '@/i18n/routing';
import { pathFor, type ViewId } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';

type ViewLinkProps = Omit<ComponentProps<'a'>, 'href'> & { view: ViewId; fragment?: string };

/**
 * Real, crawlable link to a view URL; a plain primary click swaps the view in place instead of navigating.
 * A `fragment` names a section of that view (`#contacts`): it is written to the address bar, and
 * the view reads it on mount to bring that section into view.
 */
export function ViewLink({ view, fragment, onClick, ...props }: ViewLinkProps) {
  const locale = useLocale() as Locale;
  const setView = useViewStore((state) => state.setView);
  const href = fragment ? `${pathFor(locale, view)}#${fragment}` : pathFor(locale, view);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Let the browser handle new tab/window, downloads and non-primary buttons.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    // Before the view changes: the URL sync leaves an address alone when its path already matches.
    if (fragment) window.history.pushState(null, '', href);
    setView(view);
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
