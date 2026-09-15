'use client';

import { useTranslations } from 'next-intl';
import { Fragment, type MouseEvent } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { pathFor } from '@/lib/views';
import { useViewStore } from '@/store/viewStore';

type LocaleSwitchProps = { locale: Locale; onChange: (locale: Locale) => void };

export function LocaleSwitch({ locale, onChange }: LocaleSwitchProps) {
  const t = useTranslations('locale');
  const active = useViewStore((state) => state.active);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, option: Locale) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onChange(option);
  };

  return (
    <nav aria-label={t('label')} className="flex select-none items-center gap-1.5 text-[13px]">
      {routing.locales.map((option, index) => (
        <Fragment key={option}>
          {index > 0 && (
            <span aria-hidden className="text-muted">
              /
            </span>
          )}
          {/* Real hreflang link to the same view in the other language; swapped in place on click. */}
          <a
            href={pathFor(option, active)}
            hrefLang={option}
            lang={option}
            aria-current={option === locale ? 'true' : undefined}
            onClick={(event) => handleClick(event, option)}
            className={cn('select-none py-2 transition-colors duration-300', option === locale ? 'text-ink' : 'text-muted hover:text-ink')}
          >
            {t(option)}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}
