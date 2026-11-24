import { describe, expect, it, vi } from 'vitest';
import { LINK_HOURS } from './common';
import type { CvConfig } from './config';
import type { Mail, Mailer } from './mailer';
import { openLink, requestCv, withoutAddress, type CvDeps } from './service';
import { signLink } from './token';

const SECRET = 's'.repeat(32);
const NOW = Date.parse('2026-10-10T12:00:00Z');
const PASSWORD = 'owner-password-1234';

const fullConfig: CvConfig = {
  adminPassword: PASSWORD,
  links: { secret: SECRET, apiKey: 're_test', from: 'cv@example.com', notify: 'owner@example.com' },
  contact: { email: null, phone: null },
};

function deps(overrides: Partial<CvDeps> = {}) {
  const sent: Mail[] = [];
  const mailer: Mailer = async (mail) => {
    sent.push(mail);
  };
  const report = vi.fn();
  return {
    sent,
    report,
    deps: { config: fullConfig, mailer, now: NOW, siteUrl: 'https://example.com', name: 'Ada Example', report, ...overrides },
  };
}

describe('requestCv — password', () => {
  it('hands out the PDF, in the requested locale, for the right password', async () => {
    expect(await requestCv({ method: 'password', locale: 'de', password: PASSWORD }, deps().deps)).toEqual({
      kind: 'pdf',
      locale: 'de',
    });
  });

  it('denies a wrong password', async () => {
    expect(await requestCv({ method: 'password', locale: 'en', password: 'guess' }, deps().deps)).toEqual({ kind: 'denied' });
  });

  it('is unavailable when no admin password is configured', async () => {
    const { deps: d } = deps({ config: { ...fullConfig, adminPassword: null } });
    expect(await requestCv({ method: 'password', locale: 'en', password: PASSWORD }, d)).toEqual({ kind: 'unavailable' });
  });
});

describe('requestCv — email', () => {
  const request = { method: 'email', locale: 'it', email: 'visitor@example.com' };

  it('mails a working, expiring link in the visitor language and notifies the owner', async () => {
    const { sent, deps: d } = deps();
    expect(await requestCv(request, d)).toEqual({ kind: 'sent' });

    expect(sent.map((mail) => mail.to)).toEqual(['visitor@example.com', 'owner@example.com']);
    const [toVisitor, toOwner] = sent;
    expect(toVisitor.subject).toBe('Ada Example — curriculum vitae');
    expect(toVisitor.text).toContain(`${LINK_HOURS} ore`);
    expect(toOwner.text).toContain('visitor@example.com');

    const token = new URL(toVisitor.text.match(/https:\/\/\S+/)![0]).searchParams.get('token');
    expect(openLink(token, { config: fullConfig, now: NOW })).toEqual({ kind: 'pdf', locale: 'it' });
    expect(openLink(token, { config: fullConfig, now: NOW + LINK_HOURS * 3_600_000 })).toEqual({ kind: 'denied' });
  });

  // #65: the link ends up in request logs and browser history, so it must not reveal who asked.
  it('mails a link that does not contain the address in any readable form', async () => {
    const { sent, deps: d } = deps();
    await requestCv(request, d);
    const link = sent[0]!.text.match(/https:\/\/\S+/)![0];
    const token = new URL(link).searchParams.get('token')!;
    const payload = Buffer.from(token.split('.')[0]!, 'base64url').toString('utf8');
    for (const text of [link, decodeURIComponent(link), payload]) {
      expect(text).not.toContain('visitor@example.com');
      expect(text).not.toContain('visitor');
    }
    expect(JSON.parse(payload)).toEqual({ locale: 'it', exp: NOW + LINK_HOURS * 3_600_000 });
  });

  it('skips the owner notice when none is configured', async () => {
    const { sent, deps: d } = deps({ config: { ...fullConfig, links: { ...fullConfig.links!, notify: null } } });
    await requestCv(request, d);
    expect(sent).toHaveLength(1);
  });

  it('answers a filled honeypot like a person, without sending anything', async () => {
    const { sent, deps: d } = deps();
    expect(await requestCv({ ...request, website: 'https://spam.example' }, d)).toEqual({ kind: 'sent' });
    expect(sent).toEqual([]);
  });

  it('reports a failed delivery to the visitor and to the logs', async () => {
    const error = new Error('Resend answered 500');
    const { report, deps: d } = deps({ mailer: () => Promise.reject(error) });
    expect(await requestCv(request, d)).toEqual({ kind: 'failed' });
    expect(report).toHaveBeenCalledOnce();
    expect(String(report.mock.calls[0]![0])).toContain('Resend answered 500');
  });

  // #65: a provider may echo the recipient in its error; the logs must not get the address.
  it('masks the address in what a failed delivery writes to the logs', async () => {
    const echo = new Error('Resend answered 422: {"message":"Invalid `to` field: visitor@example.com, visitor@example.com"}');
    const { report, deps: d } = deps({ mailer: () => Promise.reject(echo) });
    await requestCv(request, d);
    const logged = report.mock.calls[0]![0];
    expect(logged).toBeInstanceOf(Error);
    expect(String(logged)).not.toContain('visitor@example.com');
    expect(String(logged)).toContain('Invalid `to` field: [email], [email]');
  });

  it('still succeeds when only the owner notice fails, and masks the address there too', async () => {
    const mailer = vi
      .fn<Mailer>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('notice for visitor@example.com lost'));
    const { report, deps: d } = deps({ mailer });
    expect(await requestCv(request, d)).toEqual({ kind: 'sent' });
    expect(report).toHaveBeenCalledOnce();
    expect(String(report.mock.calls[0]![0])).toBe('Error: notice for [email] lost');
  });

  it('is unavailable when email links are not configured', async () => {
    const { deps: d } = deps({ config: { ...fullConfig, links: null }, mailer: null });
    expect(await requestCv(request, d)).toEqual({ kind: 'unavailable' });
  });
});

describe('requestCv — invalid input', () => {
  it.each([
    null,
    'text',
    {},
    { method: 'sms', locale: 'en', phone: '+39' },
    { method: 'password', locale: 'en', password: '' },
    { method: 'password', locale: 'pt', password: PASSWORD },
    { method: 'password', locale: 'en', password: 'x'.repeat(257) },
    { method: 'email', locale: 'en', email: 'not-an-email' },
    { method: 'email', locale: 'en', email: `${'a'.repeat(250)}@x.io` },
    { method: 'email', locale: 'en' },
  ])('rejects %j', async (body) => {
    const { sent, deps: d } = deps();
    expect(await requestCv(body, d)).toEqual({ kind: 'invalid' });
    expect(sent).toEqual([]);
  });
});

describe('withoutAddress', () => {
  it('keeps the name and message of an Error, masking every occurrence of the address', () => {
    const error = new TypeError('a@example.com and a@example.com');
    const masked = withoutAddress(error, 'a@example.com');
    expect(masked.name).toBe('TypeError');
    expect(masked.message).toBe('[email] and [email]');
  });

  it('turns anything thrown into an Error, masked', () => {
    expect(withoutAddress('failed for a@example.com', 'a@example.com').message).toBe('failed for [email]');
    expect(withoutAddress(null, 'a@example.com').message).toBe('null');
  });

  it('drops the stack and cause of the original, which could carry the address', () => {
    const error = new Error('outer', { cause: new Error('a@example.com') });
    const masked = withoutAddress(error, 'a@example.com');
    expect(masked.cause).toBeUndefined();
    expect(masked.stack ?? '').not.toContain('a@example.com');
  });
});

describe('openLink', () => {
  const token = signLink({ locale: 'fr', exp: NOW + 1000 }, SECRET);

  it('opens a genuine link', () => {
    expect(openLink(token, { config: fullConfig, now: NOW })).toEqual({ kind: 'pdf', locale: 'fr' });
  });

  it('denies a missing or forged token', () => {
    expect(openLink(null, { config: fullConfig, now: NOW })).toEqual({ kind: 'denied' });
    expect(openLink(`${token}x`, { config: fullConfig, now: NOW })).toEqual({ kind: 'denied' });
  });

  it('is unavailable once links are switched off, even for a genuine token', () => {
    expect(openLink(token, { config: { ...fullConfig, links: null }, now: NOW })).toEqual({ kind: 'unavailable' });
  });
});
