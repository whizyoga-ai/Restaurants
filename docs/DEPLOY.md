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

`manailab.com` already resolves, but **not to GitHub Pages**. It points at
Cloudflare proxy IPs (`104.21.71.26`, `172.67.142.109`) in front of a
pre-existing origin that serves a near-copy of the main Brahmexa site — 71 KB
titled *"BRAHMEXA – The Business Brain Company"*, with no reference to this
repository. Every path from here 404s on it:

```
https://manailab.com/restaurants/leaf-and-loaf/   404
https://manailab.com/assets/manailab.css          404
```

That is why the Leaf & Loaf circle was invisible: the `CNAME` file claimed the
domain with GitHub, but DNS never routed there, so
`whizyoga-ai.github.io/Restaurants/` merely 301'd to a page that contains none
of this.

### Repointing it

**This replaces whatever that origin serves at `manailab.com`.** Take a copy of
it first if it matters — the origin is hidden behind Cloudflare's proxy, so it
cannot be recovered from DNS afterwards.

In the Cloudflare dashboard, zone `manailab.com` → **DNS** → **Records**,
delete the two existing `A` records for `@`, then add:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** (grey cloud) |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| CNAME | `www` | `whizyoga-ai.github.io` | **DNS only** |

Leave the `TXT` SPF record alone — it is mail, not web.

Set the proxy to **DNS only** at first. GitHub cannot issue its Let's Encrypt
certificate through Cloudflare's proxy, so an orange cloud here produces a
redirect loop or a certificate error. Once GitHub reports the certificate as
issued you may turn the proxy on, with SSL/TLS mode set to **Full (strict)**.

Then confirm it landed and enable HTTPS enforcement:

```bash
nslookup manailab.com 8.8.8.8
```

```bash
gh api -X PUT repos/whizyoga-ai/Restaurants/pages -f cname=manailab.com -F https_enforced=true
```

The `CNAME` file is committed and ready, so no code change is needed once DNS
moves — but the Pages custom-domain setting was deliberately cleared while the
domain pointed elsewhere, so the `gh api` line above is what re-arms it.

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
