'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import {
  checkCvInput,
  fileNameFrom,
  LINK_HOURS,
  splitAtPlaceholder,
  statusFromCode,
  type CvAnswer,
  type CvInputProblem,
} from '@/lib/cv/common';
import type { PortfolioView } from '@/lib/portfolio';
import { ROW, ROW_DETAIL, ROW_ICON, ROW_LABEL } from './contactRow';
import { RoundIcon } from '@/components/ui/RoundIcon';

type Method = 'email' | 'password';
type Status = 'idle' | 'pending' | 'downloaded' | CvAnswer | CvInputProblem;

/** Problems of the field itself, found before sending: they mark the field, not just the message. */
const FIELD_PROBLEMS: ReadonlySet<Status> = new Set<Status>(['emptyEmail', 'badEmail', 'emptyPassword']);

/**
 * The CV is not public: it carries a phone number. Visitors leave an email address and get a
 * signed download link there; the owner types the password and downloads it at once.
 */
export function CvRequest({ data }: { data: PortfolioView }) {
  const copy = data.content.ui.cv;
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>('email');
  const [status, setStatus] = useState<Status>('idle');
  // The owner can check what was typed: a pasted password with a stray space is refused as wrong.
  const [revealed, setRevealed] = useState(false);
  const panelId = useId();
  const fieldId = useId();
  const statusId = useId();
  const fieldRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get(method) ?? '');
    // Checked here, in the page's own words and language, instead of by the browser's bubble.
    const problem = checkCvInput(method, value);
    if (problem) {
      setStatus(problem);
      fieldRef.current?.focus();
      return;
    }
    const body =
      method === 'email'
        ? { method, locale: data.locale, email: value.trim(), website: form.get('website') }
        : { method, locale: data.locale, password: value };

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
        setStatus(statusFromCode(response.status));
      }
    } catch {
      setStatus('failed');
    }
  };

  const message = status === 'idle' || status === 'pending' ? '' : copy[status].replace('{hours}', String(LINK_HOURS));
  // A refused email says where else to write: the placeholder becomes a real link (#136).
  const [before, after] = splitAtPlaceholder(message, 'linkedin');
  const linkedin = data.shared.contacts.find((contact) => contact.id === 'linkedin');

  return (
    <li className="border-t border-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={ROW}
      >
        <span className={ROW_LABEL}>{copy.label}</span> <span className={ROW_DETAIL}>{copy.handle}</span>
        <RoundIcon active={open} hover="border" className={cn(ROW_ICON, open && 'rotate-180')}>
          ↓
        </RoundIcon>
      </button>

      <div id={panelId} hidden={!open} className="pb-8">
        <p className="max-w-xl text-body leading-relaxed text-muted">{copy.note}</p>

        <div role="group" aria-label={copy.title} className="mt-6 flex gap-2">
          {(['email', 'password'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={method === option}
              onClick={() => {
                setMethod(option);
                setRevealed(false);
                setStatus('idle');
              }}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-label tracking-label uppercase transition-colors',
                method === option ? 'border-ink bg-ink text-paper' : 'border-line text-muted hover:border-ink hover:text-ink',
              )}
            >
              {option === 'email' ? copy.byEmail : copy.byPassword}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor={fieldId} className="font-mono text-label tracking-label text-muted uppercase">
              {method === 'email' ? copy.email : copy.password}
            </label>
            {/* Focus: the line turns ink and doubles to 2 px, like the outline elsewhere a change of shape
                and not of colour only (#147); `-mb-px` keeps the row from shifting. */}
            <div className="flex items-end gap-4 border-b border-line focus-within:-mb-px focus-within:border-b-2 focus-within:border-ink">
              <input
                key={method}
                id={fieldId}
                name={method}
                ref={fieldRef}
                type={method === 'password' && revealed ? 'text' : method}
                aria-required
                aria-invalid={FIELD_PROBLEMS.has(status) || undefined}
                aria-describedby={statusId}
                onChange={() => FIELD_PROBLEMS.has(status) && setStatus('idle')}
                autoComplete={method === 'email' ? 'email' : 'current-password'}
                maxLength={method === 'email' ? 254 : 256}
                className="min-w-0 flex-1 bg-transparent py-2 text-lg outline-none"
              />
              {method === 'password' && (
                <button
                  type="button"
                  onClick={() => setRevealed((value) => !value)}
                  aria-controls={fieldId}
                  className="pb-2.5 font-mono text-label tracking-label text-muted uppercase transition-colors hover:text-ink"
                >
                  {revealed ? copy.hidePassword : copy.showPassword}
                </button>
              )}
            </div>
          </div>
          {method === 'email' && (
            // Honeypot: off-screen and out of the tab order, so only bots fill it in.
            <div aria-hidden className="absolute -left-[9999px]">
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
          )}
          <button
            type="submit"
            disabled={status === 'pending'}
            className="rounded-full border border-ink bg-ink px-6 py-2.5 text-body text-paper transition-opacity disabled:opacity-50"
          >
            {status === 'pending' ? copy.pending : method === 'email' ? copy.send : copy.download}
          </button>
        </form>

        <p id={statusId} role="status" className="mt-4 min-h-6 text-body">
          {after === null || !linkedin ? (
            message
          ) : (
            <>
              {before}
              <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {linkedin.label}
              </a>
              {after}
            </>
          )}
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
