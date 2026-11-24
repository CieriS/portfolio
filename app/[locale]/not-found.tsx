import { hasLocale } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getPortfolioBundle } from '@/lib/portfolio';

export default async function NotFound() {
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const copy = getPortfolioBundle().contents[locale].ui.notFound;

  return (
    <main className="relative z-10 flex h-dvh flex-col justify-between px-frame py-6 md:py-10">
      <p className="font-mono text-label tracking-label text-muted uppercase select-none">404</p>
      <div>
        <h1 className="text-title font-medium">{copy.title}</h1>
        <p className="mt-6 max-w-md text-body leading-relaxed text-muted">{copy.body}</p>
        <a href={`/${locale}`} className="group mt-10 inline-flex items-center gap-4 text-body">
          <span className="link-underline">{copy.cta}</span>
          <span aria-hidden className="grid size-10 place-items-center rounded-full border border-line">
            →
          </span>
        </a>
      </div>
    </main>
  );
}
