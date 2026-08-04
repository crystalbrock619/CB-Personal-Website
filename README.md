# crystalbrock.org

Personal site for Crystal Brock: AI automation and cybersecurity governance.

**Live:** <https://www.crystalbrock.org>
**Hosting:** Netlify (project `crystalbrock-lambda-project`), auto-deploys from `master`.

## Structure

| Path          | Purpose |
| ------------- | ------- |
| `index.html`  | Single-scroll homepage: hero, focus, skills, projects, credentials, resume, contact |
| `about.html`  | Long-form background, prior experience, hobbies, pet galleries |
| `style.css`   | Shared design system; all tokens live in `:root` |
| `index.js`    | Mobile nav toggle and the pet photo galleries |
| `thanks.html` | Confirmation page the contact form redirects to |
| `_redirects`  | Netlify 301s preserving the old `/contact` and `/projects` URLs |
| `assets/`     | Images, dive video, résumé PDFs |

## Branches

- `master`: production, deploys to crystalbrock.org
- `Development`: redesign work, merged into `master` to publish
- `Bulid-Maintenance`: legacy branch, unused

## Local preview

No build step. Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

Note that `_redirects` and the extensionless `/about` URL only apply on Netlify.
Opening files locally, use `about.html`.

## Editing

Colors, spacing, and type are CSS custom properties at the top of `style.css`.
Change `--ac` to reskin the whole site's accent color.

## Contact form

The form in the Contact section of `index.html` is a Netlify Form. Netlify's
build parses the static HTML, sees `data-netlify="true"`, and wires up the
handler; there is no backend code. Submissions land in the Netlify dashboard
under Forms, and the visitor is redirected to `/thanks`.

### Getting the messages by email

**The simple way, and what is actually in use.** Netlify's built-in email
notification handles this with no code:

Project configuration → Notifications → Emails and webhooks
→ Form submission notifications → Add → Email notification
→ event "New form submission", form `contact`

Mail arrives from `formresponses@netlify.com`. Because the form has a field
named `email`, Netlify sets `Reply-to` to the sender automatically, so replying
answers them rather than Netlify.

Note that a form field named `subject` would be treated as the email subject
line and would override the one set in the UI. The topic dropdown is therefore
named `topic`, not `subject`, deliberately.

### Optional: send from your own domain instead

`netlify/functions/contact-notify.mjs` is an alternative that sends via Resend,
so mail arrives from `site@crystalbrock.org` with richer formatting instead of
from a Netlify address. It is not wired up by default and is not required.

**One-time setup, only if you want this**

1. Create a [Resend](https://resend.com) account and verify `crystalbrock.org`
   as a sending domain. Create an API key.
2. In Netlify → Project configuration → Environment variables, add:

   | Variable | Value |
   | -------- | ----- |
   | `RESEND_API_KEY` | the key from Resend |
   | `CONTACT_TO` | where messages should land |
   | `CONTACT_FROM` | a verified sender, e.g. `site@crystalbrock.org` |

3. Deploy, so the function exists.
4. Netlify → Project configuration → Notifications → Emails and webhooks
   → Form submission notifications → Add → **HTTP POST request**, for form
   `contact`.

5. Authenticate the webhook. Use whichever the Netlify UI offers.

   **If the notification form has a JWS secret token field** (preferred, since
   it also proves the body was not tampered with):

   - URL: `https://www.crystalbrock.org/.netlify/functions/contact-notify`
   - JWS secret token: a long random string
   - Add that same string as the `NETLIFY_WEBHOOK_SECRET` environment variable

   **If it does not**, put the secret in the URL instead:

   - URL: `https://www.crystalbrock.org/.netlify/functions/contact-notify?token=YOUR_TOKEN`
   - Add that same token as the `NETLIFY_WEBHOOK_TOKEN` environment variable

   Generate either with `openssl rand -base64 32 | tr -d '=+/' | cut -c1-40`.
   The function accepts whichever is configured and refuses to run if neither
   is, so the endpoint is never left unauthenticated.

6. Submit the form once and confirm the email arrives.

**Security notes**

The function refuses to run unless the required variables are set, and rejects any
request whose signature does not verify against the shared secret. Without that
check it would be an open relay: anyone who found the URL could send mail
through the Resend account. The signature also covers a hash of the body, so a
valid signature cannot be replayed against altered content.

The API key is only ever read server side from the environment. It never
reaches the browser. Submitted content is HTML-escaped before being placed in
the email body, and `reply_to` is set to the sender so replying works normally.

If email stops arriving, check Netlify → Functions → `contact-notify` logs. A
401 means the secret does not match; a 500 means a variable is missing.

Spam is handled by a honeypot field named `bot-field`, hidden off-screen rather
than with `display:none`, which some bots check for. If spam becomes a problem,
add `data-netlify-recaptcha="true"` to the form and a `<div data-netlify-recaptcha>`
where the widget should appear.

To add or rename a field, give it a `name` attribute; that name is what appears
in the dashboard and in the notification email.

## Re-enabling live project previews

The project cards are currently text-only while the linked projects are being
redesigned. The supporting CSS (`.card-media.live`, `.live-frame`) and the
scaling script in `index.js` are already in place and dormant.

To turn previews back on, drop this block back in as the first child of each
project `<a class="card">`, and remove `card-text` from that link's class list
along with its `<span class="card-kicker">` line:

```html
<div class="card-media live" data-label="The Brain Scrambler">
  <iframe class="live-frame" src="https://thebrainscrambler.netlify.app/"
          title="Live preview of The Brain Scrambler"
          loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true"
          sandbox="allow-scripts"></iframe>
</div>
```

How it works: the iframe renders at a fixed 1280x720 desktop viewport, and
`index.js` scales it to whatever width the card happens to be, recomputing on
resize. `pointer-events:none` keeps the whole card behaving as one link, and
the `data-label` shows through if a project is ever offline.

Both projects were confirmed to allow embedding; neither sends
`X-Frame-Options` or a `frame-ancestors` policy. Verify that again if either
site moves to different hosting.
