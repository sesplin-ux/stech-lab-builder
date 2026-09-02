# STECH Lab Builder — hosting test site

Static site for testing the job-sheet tools on GitHub Pages (especially on Chromebooks). No backend, no student data — just the HTML tools + one test lab pack.

## Contents
| File | What |
|---|---|
| `index.html` | Landing page — links to the tools + the test pack |
| `Student.html` | Student *Fill* app (loads `engine.js`) |
| `Grader.html` | Instructor *Grade* app (loads `engine.js`) |
| `Builder.html` | Instructor *Author* app (standalone) |
| `engine.js` | Shared competency engine — must sit next to Student/Grader (it does here) |
| `auto-trans-full-draft.json` | Test lab pack: Automatic Transmissions (46 job sheets) |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (no Jekyll processing) |

## Enable GitHub Pages
1. Repo **Settings → Pages**.
2. **Source:** *Deploy from a branch* → Branch **`main`**, folder **`/ (root)`** → **Save**.
3. Wait ~1 min; the site publishes at `https://<user>.github.io/<repo>/`.
4. Open `…/Student.html` (or the landing `index.html`).

## Why host instead of using Canvas file attachments
`Student.html`/`Grader.html` load `engine.js` by a sibling path (`<script src="engine.js">`). GitHub Pages preserves that folder layout so it resolves; Canvas gives each uploaded file its own opaque URL and sandboxes HTML, so the app breaks there. Link to this hosted app from Canvas instead, and attach the pack for students to load.

## Not built yet (roadmap)
- **Fetch-latest pack on load:** today the student loads the pack file manually. To make *push a new pack → students see it*, the app needs to fetch the pack from a URL on open + cache offline. Until then, re-loading the pack file is required after a pack change.
- **Publish → repo hand-off:** the Builder's Publish downloads a file; committing it here is currently a manual `git push`.

## Syncing from the vault
Canonical sources live in the Lab Builder vault (`Builder/` tools, `Packs/` packs). This site is a **copy** for hosting tests — re-copy the 4 tool files + the pack here when they change.
