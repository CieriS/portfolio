import en from '@/data/locales/en.json';
import fr from '@/data/locales/fr.json';
import it from '@/data/locales/it.json';
import rawShared from '@/data/shared.json';
import { SharedSchema, type SharedData } from '@/lib/content/schema';
import { findContentIssues } from '@/lib/content/validate';
import type { Locale } from '@/lib/routes';

export {
  THREAD_KINDS,
  type Contact,
  type Phase,
  type Project,
  type ProjectLayer,
  type ProjectSource,
  type Segment,
  type Session,
  type SharedData,
  type Thread,
  type ThreadKind,
} from '@/lib/content/schema';

/** English is the reference shape: every other locale is assigned to it below. */
export type LocaleContent = typeof en;
export type UiMessages = LocaleContent['ui'];
export type PortfolioView = { locale: Locale; shared: SharedData; content: LocaleContent };
export type PortfolioBundle = { shared: SharedData; contents: Record<Locale, LocaleContent> };

/**
 * Three layers of checks, all before the first page is prerendered — a broken content edit
 * fails the build, never a visitor's page:
 * 1. types: a locale missing or renaming a key fails `npm run typecheck` on this assignment;
 * 2. schema: the shared data is parsed with zod (enums, ISO dates, URLs, the source union);
 * 3. cross-checks: copy keyed by shared ids, `*Emphasis` words present in their text.
 */
const contents: Record<Locale, LocaleContent> = { en, it, fr };
const shared: SharedData = SharedSchema.parse(rawShared);

const issues = findContentIssues(shared, contents);
if (issues.length > 0) {
  throw new Error(`Invalid portfolio content:\n- ${issues.join('\n- ')}`);
}

/** Every locale ships to the client so the language swap needs no navigation. */
export function getPortfolioBundle(): PortfolioBundle {
  return { shared, contents };
}

export function getUiMessages(locale: Locale): UiMessages {
  return contents[locale].ui;
}
