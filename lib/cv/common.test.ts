import { describe, expect, it } from 'vitest';
import { checkCvInput, cvFileName, fileNameFrom, statusFromCode, splitAtPlaceholder } from './common';

describe('cvFileName', () => {
  it.each([
    ['Samuele Cieri', 'Samuele-Cieri-CV.pdf'],
    ['  José  Núñez ', 'Jose-Nunez-CV.pdf'],
    ['a"b;c', 'abc-CV.pdf'],
    ['???', 'Curriculum-CV.pdf'],
  ])('%j → %j', (name, expected) => {
    expect(cvFileName(name)).toBe(expected);
  });
});

describe('fileNameFrom', () => {
  it('reads the quoted file name of a Content-Disposition header', () => {
    expect(fileNameFrom('attachment; filename="Samuele-Cieri-CV.pdf"')).toBe('Samuele-Cieri-CV.pdf');
  });

  it.each([null, '', 'attachment', 'attachment; filename=unquoted.pdf'])('falls back for %j', (header) => {
    expect(fileNameFrom(header)).toBe('CV.pdf');
  });
});

describe('checkCvInput', () => {
  it.each([
    ['', 'emptyEmail'],
    ['   ', 'emptyEmail'],
    ['mario', 'badEmail'],
    ['mario@', 'badEmail'],
    ['mario@example', 'badEmail'],
    ['@example.com', 'badEmail'],
    ['mario rossi@example.com', 'badEmail'],
    ['mario@example.com', null],
    ['  mario@example.com  ', null],
  ])('email %j → %j', (value, expected) => {
    expect(checkCvInput('email', value)).toBe(expected);
  });

  it.each([
    ['', 'emptyPassword'],
    ['   ', 'emptyPassword'],
    ['x', null],
    [' with spaces around ', null],
  ])('password %j → %j', (value, expected) => {
    expect(checkCvInput('password', value)).toBe(expected);
  });
});

describe('statusFromCode', () => {
  it('maps each answer of the API to its message', () => {
    expect(statusFromCode(202)).toBe('sent');
    expect(statusFromCode(400)).toBe('invalid');
    expect(statusFromCode(403)).toBe('denied');
    expect(statusFromCode(503)).toBe('unavailable');
  });

  it('tells a refused email (502) and a rate limit (429) apart from a generic failure', () => {
    expect(statusFromCode(502)).toBe('notSent');
    expect(statusFromCode(429)).toBe('tooMany');
    expect(statusFromCode(500)).toBe('failed');
    expect(statusFromCode(415)).toBe('failed');
  });
});

describe('splitAtPlaceholder', () => {
  it('splits the text around the placeholder', () => {
    expect(splitAtPlaceholder('Write to me on {linkedin}.', 'linkedin')).toEqual(['Write to me on ', '.']);
    expect(splitAtPlaceholder('{linkedin} is best', 'linkedin')).toEqual(['', ' is best']);
  });

  it('gives the whole text and nothing after when the placeholder is missing', () => {
    expect(splitAtPlaceholder('No link here.', 'linkedin')).toEqual(['No link here.', null]);
  });
});
