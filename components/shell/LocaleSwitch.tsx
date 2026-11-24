'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { isMenuKey, nextMenuIndex } from '@/lib/menu';
import { LOCALE_NAMES } from '@/lib/routes';

type LocaleSwitchProps = { locale: Locale; onChange: (locale: Locale) => void };

const OPTIONS = routing.locales;

/**
 * Shows only the active language; the trigger opens a listbox with every configured locale,
 * each labelled with its own native name. Adding a locale to `lib/routes.ts` adds it here.
 * The same control sits in the shell and in the case study header (#98); it opens with a CSS
 * animation rather than Framer Motion, so the server-rendered case study does not ship the library.
 */
export function LocaleSwitch({ locale, onChange }: LocaleSwitchProps) {
  const t = useTranslations('locale');
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const openMenu = (index = OPTIONS.indexOf(locale)) => {
    setHighlight(index);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (option: Locale) => {
    close(true);
    onChange(option);
  };

  // Keep DOM focus on the highlighted option, so screen readers announce it.
  useEffect(() => {
    if (open && highlight >= 0) optionRefs.current[highlight]?.focus();
  }, [open, highlight]);

  // A press anywhere outside closes the menu without stealing focus from what was pressed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    // Claimed here so the window-level view navigation does not also react.
    event.preventDefault();
    openMenu(event.key === 'ArrowUp' ? OPTIONS.length - 1 : OPTIONS.indexOf(locale));
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const key = event.key;
    if (isMenuKey(key)) {
      setHighlight((current) => nextMenuIndex(current, key, OPTIONS.length));
    } else if (key === 'Enter' || key === ' ') {
      const option = OPTIONS[highlight];
      if (option) select(option);
    } else if (key === 'Escape') {
      close(true);
    } else if (key === 'Tab') {
      setOpen(false);
      return;
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      // Inside the menu the arrows belong to it, not to the view navigation.
    } else {
      return;
    }
    event.preventDefault();
  };

  // Focus leaving the widget (Tab, or a click elsewhere that moves focus) closes the menu.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <div ref={rootRef} data-keep-focus className="relative text-small select-none" onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className="flex min-h-[2.8rem] min-w-[2.8rem] items-center justify-center gap-1.5 text-ink"
      >
        <span className="sr-only">{t('label')}: </span>
        <span className="link-underline">{t(locale)}</span>
        <span
          aria-hidden
          className={cn('text-label text-muted transition-transform duration-300 ease-out-expo', open && 'rotate-180')}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('label')}
          onKeyDown={onListKeyDown}
          className="absolute top-full right-0 z-30 mt-1 min-w-[10rem] origin-top-right menu-in rounded-xl border border-line bg-paper p-1 shadow-lg"
        >
          {OPTIONS.map((option, index) => (
            <li
              key={option}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="option"
              aria-selected={option === locale}
              lang={option}
              tabIndex={-1}
              onClick={() => select(option)}
              onPointerMove={() => setHighlight(index)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 outline-none',
                index === highlight && 'bg-line/60',
                option === locale ? 'text-ink' : 'text-muted',
              )}
            >
              <span>{LOCALE_NAMES[option]}</span>
              <span aria-hidden className="font-mono text-label text-muted">
                {t(option)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
