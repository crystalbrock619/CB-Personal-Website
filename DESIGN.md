# crystalbrock.org: Design Decisions

Decisions that constrain future work, and the reasoning behind the ones that
would otherwise be re-argued. Written to hand this project to a session with no
memory of how it got here.

Anything tried and rejected is in **Ruled out**, with the reason. Read that
section before proposing something; several items there look like obvious good
ideas until you know why they failed.

| Area | Status | Decided |
|---|---|---|
| Positioning | Locked | 3 Aug 2026 |
| Design system | Locked | 3 Aug 2026 |
| Page structure | Locked | 5 Aug 2026 |
| Copy voice and rules | Locked | 5 Aug 2026 |
| Image handling | Locked | 5 Aug 2026 |
| Contact form | Locked | 5 Aug 2026 |
| Domain email security | Locked | 3 Aug 2026 |
| Project cards | In progress | not yet |
| Hero photograph | Provisional | not yet |

---

## 1. Positioning

**Primary: AI automation and systems.** Agentic workflows, local LLM deployment
(Whisper, Piper, RAG), API and webhook integration, Python automation.

**Secondary: governance, risk and compliance.** Risk analysis, SOX, NIST and
COBIT, security auditing, maturity assessment.

**Not pursued:** system administration, help desk, technical security
operations. The old site was positioned there. It is wrong and should not creep
back in.

The hero line is **"I build AI systems that can survive an audit."** It carries
both tracks in one sentence: automation-first, but "audit" tells a GRC reader
they are in the right place. The pairing is the differentiator. Most people who
build automation do not think about governance, and most people who think about
governance cannot build.

**Career changer.** Ten years driving tractor-trailers, plus AT&T customer
service, then a Cybersecurity degree. Began in Computer Science, switched in the
final year. The trucking decade is framed as an asset (federally regulated,
safety-critical, unsupervised) and never apologised for.

---

## 2. Page structure

**The homepage carries capability and credentials.** Hero, stat band, Focus
(the two tracks), Skills, Projects, Credentials, Résumé downloads, Contact.

**About carries only the story the homepage cannot tell.** No capability
statement, no credential list. Both used to appear in both places, which meant a
reader arriving from the homepage read the same claims twice. About went from
1,024 words to about 800 by removing that duplication, not by cutting narrative.

Order on About: the arc (first program, ten years driving, going back, why
Cybersecurity), then "Going back as an adult", then Before the degree, then a
short paragraph of personal life. Nothing else.

`/thanks` is the contact form confirmation page, `noindex`.

---

## 3. Design system

Everything is CSS custom properties at the top of `style.css`. Changing `--ac`
reskins the whole site.

**Warm cream page, white cards.** `--bg: #faf7f2` with `--card: #ffffff`. Cream
alone was chosen over stark white because white read as cold; cards stay white
so they sit above the page rather than merging into it. Shadows are warm
(`rgba(61,52,40,…)`), because grey shadows over cream look muddy.

**Accent `--ac: #1e50a2`**, a navy. Navy on cream is a classic pairing and reads
as credible to conservative employers.

**Typography.** Source Serif 4 for headings, Inter for everything else.

**Contrast is checked, not assumed.** `--tx-3` was darkened twice to clear WCAG
AA on every surface it actually appears on. If you add a colour, verify it
against the surfaces it will land on rather than against white.

**Mobile navigation** is a hamburger below 900px with `aria-expanded` kept in
sync. The original design had the nav simply vanish on small screens.

---

## 4. Copy rules

**No em dashes, en dashes used as breaks, or double hyphens, ever.** Use colons
and semicolons, or split the sentence. This applies to prose, headings and
commit messages. It does not apply to code, where `--` is legitimate syntax.

**No writing that sounds like it was generated.** Crystal cuts it on sight. Two
patterns she has removed: telling the reader how to feel about the sentence
before it ("That's not a metaphor I reach for in interviews. It's just true."),
and self-congratulatory framing.

**Show her the full text, not a description of it.** She will not approve copy
she has not read. Build a preview or paste the whole thing.

**Precision over flattery in claims.** Say what is literally true and survives an
interview question. "Gig work fitted around coursework" rather than "juggling a
career", and so on.

Her voice: plain, warm, dry, self-deprecating without being self-deprecating
about her competence.

---

## 5. Images

**Every image file is stored at the aspect ratio it displays at.** Do not impose
a CSS `aspect-ratio` on a file of a different shape and rely on `object-fit`.
Two separate rounds of visible distortion came from doing that.

**`img { height: auto }` is in the reset.** Without it, a CSS width fights the
HTML `height` attribute and the image stretches. The few rules that need a fixed
or derived height are class-scoped and override it.

**Declared `width`/`height` must match the real file.** Check it; an off-by-one
was caught this way.

**Strip EXIF from everything.** Phone photos carry GPS. If a file has an
orientation tag, bake the rotation into the pixels *before* stripping, or it
ships upside down.

**Resize for the web.** A 4000px photo rendering at 400px is roughly ten times
the pixels any browser will use.

---

## 6. Project cards

Text-only cards with a status kicker (`.card-kicker` with a pulse dot). No
images at present.

**Live iframe previews are built but dormant.** `.card-media.live`,
`.live-frame` and the scaling script in `index.js` all still exist. Before
enabling them for any project, **check the target actually allows framing.** The
redesigned Advice Button refuses to be embedded, with or without a `sandbox`
attribute, so a preview there renders as an empty grey box. That is correct
clickjacking protection on its part. Retest anything else before assuming.

**Card copy must match what the project actually is.** The Advice Button card
claimed a REST API the app has never had. That is the kind of claim an
interviewer opens the site to check.

---

## 7. Contact form

Netlify Forms, `name="contact"`, posting to `/thanks`. No backend code; Netlify
parses the static HTML at build time.

**Email arrives via Netlify's built-in notification**, configured at Project
configuration → Notifications → Emails and webhooks → Form submission
notifications. Mail comes from `formresponses@netlify.com`, and because the form
has a field named `email`, `Reply-to` is set to the sender automatically.

**The topic dropdown is named `topic`, not `subject`, deliberately.** Netlify
treats a field named `subject` as the email subject line and lets it override
the one set in the UI.

Spam is handled by a honeypot named `bot-field`, positioned off-screen rather
than `display:none`, which some bots detect.

**Netlify silently marks short test-like messages as spam and sends no
notification for them.** Check the Forms Spam tab periodically. A missed
recruiter message is the expensive failure here.

---

## 8. Domain email security

The domain sends no mail. It is locked down accordingly, and all three records
are live and verified:

| Record | Value |
|---|---|
| `crystalbrock.org` TXT | `v=spf1 -all` |
| `*._domainkey.crystalbrock.org` TXT | `v=DKIM1; p=` |
| `_dmarc.crystalbrock.org` TXT | `v=DMARC1; p=reject; rua=mailto:crystalbrock619@gmail.com` |

No MX on the root, intentionally. This is the standard configuration for a
non-sending domain and it stops anyone spoofing the address that appears on her
résumé.

---

## 9. Deployment

Netlify project `crystalbrock-lambda-project` (legacy name), deploying from
`master`. **Crystal works directly on `master`, so a push goes live.** There is a
`Development` branch but it drifts; check which branch you are on before
committing.

`_redirects` preserves the old `/contact` and `/projects` URLs as 301s. Clean
URLs (`/about` rather than `/about.html`) are Netlify's Pretty URLs and only
work on the server, so local file previews break those links.

`.gitattributes` normalises line endings. Editing on Windows once rewrote six
files as CRLF and git reported 1,265 changed lines across identical content.

---

## 10. Facts of record

Verified, and previously wrong in several places:

- **GPA 3.972.** The résumés said 3.72 and 3.96; both were corrected.
- **Summa Cum Laude**, President's List every semester.
- **Graduated May 2026.** Résumés said "expected" after the fact.
- Honor societies: NSLS (Sigma Alpha Pi) and Alpha Sigma Lambda.
- Southern New Hampshire University. Linked, with the President's List merit
  page, in the homepage Credentials section. Both are third-party corroboration
  of claims made elsewhere on the site; do not remove them.
- Languages: Python, JavaScript, Java, HTML/CSS, Bash, SQL, basic C++.
- Linux stronger than Windows. No Mac.

---

## 11. Ruled out

Do not re-propose these without new information.

**A graduation photo as the hero.** It dates the site to one moment and marks
her as a novice, which works against the positioning. The formal studio portrait
also read stiff. The graduation photography lives on About instead, where the
regalia sits beside the story it belongs to.

**Netlify Function plus Resend for contact email.** Built, tested and removed.
The built-in notification is available on her plan and does the same job with no
account, no DNS records and no API key. It is recoverable at commit `de4408f` if
ever needed.

**Live previews for Advice Button.** See section 6.

**Royal Kitties as a project.** The original was an unfinished HTML exercise
predating the degree. It has since been deleted from Netlify and GitHub and is
being rebuilt. A sentence linking it is commented out in `about.html`; do not
enable it until the URL resolves.

**The hobbies galleries.** Two interactive cat galleries, 25 photos, 50 MB
against 1 MB for the entire rest of the site, preloaded on page load, with half
of `index.js` existing to page through them. Replaced by one paragraph. The
dive video stayed: it is 0.9 MB, `preload="metadata"`, and her own footage.

**Household finances and gig work in the copy.** Both cut as too personal for a
portfolio. That her partner supported the household during study remains in the
main prose once, which is enough.

---

## 12. Open

- **Project cards for Task Ambush and Uncommon Jars**, both marked in progress.
  Agreed, not built. Task Ambush is at `C:\Users\lilbr\Desktop\Task-Ambush`
  (Flask, 11 modules, 151 tests, localhost only, so the card links to GitHub;
  git history verified clean of secrets). Uncommon Jars is her preserves
  business; the real homepage is on that repo's `Prototyping` branch while the
  live site is still a coming-soon page.
- **Brain Scrambler** is being redesigned. Revisit its card, and retest whether
  it allows framing, once she says it is done.
- **Hero photograph.** Currently a retouched selfie, which is the weakest
  element on the site. She is planning a photo at her desk, which would also
  give the page its only visual evidence that she builds things.
- **A photo of her with one of the cats**, for the personal paragraph.
