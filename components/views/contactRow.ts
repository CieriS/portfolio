/**
 * Layout shared by every row of the contact list (links and the CV request), so they line up.
 * On phones the detail sits under the name, so each row still says what it holds (#134); from
 * `sm` it moves to the right, next to the arrow.
 */
export const ROW =
  'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-5 text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] md:py-7';
export const ROW_LABEL =
  'col-start-1 row-start-1 text-[clamp(1.75rem,4vw,3.75rem)] leading-none font-medium tracking-[-0.04em] transition-transform duration-700 ease-out-expo select-none group-hover:translate-x-3';
export const ROW_DETAIL =
  'col-start-1 row-start-2 mt-2 font-mono text-[11px] tracking-[0.14em] text-muted uppercase sm:col-start-2 sm:row-start-1 sm:mt-0';
export const ROW_ICON = 'col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1';
