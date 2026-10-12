'use client';

import { useLocale } from 'next-intl';
import type { ComponentProps, MouseEvent } from 'react';
import type { Locale } from '@/i18n/routing';
import { isCaseStudyId, projectPath } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';

type ProjectLinkProps = Omit<ComponentProps<'a'>, 'href'> & { project: string };

/**
 * Real link to where a project is told. A case study is a page of its own, so the browser
 * navigates. Otherwise the address is the projects view with the project's id as fragment:
 * a plain primary click writes it to the address bar and swaps the view in place, and the
 * projects view opens the panel named by the fragment.
 */
export function ProjectLink({ project, onClick, ...props }: ProjectLinkProps) {
  const locale = useLocale() as Locale;
  const setView = useViewStore((state) => state.setView);
  const href = projectPath(locale, project);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (isCaseStudyId(project)) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    // Before the view changes: the URL sync leaves an address alone when its path already matches.
    window.history.pushState(null, '', href);
    setView('projects');
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
