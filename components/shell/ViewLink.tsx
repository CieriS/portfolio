'use client';

import { useLocale } from 'next-intl';
import type { ComponentProps, MouseEvent } from 'react';
import type { Locale } from '@/i18n/routing';
import { pathFor, type ViewId } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';

type ViewLinkProps = Omit<ComponentProps<'a'>, 'href'> & { view: ViewId };

/** Real, crawlable link to a view URL; a plain primary click swaps the view in place instead of navigating. */
export function ViewLink({ view, onClick, ...props }: ViewLinkProps) {
  const locale = useLocale() as Locale;
  const setView = useViewStore((state) => state.setView);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // Let the browser handle new tab/window, downloads and non-primary buttons.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setView(view);
  };

  return <a {...props} href={pathFor(locale, view)} onClick={handleClick} />;
}
