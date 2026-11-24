'use client';

import { useParams } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { errorCopy } from '@/lib/errorCopy';
import { RoundIcon } from '@/components/ui/RoundIcon';

/**
 * Boundary for the views. It sits below the locale layout, so the canvas, the theme and
 * the fonts survive; only the page body is replaced. Copy comes from `lib/errorCopy.ts`: this
 * renders above `NextIntlClientProvider`, where `useTranslations` is not available yet, and
 * it must not import the full content bundle into the browser.
 */
export default function ViewError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale: string }>();
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const copy = errorCopy(locale);

  return (
    <main className="relative z-10 flex h-dvh flex-col justify-between px-frame py-6 md:py-10">
      <p className="font-mono text-label tracking-label text-muted uppercase select-none">500</p>
      <div>
        <h1 className="text-title font-medium">{copy.title}</h1>
        <p className="mt-6 max-w-md text-body leading-relaxed text-muted">{copy.body}</p>
        <button type="button" onClick={reset} className="group mt-10 inline-flex items-center gap-4 text-body">
          <span className="link-underline">{copy.cta}</span>
          <RoundIcon>↻</RoundIcon>
        </button>
      </div>
    </main>
  );
}
