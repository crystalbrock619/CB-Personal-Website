/* ==========================================================================
   Contact form notifier
   --------------------------------------------------------------------------
   Netlify captures the form submission, then fires its "HTTP POST request"
   notification at this function. The function verifies the request really came
   from Netlify, then sends the message on by email via Resend.

   OPTIONAL. Netlify's built-in email notification does this job with no code
   and no third party, and is available on the current plan. Use this function
   only if you want the mail to arrive from your own domain rather than from
   formresponses@netlify.com, with richer formatting. Both can run at once.

   Required environment variables (Netlify > Project configuration >
   Environment variables):

     RESEND_API_KEY           secret key from resend.com
     CONTACT_TO               address that receives the messages
     CONTACT_FROM             verified sender, e.g. site@crystalbrock.org

   Plus AT LEAST ONE of these, so the endpoint is never unauthenticated:

     NETLIFY_WEBHOOK_SECRET   the JWS secret token entered on the notification,
                              if that field exists in your Netlify UI
     NETLIFY_WEBHOOK_TOKEN    a long random string you append to the notification
                              URL as ?token=... , for when it does not

   The signature is the better of the two, because it also proves the body was
   not altered. The URL token is the fallback: it travels inside the TLS
   connection, but unlike a signature it can appear in request logs, so treat
   it as the weaker option and prefer the signature when available.

   ========================================================================== */

import crypto from 'node:crypto';

const JSON_HEADERS = { 'content-type': 'application/json' };

const reply = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/* Netlify signs outgoing webhooks as a JWS (HS256). The payload carries a
   sha256 claim over the raw body, so verifying both proves the request came
   from Netlify AND that the body was not altered in transit. */
function signatureIsValid(signature, secret, rawBody) {
  if (typeof signature !== 'string') return false;
  const parts = signature.split('.');
  if (parts.length !== 3) return false;

  const [header, payload, provided] = parts;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;          // timingSafeEqual throws otherwise
  if (!crypto.timingSafeEqual(a, b)) return false;

  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return false;
  }

  const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  return claims.sha256 === bodyHash;
}

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });

  const {
    RESEND_API_KEY, CONTACT_TO, CONTACT_FROM,
    NETLIFY_WEBHOOK_SECRET, NETLIFY_WEBHOOK_TOKEN,
  } = process.env;

  // Fail closed. A function that emails on demand without authentication is an
  // open relay, so refuse to run at all if it has not been configured.
  const missing = Object.entries({ RESEND_API_KEY, CONTACT_TO, CONTACT_FROM })
    .filter(([, v]) => !v).map(([k]) => k);

  if (missing.length) {
    console.error('Not configured, missing:', missing.join(', '));
    return reply(500, { error: 'Function is not configured' });
  }
  if (!NETLIFY_WEBHOOK_SECRET && !NETLIFY_WEBHOOK_TOKEN) {
    console.error('Refusing to run: set NETLIFY_WEBHOOK_SECRET or NETLIFY_WEBHOOK_TOKEN');
    return reply(500, { error: 'Function is not configured' });
  }

  const rawBody = await req.text();

  // Accept either proof of origin. Whichever is configured must pass; if both
  // are configured, either one satisfies it.
  let authorised = false;

  if (NETLIFY_WEBHOOK_SECRET) {
    authorised = signatureIsValid(
      req.headers.get('x-webhook-signature'), NETLIFY_WEBHOOK_SECRET, rawBody);
  }
  if (!authorised && NETLIFY_WEBHOOK_TOKEN) {
    const supplied = new URL(req.url).searchParams.get('token') ?? '';
    const a = Buffer.from(supplied);
    const b = Buffer.from(NETLIFY_WEBHOOK_TOKEN);
    authorised = a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  if (!authorised) {
    console.warn('Rejected: no valid signature or token');
    return reply(401, { error: 'Unauthorised' });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return reply(400, { error: 'Body was not valid JSON' });
  }

  // Netlify has shipped this payload both bare and wrapped in `payload`.
  const submission = body.payload ?? body;
  const data = submission.data ?? submission;

  const name    = (data.name    || 'Someone').toString().trim().slice(0, 200);
  const email   = (data.email   || '').toString().trim().slice(0, 320);
  const topic   = (data.topic || 'No topic given').toString().trim().slice(0, 200);
  const message = (data.message || '').toString().trim().slice(0, 10000);

  if (!message) return reply(400, { error: 'Submission had no message' });

  const text =
`New message from crystalbrock.org

From:    ${name}
Email:   ${email || 'not supplied'}
About:   ${topic}
Received: ${submission.created_at || new Date().toISOString()}

${message}

Reply directly to this email to answer ${name}.`;

  const html =
`<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;color:#1c1a17">
  <p style="font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#6f665d;margin:0 0 .75rem">
    New message from crystalbrock.org
  </p>
  <table style="border-collapse:collapse;margin-bottom:1.25rem;font-size:.95rem">
    <tr><td style="padding:.2rem 1rem .2rem 0;color:#57534e">From</td><td><strong>${escapeHtml(name)}</strong></td></tr>
    <tr><td style="padding:.2rem 1rem .2rem 0;color:#57534e">Email</td><td>${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : 'not supplied'}</td></tr>
    <tr><td style="padding:.2rem 1rem .2rem 0;color:#57534e">About</td><td>${escapeHtml(topic)}</td></tr>
  </table>
  <div style="border-left:3px solid #1e50a2;padding:.25rem 0 .25rem 1rem;white-space:pre-wrap">${escapeHtml(message)}</div>
  <p style="font-size:.85rem;color:#6f665d;margin-top:1.5rem">
    Reply to this email to answer ${escapeHtml(name)} directly.
  </p>
</div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      subject: `crystalbrock.org: ${topic} (${name})`,
      text,
      html,
      // so hitting reply in your mail client answers the sender, not the robot
      ...(email ? { reply_to: email } : {}),
    }),
  });

  if (!res.ok) {
    console.error('Resend rejected the send:', res.status, await res.text());
    return reply(502, { error: 'Could not send the email' });
  }

  return reply(200, { ok: true });
};
