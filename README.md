# Restaurants

This repository is the GitHub Pages site behind **manailab.com**.

**The site was taken down on 2026-09-12 at the client's request.** Every path,
including the root, now returns HTTP 404 with a `noindex` page (`404.html`).
Do not restore any of the removed content here or on any other domain.

The full site as it was served is kept in git history under the tag
`pre-takedown-2026-09-12`. The domain stays on GitHub Pages on purpose: a live
404 is the signal Google's removal tools need to drop the old URLs. Deleting
the DNS records or unpublishing Pages would replace it with a connection error,
which Google treats less decisively.

Files that remain:

| File | Why |
|------|-----|
| `CNAME` | keeps manailab.com bound to this Pages site so it serves the 404 |
| `.nojekyll` | serves files as-is |
| `404.html` | the page every URL now returns |
