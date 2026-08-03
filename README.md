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
