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

### Spam and fields

Spam is handled by a honeypot field named `bot-field`, positioned off-screen
rather than with `display:none`, which some bots check for. If spam becomes a
problem, add `data-netlify-recaptcha="true"` to the form and a
`<div data-netlify-recaptcha>` where the widget should appear.

To add or rename a field, give it a `name` attribute; that name is what appears
in the dashboard and in the notification email.

A previous version of this repo included a Netlify Function that sent the mail
via Resend, written before we established that the built-in notification was
available on this plan. It was removed as unnecessary. If it is ever wanted
again, it is in git history at commit `de4408f`.

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

**Check embedding before enabling this for any project.** As of 5 Aug 2026 the
redesigned Advice Button refuses to be framed, with or without the `sandbox`
attribute, so a live preview there renders as an empty grey box. That is correct
security practice on its part; it just rules the technique out. Brain Scrambler
has not been retested since its own redesign.

The quickest check: open the target site in an iframe from any page and see
whether it renders. If it does not, use a static screenshot instead.
