# Deploying manailab.com

## 1. GitHub Pages — done

Pages is enabled on `whizyoga-ai/Restaurants`, building from `main` at the
repository root. The `CNAME` file holds `manailab.com`, and `.nojekyll` stops
Jekyll from touching the static files.

Verify a build with:

```bash
gh api repos/whizyoga-ai/Restaurants/pages/builds/latest --jq '.status, .error.message'
```

## 2. Cloudflare DNS — needs you

**Until this is done, the live URL is
<https://whizyoga-ai.github.io/Restaurants/>.**

### What is there now

`manailab.com` already resolves, but **not to GitHub Pages**. The apex is
orange-clouded — it answers on Cloudflare proxy IPs (`104.21.71.26`,
`172.67.142.109`) in front of a pre-existing origin that serves a near-copy of
the main Brahmexa site, 71 KB titled *"BRAHMEXA – The Business Brain Company"*,
with no reference to this repository. Every path from here 404s on it:

```
https://manailab.com/restaurants/leaf-and-loaf/   404
https://manailab.com/assets/manailab.css          404
```

That is why the Leaf & Loaf circle was invisible: the `CNAME` file claimed the
domain with GitHub, but DNS never routed there, so
`whizyoga-ai.github.io/Restaurants/` merely 301'd to a page that contains none
of this.

### What you actually lose

Measured, not assumed — so you can decide without guessing:

| Host | Serves today | Worth keeping? |
|---|---|---|
| `manailab.com` (apex) | 71 KB copy of the main Brahmexa site, *"BRAHMEXA – The Business Brain Company"* | It is a duplicate of `brahmexa.com`, which stays where it is |
| `www.manailab.com` | 15 KB placeholder, *"Coming Soon — JSI Software Solutions"* | No |

The apex is **orange-clouded**, so its origin IP is hidden and exists in exactly
one place: the record's *Content* field in the Cloudflare dashboard. Write it
down before you delete it — that is the only copy.

`www` is **grey-clouded** and resolves straight to `112.196.183.116`, an Apache
box that is also the JSI shared host. That one is already recoverable.

---

### Step 1 — Back up the zone first

Cloudflare dashboard → select **manailab.com** → **DNS** → **Records** →
**Export** (top right). Save the BIND file. Two minutes now, and any mistake
below is a one-click restore.

While you are on that screen, copy the **Content** value of both apex `A`
records into a note. Repeat for anything else you do not recognise.

### Step 2 — Check what could override DNS

DNS is not the only thing that can answer for a hostname. Before changing
records, confirm none of these are pointed at `manailab.com` — if one is, it
intercepts the request *before* the origin and the new records will appear to
do nothing:

| Where | What to look for |
|---|---|
| **Workers & Pages → Workers Routes** | any route matching `manailab.com/*` |
| **Rules → Redirect Rules** and **Bulk Redirects** | a rule rewriting `manailab.com` |
| **Rules → Page Rules** (legacy) | forwarding URL rules on the apex |
| **Workers & Pages → your Pages projects** | `manailab.com` attached as a custom domain |

Remove or disable whichever applies. This is the single most common reason a
correct DNS change looks like it did nothing.

### Step 3 — Replace the records

**DNS → Records.** Delete the two apex `A` records, then **Add record** five
times:

| Type | Name | IPv4 address / Target | Proxy status | TTL |
|---|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** (grey) | Auto |
| A | `@` | `185.199.109.153` | **DNS only** (grey) | Auto |
| A | `@` | `185.199.110.153` | **DNS only** (grey) | Auto |
| A | `@` | `185.199.111.153` | **DNS only** (grey) | Auto |
| CNAME | `www` | `whizyoga-ai.github.io` | **DNS only** (grey) | Auto |

Notes:

- Delete the existing `www` `A` record — a name cannot hold both `A` and
  `CNAME`.
- The `CNAME` target is `whizyoga-ai.github.io` — the **user** domain, with no
  `/Restaurants` path and no trailing dot needed. Paths are not valid in DNS.
- **Grey cloud on all five.** This is not optional at this stage; see Step 4.
- Leave the `TXT` SPF record exactly as it is. It is mail, not web, and
  breaking it breaks outbound mail for the domain.
- Delete the two apex `AAAA` records if any remain. GitHub Pages does publish
  IPv6, but mixing a stale IPv6 answer with a fresh IPv4 one sends
  dual-stack visitors to the old host and makes the cutover look intermittent.

### Step 4 — Why grey cloud first

GitHub issues a Let's Encrypt certificate for the domain by answering an
HTTP-01 challenge on port 80. With the orange cloud on, Cloudflare terminates
TLS itself and GitHub never sees the challenge, so issuance fails and the site
serves a certificate-name-mismatch error.

Sequence that works:

1. Grey cloud → GitHub validates the domain and issues the certificate.
2. Confirm the certificate is live (Step 6).
3. *Only then*, if you want Cloudflare's CDN and WAF in front, switch the four
   `A` records to orange **and** set **SSL/TLS → Overview → Full (strict)**.

If you turn the proxy on, these also matter:

- **SSL/TLS mode must be Full (strict).** *Flexible* makes Cloudflare speak
  HTTP to GitHub while GitHub redirects to HTTPS — an infinite redirect loop.
- **SSL/TLS → Edge Certificates → Always Use HTTPS: On** is fine, and is the
  Cloudflare-side equivalent of GitHub's *Enforce HTTPS*.
- Leave **Rocket Loader** off. It rewrites script tags and can break the
  chatbot widget's `data-*` attributes.

Staying grey-clouded permanently is a perfectly good outcome. GitHub Pages has
its own CDN and TLS; the proxy buys you WAF and analytics, not speed.

### Step 5 — Re-arm the custom domain on GitHub

The Pages custom-domain setting was deliberately cleared while the domain
pointed elsewhere, so it needs re-arming once DNS has moved:

```bash
gh api -X PUT repos/whizyoga-ai/Restaurants/pages -f cname=manailab.com
```

Wait for the certificate, then enforce HTTPS as a second call — it fails if the
certificate is not ready yet:

```bash
gh api -X PUT repos/whizyoga-ai/Restaurants/pages -F https_enforced=true
```

The `CNAME` file is already committed, so no code change is needed.

### Step 6 — Verify

Propagation is usually a couple of minutes on Cloudflare, not hours.

```bash
nslookup manailab.com 1.1.1.1
```

Expect the four `185.199.*` addresses. If you still see `104.21.*` or
`172.67.*`, the record is still orange-clouded.

```bash
curl -sI https://manailab.com/ | head -1 && curl -s -o /dev/null -w '%{http_code}\n' https://manailab.com/restaurants/leaf-and-loaf/
```

Expect `200` twice. A `404` on the second means DNS moved but the custom domain
is not armed — redo Step 5.

```bash
gh api repos/whizyoga-ai/Restaurants/pages --jq '{cname,status,https_certificate:.https_certificate.state,https_enforced}'
```

Expect `cname: manailab.com`, `status: built`, certificate state `approved`.

### Step 7 — If it goes wrong

Re-import the BIND file from Step 1, or manually restore the apex `A` record
using the Content value you noted. DNS is the only thing being changed here —
nothing on GitHub's side is destructive, and the old origin host is untouched
throughout.

| Symptom | Cause |
|---|---|
| Old Brahmexa page still shows | A Worker route or Redirect Rule is intercepting — Step 2 |
| `ERR_TOO_MANY_REDIRECTS` | Orange cloud with SSL/TLS set to *Flexible* — set Full (strict) |
| Certificate name mismatch | Orange cloud was on during issuance — go grey, wait, re-arm |
| `404` on every path | Custom domain not armed on GitHub — Step 5 |
| Works on IPv4, old site on IPv6 | Stale `AAAA` records — delete them |

## 3. What lives where

| URL | Content |
|---|---|
| `/` | Brahmexa SMB evaluation page: hero, the Leaf & Loaf showcase, 13 admin-interface cards, then `https://saas.brahmexa.com/smb/` embedded below |
| `/restaurants/leaf-and-loaf/` | The Leaf & Loaf site |

Relative to `https://whizyoga-ai.github.io/Restaurants/` today, and to
`https://manailab.com/` once DNS moves. All internal links are relative so both
work without edits.

`saas.brahmexa.com` sends no `X-Frame-Options` and no frame-ancestors CSP, so
the embed is allowed. If that ever changes the iframe goes blank — the landing
page keeps a visible "Open it directly" link for exactly that case.

## 4. The assistant

Tenant `leafandloaf` on `chat.brahmando.com`, embedded at the bottom of the
Leaf & Loaf page. No API key in the browser: the widget posts to
`/api/embed/leafandloaf/stream`, nginx checks the `Origin` header against the
tenant's allowed domains and injects the key server-side.

CORS is confirmed working from `manailab.com` — the preflight returns
`access-control-allow-origin: https://manailab.com`, and an unrelated origin
gets a 403.

### ⚠ The assistant is not reliable yet

The tenant was created through the admin API, and tenants created that way live
only in the memory of the single pod that served the request. `tenant-overlay`
is an `emptyDir` in `k8s/orchestrator.yaml`, and `TenantRegistry.load()` runs
only at startup. Measured on the live service:

```
30 identical POSTs to /api/embed/leafandloaf/message
healthy: 11 / 30    404 "Tenant not found": 19 / 30
```

So the chat widget currently fails for roughly two visitors in three, and the
tenant will vanish entirely on the next pod restart.

**The fix** is [Brahmando-ai/brahmando-chatbot#2](https://github.com/Brahmando-ai/brahmando-chatbot/pull/2),
which adds `leafandloaf` to `orchestrator/config/tenants.yaml` and commits the
knowledge pack to `knowledge/leafandloaf/`. Merging and redeploying makes the
tenant durable and available on every replica. Until that lands, do not show
the assistant to the client.

### Re-ingesting knowledge

The knowledge pack in `knowledge/leaf-and-loaf/` here is the working copy; the
deployed copy lives in the chatbot repo. After the PR merges, a redeploy plus:

```bash
curl -u 'USER:PASS' -X POST https://chat.brahmando.com/admin/tenants/leafandloaf/knowledge/ingest
```

re-embeds it into the `leafandloaf_kb` Qdrant collection.

## 5. Local preview

```bash
python -m http.server 4173 --directory .
```

Then open `http://localhost:4173/` and
`http://localhost:4173/restaurants/leaf-and-loaf/`.
