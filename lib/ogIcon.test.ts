import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { OG_ICON_FILE, OG_ICON_SIZE } from './ogIcon';

const read = (path: string) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)));
const icon = read(OG_ICON_FILE);

describe('share card icon', () => {
  it('is a PNG of exactly the size it is drawn at', () => {
    expect(icon.subarray(1, 4).toString()).toBe('PNG');
    // Width and height are two big-endian integers right after the IHDR tag.
    expect([icon.readUInt32BE(16), icon.readUInt32BE(20)]).toEqual([OG_ICON_SIZE, OG_ICON_SIZE]);
  });

  it('stays small: it is inlined in every card', () => {
    expect(icon.length).toBeLessThan(5_000);
  });

  it('is the file the build ships with the image routes', () => {
    expect(read('next.config.ts').toString()).toContain(`'./${OG_ICON_FILE}'`);
  });
});
