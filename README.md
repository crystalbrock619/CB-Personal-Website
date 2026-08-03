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
