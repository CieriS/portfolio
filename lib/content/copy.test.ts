import { describe, expect, it } from 'vitest';
import de from '@/data/locales/de.json';
import en from '@/data/locales/en.json';
import es from '@/data/locales/es.json';
import fr from '@/data/locales/fr.json';
import it_ from '@/data/locales/it.json';
import { findCopyIssues, MAX_DESCRIPTION, MAX_TITLE, MIN_UNTRANSLATED } from './copy';

const reference = {
  ui: {
    meta: {
      siteName: 'Site',
      title: 'Home title',
      description: 'A description.',
      views: { hero: { title: 'Hero', description: 'Hero description.' }, about: { title: 'About', description: 'About page.' } },
    },
    sent: 'Valid for {hours} hours.',
  },
  list: ['one', 'two'],
  body: 'x'.repeat(MIN_UNTRANSLATED),
};
/** A well-formed translation: the long body is no longer the English one. */
const clone = () => ({ ...structuredClone(reference), body: 'y'.repeat(MIN_UNTRANSLATED) });
const issuesOf = (copy: unknown, locale = 'it') => findCopyIssues(locale, copy, reference);

describe('findCopyIssues', () => {
  it('accepts a locale with the same shape and different text', () => {
    expect(issuesOf(clone())).toEqual([]);
  });

  it('rejects empty and whitespace-only strings, with locale and path', () => {
    const copy = clone();
    copy.ui.meta.views.about.title = '';
    copy.list[1] = '   ';
    expect(issuesOf(copy)).toEqual(expect.arrayContaining(['it.ui.meta.views.about.title: is empty', 'it.list.1: is empty']));
  });

  it('rejects stray leading or trailing whitespace', () => {
    const copy = clone();
    copy.ui.meta.title = 'Home title ';
    expect(issuesOf(copy)).toEqual(['it.ui.meta.title: has leading or trailing whitespace']);
  });

  it('rejects a missing key and an extra one', () => {
    const missing: Partial<ReturnType<typeof clone>> = clone();
    delete missing.list;
    expect(issuesOf(missing).join('\n')).toMatch(/^it\.list: /m);
    expect(issuesOf({ ...clone(), extra: 'x' }).join('\n')).toMatch(/extra/);
  });

  it('rejects a list of a different length', () => {
    expect(issuesOf({ ...clone(), list: ['one'] }).length).toBeGreaterThan(0);
  });

  it('requires the same placeholders as the reference', () => {
    const copy = clone();
    copy.ui.sent = 'Valid for {ore} hours.';
    expect(issuesOf(copy)).toEqual(['it.ui.sent: must use the placeholders {hours}']);
    copy.ui.sent = 'Valid for some hours.';
    expect(issuesOf(copy)).toEqual(['it.ui.sent: must use the placeholders {hours}']);
  });

  it('rejects a description longer than a search result shows', () => {
    const copy = clone();
    copy.ui.meta.views.about.description = 'd'.repeat(MAX_DESCRIPTION + 1);
    expect(issuesOf(copy)).toEqual([
      `it.ui.meta.views.about.description: ${MAX_DESCRIPTION + 1} characters, at most ${MAX_DESCRIPTION}`,
    ]);
    copy.ui.meta.views.about.description = 'd'.repeat(MAX_DESCRIPTION);
    expect(issuesOf(copy)).toEqual([]);
  });

  it('measures an inner view title as the tab shows it, with the site name', () => {
    const copy = clone();
    // " — Site" adds 7 characters to every view but the hero.
    copy.ui.meta.views.about.title = 't'.repeat(MAX_TITLE - 7);
    expect(issuesOf(copy)).toEqual([]);
    copy.ui.meta.views.about.title = 't'.repeat(MAX_TITLE - 6);
    expect(issuesOf(copy)).toEqual([`it.ui.meta.views.about.title: ${MAX_TITLE + 1} characters, at most ${MAX_TITLE}`]);
    copy.ui.meta.views.hero.title = 't'.repeat(MAX_TITLE);
    expect(issuesOf(copy)).toHaveLength(1);
  });

  it('flags a long text left in English, but not short shared terms or English itself', () => {
    const copy = { ...clone(), body: reference.body };
    expect(issuesOf(copy)).toEqual([`it.body: identical to en, not translated`]);
    expect(issuesOf(copy, 'en')).toEqual([]);
    // Short strings such as a job title or a product name are legitimately the same.
    expect(issuesOf({ ...clone(), list: ['one', 'two'] })).toEqual([]);
  });
});

describe('the real copy', () => {
  it.each(Object.entries({ en, it: it_, fr, de, es }))('%s passes every rule', (locale, copy) => {
    expect(findCopyIssues(locale, copy, en)).toEqual([]);
  });
});
