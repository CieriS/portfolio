import { describe, expect, it } from 'vitest';
import { cvFileName, fileNameFrom } from './common';

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
