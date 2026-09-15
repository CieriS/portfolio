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
      <p className="select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted">404</p>
      <div>
        <h1 className="text-[clamp(3rem,10vw,9rem)] font-medium leading-[0.9] tracking-[-0.05em]">{copy.title}</h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{copy.body}</p>
        <a href={`/${locale}`} className="group mt-10 inline-flex items-center gap-4 text-[15px]">
          <span className="link-underline">{copy.cta}</span>
          <span aria-hidden className="grid size-10 place-items-center rounded-full border border-line">
            →
          </span>
        </a>
      </div>
    </main>
  );
}
