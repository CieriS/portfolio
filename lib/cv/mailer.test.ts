import { describe, expect, it, vi } from 'vitest';
import { RESEND_ENDPOINT, resendMailer } from './mailer';

const mail = { to: 'visitor@example.com', subject: 'Subject', text: 'Body' };

describe('resendMailer', () => {
  it('posts the message to Resend with the key as bearer token', async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }));
    await resendMailer({ apiKey: 're_key', from: 'CV <cv@example.com>' }, send)(mail);

    expect(send).toHaveBeenCalledOnce();
    const [url, init] = send.mock.calls[0];
    expect(url).toBe(RESEND_ENDPOINT);
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer re_key');
    expect(JSON.parse(String(init?.body))).toEqual({
      from: 'CV <cv@example.com>',
      to: ['visitor@example.com'],
      subject: 'Subject',
      text: 'Body',
    });
  });

  it('turns a refusal into an error that carries the reason', async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(new Response('domain not verified', { status: 403 }));
    await expect(resendMailer({ apiKey: 'k', from: 'f' }, send)(mail)).rejects.toThrow(/403: domain not verified/);
  });

  it('lets a network failure through', async () => {
    const send = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'));
    await expect(resendMailer({ apiKey: 'k', from: 'f' }, send)(mail)).rejects.toThrow('fetch failed');
  });
});
