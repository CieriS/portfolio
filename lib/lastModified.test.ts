import { describe, expect, it } from 'vitest';
import { caseStudySources, lastModified, viewSources } from './lastModified';

describe('lastModified (#176)', () => {
  it('uses the date of the last commit on the files', () => {
    expect(lastModified(['a'], () => '2026-11-20', '2026-11-24')).toBe('2026-11-20');
  });

  it('falls back to the build date without git or with an unexpected answer', () => {
    expect(lastModified(['a'], () => null, '2026-11-24')).toBe('2026-11-24');
    expect(lastModified(['a'], () => 'fatal: not a git repository', '2026-11-24')).toBe('2026-11-24');
  });

  it('passes the page sources to git', () => {
    let asked: string[] = [];
    lastModified(caseStudySources('it', 'ariaer'), (files) => ((asked = files), null), '2026-11-24');
    expect(asked).toEqual(['data/shared.json', 'data/locales/it.json', 'data/case-studies/ariaer.json']);
    expect(viewSources('en')).toEqual(['data/shared.json', 'data/locales/en.json']);
  });
});
