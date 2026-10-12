import { describe, expect, it } from 'vitest';
import { checkCvInput, cvFileName, fileNameFrom } from './common';

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
