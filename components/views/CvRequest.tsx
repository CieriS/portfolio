'use client';

import { useId, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { fileNameFrom, LINK_HOURS } from '@/lib/cv/common';
import type { PortfolioView } from '@/lib/portfolio';

type Method = 'email' | 'password';
type Status = 'idle' | 'pending' | 'sent' | 'downloaded' | 'invalid' | 'denied' | 'unavailable' | 'failed';

/** What the API answers (see app/api/cv/route.ts), mapped to the message shown. */
const STATUS_BY_CODE: Record<number, Status> = { 202: 'sent', 400: 'invalid', 403: 'denied', 503: 'unavailable' };

/**
 * The CV is not public: it carries a phone number. Visitors leave an email address and get a
 * signed download link there; the owner types the password and downloads it at once.
 */
export function CvRequest({ data }: { data: PortfolioView }) {
  const copy = data.content.ui.cv;
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>('email');
  const [status, setStatus] = useState<Status>('idle');
  const panelId = useId();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body =
      method === 'email'
        ? { method, locale: data.locale, email: form.get('email'), website: form.get('website') }
        : { method, locale: data.locale, password: form.get('password') };

    setStatus('pending');
    try {
      const response = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok && method === 'password') {
        saveFile(await response.blob(), fileNameFrom(response.headers.get('Content-Disposition')));
        setStatus('downloaded');
      } else {
        setStatus(STATUS_BY_CODE[response.status] ?? 'failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  const message = status === 'idle' || status === 'pending' ? '' : copy[status].replace('{hours}', String(LINK_HOURS));

  return (
    <li className="border-t border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center justify-between gap-6 py-5 text-left md:py-7"
      >
        <span className="text-[clamp(1.75rem,4vw,3.75rem)] leading-none font-medium tracking-[-0.04em] transition-transform duration-700 ease-out-expo select-none group-hover:translate-x-3">
          {copy.label}
        </span>
        <span className="flex items-center gap-5">
          <span className="hidden font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:inline">{copy.handle}</span>
          <span
            aria-hidden
            className={cn(
              'grid size-10 place-items-center rounded-full border border-line transition-all duration-500 ease-out-expo select-none',
              open ? 'rotate-180 border-ink bg-ink text-paper' : 'group-hover:border-ink',
            )}
          >
            ↓
          </span>
        </span>
      </button>

      <div id={panelId} hidden={!open} className="pb-8">
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">{copy.note}</p>

        <div role="group" aria-label={copy.title} className="mt-6 flex gap-2">
          {(['email', 'password'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={method === option}
              onClick={() => {
                setMethod(option);
                setStatus('idle');
              }}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors',
                method === option ? 'border-ink bg-ink text-paper' : 'border-line text-muted hover:border-ink hover:text-ink',
              )}
            >
              {option === 'email' ? copy.byEmail : copy.byPassword}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
              {method === 'email' ? copy.email : copy.password}
            </span>
            <input
              key={method}
              name={method}
              type={method}
              required
              autoComplete={method === 'email' ? 'email' : 'current-password'}
              maxLength={method === 'email' ? 254 : 256}
              className="border-b border-line bg-transparent py-2 text-lg outline-none focus-visible:border-ink"
            />
          </label>
          {method === 'email' && (
            // Honeypot: off-screen and out of the tab order, so only bots fill it in.
            <div aria-hidden className="absolute -left-[9999px]">
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
          )}
          <button
            type="submit"
            disabled={status === 'pending'}
            className="rounded-full border border-ink bg-ink px-6 py-2.5 text-[15px] text-paper transition-opacity disabled:opacity-50"
          >
            {status === 'pending' ? copy.pending : method === 'email' ? copy.send : copy.download}
          </button>
        </form>

        <p role="status" className="mt-4 min-h-6 text-[15px]">
          {message}
        </p>
      </div>
    </li>
  );
}

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  // Revoked on the next task: some browsers cancel a download whose URL dies synchronously.
  setTimeout(() => URL.revokeObjectURL(url));
}
