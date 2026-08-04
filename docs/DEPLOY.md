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

`manailab.com` sits on Cloudflare nameservers (`daisy` / `ricardo.ns.cloudflare.com`)
with **no A or CNAME record**, so nothing resolves yet. I do not have a
Cloudflare API token, so these records have to be added by hand.

In the Cloudflare dashboard, zone `manailab.com` → **DNS** → **Records**:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **DNS only** (grey cloud) |
| A | `@` | `185.199.109.153` | **DNS only** |
| A | `@` | `185.199.110.153` | **DNS only** |
| A | `@` | `185.199.111.153` | **DNS only** |
| CNAME | `www` | `whizyoga-ai.github.io` | **DNS only** |

Set the proxy to **DNS only** at first. GitHub cannot issue its Let's Encrypt
certificate through Cloudflare's proxy, so an orange cloud here produces a
redirect loop or a certificate error. Once GitHub reports the certificate as
issued you may turn the proxy on, with SSL/TLS mode set to **Full (strict)**.

Then check propagation and enable HTTPS enforcement:

```bash
nslookup manailab.com 8.8.8.8
```

```bash
gh api -X PUT repos/whizyoga-ai/Restaurants/pages -f https_enforced=true
```

## 3. What lives where

| URL | Content |
|---|---|
| `https://manailab.com/` | The Leaf & Loaf circle, then `https://saas.brahmexa.com/smb/` in a borderless iframe |
| `https://manailab.com/restaurants/leaf-and-loaf/` | The Leaf & Loaf site |

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
