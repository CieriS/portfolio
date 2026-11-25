'use client';

import { LocaleSwitch } from '@/components/shell/LocaleSwitch';
import type { Locale } from '@/i18n/routing';
import { localeCookie } from '@/lib/localeCookie';
import { caseStudyPath, type CaseStudyId } from '@/lib/routes';

/**
 * The shell's language menu on a case study (#98). A case study is a server page, not a view,
 * so picking a language is a real navigation to the same study in that language.
 */
export function CaseStudyLocaleSwitch({ locale, id }: { locale: Locale; id: CaseStudyId }) {
  return (
    <LocaleSwitch
      locale={locale}
      onChange={(next) => {
        if (next === locale) return;
        document.cookie = localeCookie(next, window.location.protocol === 'https:');
        window.location.assign(caseStudyPath(next, id));
      }}
    />
  );
}
