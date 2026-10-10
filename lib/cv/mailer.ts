/**
 * Outbound email as a port: the service only knows `Mailer`, so tests pass a fake and another
 * provider (or an SMS gateway) is one adapter away. The adapter below talks to Resend's REST
 * API with plain `fetch`, which spares an SDK dependency for a single call.
 */
export type Mail = { to: string; subject: string; text: string };
export type Mailer = (mail: Mail) => Promise<void>;

export const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function resendMailer(options: { apiKey: string; from: string }, send: typeof fetch = fetch): Mailer {
  return async (mail) => {
    const response = await send(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${options.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: options.from, to: [mail.to], subject: mail.subject, text: mail.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      // The body names the cause (unverified domain, invalid key) and never echoes the key.
      throw new Error(`Resend answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
  };
}
