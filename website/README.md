# Basic Mails website

Next.js App Router + TypeScript + React + Motion. All source lives in `website/`.

## Run

Requires Node.js 20.9 or newer.

```sh
cd website
npm install
npm run dev
```

## Validate and build

```sh
npm run typecheck
npm run build
npm start
```

## Routes

- `/`: animated coming-soon home, interactive inbox, feature principles
- `/experience`: larger interactive mail preview
- `/about`: project philosophy
- `/updates`: build notes and animated FAQ
- `/sitemap.xml`, `/robots.txt`: search engine metadata

## Interactive preview

Search sample mail (press `/` while focused inside the preview), filter unread messages, star/unstar, archive/restore, mark read/unread, reset the demo, and compose or edit a demo draft. Native dialogs handle keyboard focus and Escape. On mobile, opening a message switches to the reading pane with a back button. Demo state is memory-only and resets on refresh or route navigation. No messages are sent, no accounts are created, and no waitlist data is collected.

The matte dark theme is rendered on the server and is consistent across all pages. Motion respects reduced-motion preferences. All mail content is fictional. The actual mail service has not launched.

## Vercel

Import the repository with **Root Directory: `website`** and **Framework: Next.js**. The included `vercel.json` sets the install/build commands. Direct connector deployments upload the contents of this folder. Automatic GitHub deployment requires linking the repository in Vercel.

The marketing pages require no environment variables. The protected demo requires `DEMO_PASSWORD` (see below). Geist is optimized with `next/font`. The site origin is configured in `src/lib/site.ts`.

## Structure

`src/app` owns routes and metadata, `src/components` contains reusable UI and interactive components, `src/lib` holds site configuration and sample content, `src/styles` contains the inbox and route styles, and `public` contains the favicon.


## Protected mailbox demo: `/demo`

Set **DEMO_PASSWORD** in Vercel → Basic Mails → Settings → Environment Variables for **Production** (and Preview if desired), then redeploy. Use a random password of at least **16 characters**. Do not prefix it with `NEXT_PUBLIC_`. An absent or short password leaves the demo locked. Nothing sensitive is embedded in the source.

For local development copy `.env.example` to `.env.local` and set your own password. Sign in at `/demo/login`.

The demo includes inbox, starred, drafts, sample sent messages, archive, spam and trash; full-text search and filters; bulk actions and undo; labels; autosaved drafts with Cc/Bcc, attachments, replies and forwards; downloadable attachments and EML export; contact CRUD; signature, name and density settings; and a reset option. **There is no sending endpoint and no live receiving integration.**

Each browser has its own mailbox. State is encrypted with AES-GCM in localStorage; the encryption key is only delivered after server authentication. Mailbox data is not synchronized between devices. Up to 1 MB per attachment and 2 MB per draft are allowed, subject to browser quota. Saving failures are displayed in the status bar. Avoid real confidential data in this demo.

Authentication uses server-verified HMAC sessions in HttpOnly, SameSite=Strict cookies (Secure and __Host- prefix in production), with an 8-hour expiry. Login and logout require same-origin requests. Missing or short password configuration fails closed. Password rotation invalidates existing sessions and makes previous local encrypted demo data unreadable; a fresh sample mailbox is then loaded. Throttling is best-effort per server instance, not a distributed rate limiter. Logout removes the browser session cookie; shared-password demo access is not a multi-user account system.

### Validation

```sh
npm run typecheck
node --experimental-strip-types --test tests/demo-auth.test.mjs
```

The source remains in `website/`. Import that subfolder as the Vercel root when linking GitHub.

## Team, legal page and connection protection

`/team` lists Benjamin (Founder), Zeno (Co-Founder), and Carlos (Marketing Manager). `/impressum` contains the supplied legal notice verbatim and remains reachable from restricted connections.

Add `PROXYCHECK_API_KEY` as a private/sensitive Vercel environment variable for Production (and Preview if desired), then redeploy. The key is used only on the server. Until configured, the connection filter is inactive. The existing `DEMO_PASSWORD` still protects the mailbox independently.

Next.js Proxy checks the Vercel-provided visitor IP against the supported proxycheck.io v2 API (`vpn=1&asn=1`). Detected proxies, VPNs, Tor and hosting connections are redirected to `/access-restricted`, which returns HTTP 403 with IP, type, provider, ASN and Retry. API calls return 403 JSON. No Discord authentication or login exemption is implied. Assets, legal information, sitemap/robots, and logout remain accessible.

When configured, lookup errors, quota failures and missing visitor IPs return a separate HTTP 503 screen, never a false VPN accusation. Lookups time out after four seconds. A bounded per-instance memory cache stores allowed results for 60 seconds and blocked results for 15 seconds; this is not a distributed cache. IP addresses are sent to proxycheck.io for the lookup. Only deploy this header trust model behind Vercel; direct self-hosting requires a trusted reverse proxy that overwrites visitor-IP headers.

References: https://proxycheck.io/api/ and https://vercel.com/docs/headers/request-headers

## Launch waiting list

Routes: `/waitlist`, `/waitlist/confirm`, `/waitlist/unsubscribe`, `/roadmap`, `/datenschutz`. Unknown URLs render the custom 404 page.

Configure these **server-only Vercel Production variables**, then redeploy:

- `RESEND_API_KEY`: Resend sending API key.
- `RESEND_FROM`: e.g. `Basic Mails <hello@basicmails.de>`. The sending domain must first be verified in Resend; the resend.dev test sender cannot deliver to arbitrary visitors.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: a dedicated private Upstash Redis database (EU region recommended), available through Vercel Storage / Marketplace.

The canonical origin is `https://www.basicmails.de`. No password or shared signing secret is needed for the waiting list: tokens are independently random 256-bit values, with only their hashes used in keys. Pending addresses are NOT active subscribers. Opening an email link does not change state; the user must press the confirmation button (POST). Tokens travel in URL fragments, are removed from the browser address after loading, and never appear in server request URLs. Abmeldung and confirmation remain reachable from VPN connections.

Duplicate address records are prevented atomically in Redis. Pending entries expire after 48 hours. Confirmed entries and unsubscribe links expire after one year; removal deletes the subscription immediately and old confirmation links cannot restore it. Confirmation is idempotent. Requests are limited to five per IP/hour, one attempted email per address/hour and 100 attempted confirmation sends/day across all server instances. Limits fail closed if Redis is unavailable. A honeypot and same-origin checks provide additional protection. On an ambiguous Resend network timeout, pending records remain valid in case the message was accepted.

Confirmation emails include both HTML/plain text and a remove/unsubscribe link. Keep Resend click/open tracking disabled for these transactional links. No broadcasts or marketing messages are sent by the deployment. To export currently confirmed subscribers from a trusted terminal with the same variables set:

```bash
node --experimental-strip-types scripts/export-waitlist.mjs > waitlist.json
```

The export includes each unsubscribe URL and consent timestamps. Store it privately; check subscription state again before any later launch mailing, and include the unsubscribe link. Do not commit subscriber data. Customer requests can also be removed by their email address using the private `wl:address:<sha256(normalized-email)>` index and the associated entry/unsubscribe keys.

### Privacy notice review

The published privacy text describes this implementation. Before activating sign-ups, verify the actual provider contracts/DPAs, database region, Vercel log retention, Resend retention and international-transfer safeguards for the accounts you use. These settings cannot be verified from source code. Update the notice if those settings or processing purposes change. The source links are included in the privacy page. The wording is an implementation-specific draft, not a legal compliance certification.

### Waiting-list diagnostics

Run `npm run check:waitlist` in an environment with the server variables loaded. This read-only check logs categories only and never prints credentials or subscriber data. Builds do not make diagnostic API calls.

`EMAIL_KEY_FORMAT` means `RESEND_API_KEY` is not a complete valid-format key. Copy the full key when creating it in Resend (not a masked display), replace the Vercel Production environment variable, and redeploy. Never paste keys into chat, commit them, or prefix them with `NEXT_PUBLIC_`. The intended sender is `BasicMails Team <team@basicmails.de>`; verify `basicmails.de` in Resend.

Unconfirmed requests can request a fresh link after the one-hour resend cooldown. This also recovers from an earlier failed connection; replacing a pending request invalidates its old confirmation link. Confirmed subscriptions are preserved.
