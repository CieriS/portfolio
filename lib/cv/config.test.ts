import { describe, expect, it } from 'vitest';
import { readCvConfig } from './config';

const PASSWORD = 'p'.repeat(16);
const SECRET = 's'.repeat(32);
const MAIL = { CV_LINK_SECRET: SECRET, RESEND_API_KEY: 're_test', CV_MAIL_FROM: 'CV <cv@example.com>' };

describe('readCvConfig', () => {
  it('disables everything, silently, when nothing is set', () => {
    expect(readCvConfig({})).toEqual({
      config: { adminPassword: null, links: null, contact: { email: null, phone: null } },
      problems: [],
    });
  });

  it('enables both halves when everything is set', () => {
    const { config, problems } = readCvConfig({
      ...MAIL,
      CV_ADMIN_PASSWORD: PASSWORD,
      CV_NOTIFY_EMAIL: 'owner@example.com',
      CV_EMAIL: 'me@example.com',
      CV_PHONE: '+39 000 0000000',
    });
    expect(problems).toEqual([]);
    expect(config.adminPassword).toBe(PASSWORD);
    expect(config.links).toEqual({ secret: SECRET, apiKey: 're_test', from: 'CV <cv@example.com>', notify: 'owner@example.com' });
    expect(config.contact).toEqual({ email: 'me@example.com', phone: '+39 000 0000000' });
  });

  it('refuses a short admin password and says why', () => {
    const { config, problems } = readCvConfig({ CV_ADMIN_PASSWORD: 'p'.repeat(15) });
    expect(config.adminPassword).toBeNull();
    expect(problems).toEqual([expect.stringContaining('CV_ADMIN_PASSWORD')]);
  });

  it('refuses a short signing secret and says why', () => {
    const { config, problems } = readCvConfig({ ...MAIL, CV_LINK_SECRET: 's'.repeat(31) });
    expect(config.links).toBeNull();
    expect(problems).toEqual([expect.stringContaining('CV_LINK_SECRET')]);
  });

  it.each(Object.keys(MAIL))('reports email links half-configured when %s is missing', (missing) => {
    const env: Record<string, string> = { ...MAIL };
    delete env[missing];
    const { config, problems } = readCvConfig(env);
    expect(config.links).toBeNull();
    expect(problems).toEqual([expect.stringContaining('together')]);
  });

  it('treats blank values as missing and trims the others', () => {
    const { config } = readCvConfig({ ...MAIL, CV_NOTIFY_EMAIL: '   ', CV_PHONE: ' +39 1 ' });
    expect(config.links?.notify).toBeNull();
    expect(config.contact.phone).toBe('+39 1');
  });
});
