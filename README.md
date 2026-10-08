# Herriton Property Valuations

React/Vite frontend plus Node.js email backend. All valuation, free quote, contact, location and referral partner forms submit to the same protected server endpoint.

## Local setup

Requires Node.js 22.12 or later. Run `npm install`, copy `.env.example` to `.env` if needed, configure your mail service in `.env`, then run `npm run dev`. Open http://localhost:5173. Stop and restart any older dev server first. Vite proxies `/api` to the backend on port 3001.

The recipient is `lahiru.xtream@gmail.com`. Configure SMTP_HOST, SMTP_PORT (587 or 465), SMTP_USER, SMTP_PASS and MAIL_FROM. MAIL_FROM must be an address authorised by your mail provider. Gmail receiving the email does not mean Gmail has to send it. Never put passwords in client code, `VITE_` variables, Git, or chat. `.env` is ignored by Git.

Without SMTP settings, submissions are disabled and no false success is shown. Success means the SMTP server accepted the configured recipient; inbox delivery still depends on the mail provider and spam filtering. Configure SPF/DKIM/DMARC for the sender's domain with that provider.

## Production

Run `npm run build` followed by `npm start` on hosting that supports a persistent Node.js service. Static-only hosting cannot run this backend. The production server serves `dist` and `/api` on the same origin.

Set NODE_ENV=production, APP_ORIGINS to your exact HTTPS origin (no trailing slash), MAIL_TO, sender/SMTP settings, TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY in private hosting environment settings. Create a Cloudflare Turnstile widget for the final domain. The server validates the token, hostname and `enquiry` action. Production refuses to start without SMTP and Turnstile configuration.

Put the server behind HTTPS, keep its backend port private, and configure HOST/PORT for the chosen host. TRUST_PROXY_IPS must contain only the real trusted reverse proxy IPs or subnets; leave empty for direct access. Do not set a blanket trust policy. Final proxy/TLS settings depend on hosting, which has not yet been selected.

## Attachments and safeguards

### Vercel form backend

`vercel.json` routes `/api/*` to `api/index.js`, which runs the same protected Express enquiry backend alongside the Vite static build. Deploy the entire `demo` project, not only `dist`. Missing production mail/CAPTCHA settings return HTTP 503; the UI keeps sending disabled until the backend is configured.

In Vercel's private Production environment variables, set `APP_ORIGINS=https://herriton.com.au`, `MAIL_TO=lahiru.xtream@gmail.com`, `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Authorise the sender with the mail provider and register herriton.com.au in the Turnstile widget. Redeploy after changing variables. Verify `/api/form-config` returns JSON with `available: true`, then submit a real contact enquiry and check receipt. Never put these secrets into client files or chat.

For Vercel's multiple function instances, configure shared/edge rate limiting before public launch; the included in-memory limits apply per instance. Keep attachments disabled unless a private scanner and hosting upload limits have been configured.

Attachments are disabled until CLAMAV_HOST points to a private, maintained ClamAV scanning service (port 3310 by default). Only PDF/JPG/PNG, maximum 2 files at 5 MB each, are accepted. The server checks filename extensions and file signatures, then requires a clean antivirus result before forwarding. DOC/DOCX attachments are intentionally unsupported. Uploaded buffers stay in process memory and are not saved, served, or executed. Keep ClamAV signatures updated and never expose its TCP port publicly. Signature and malware checks reduce risk; they cannot guarantee every document is harmless.

The backend enforces field lengths, enums, valid email/phone, consent, a honeypot, exact origin plus custom-header checks, request/file limits, per-IP rate limits, TLS SMTP, fixed sender/recipient, escaped HTML email with a plain-text alternative and generic errors. SMTP credentials are never exposed via the API. Security headers include CSP/HSTS; responses do not cache enquiry data. Request data and credentials are not logged.

Rate limits use an in-memory store suitable for a single running instance. For multiple replicas or serverless deployment, use a shared rate-limit store and edge limits before launch. Configure hosting request-body limits, monitoring, dependency updates and a company privacy notice. No system is 100% secure.

## Verification

`npm run test:server` tests validation, recipient control, origins, CAPTCHA failure, SMTP errors, rate limiting, file limits/signatures/scanning and production configuration. `npm test` checks browser forms, failure states and responsive layouts. Browser email responses and server SMTP are mocked in automated tests; no real email is sent. `npm audit` checks published dependency advisories.

Security references: [OWASP file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Cloudflare Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Nodemailer SMTP](https://nodemailer.com/smtp).

## Australian search optimisation

Builds pre-render 14 public pages/articles with their content present in HTML, unique page titles/descriptions, Australian English (`en-AU`), social previews and normal path-based links. Legacy hash URLs still open and change to their new paths. Articles have separate URLs. The server redirects missing trailing slashes and returns HTTP 404 for missing pages. Main images use responsive WebP sources and lower-page images lazy-load. External font downloads have been removed.

The confirmed public domain is https://herriton.com.au. Local and preview builds use noindex and a robots.txt that blocks crawling. Vercel production builds automatically use this domain and enable indexing unless SEO_INDEXING is explicitly false. No fictional address, phone number, ratings or reviews are included in structured data. The current service scope is Sydney/NSW from the existing brief; confirm actual coverage before publication.

Before the public production build, set:

```env
SITE_URL=https://herriton.com.au
SEO_INDEXING=true
```

Then run `npm run build:production`. This generates canonical URLs, a sitemap.xml and Organization/WebSite/WebPage/Breadcrumb/Service/Article structured data using that domain. For Vercel, set these environment variables in the Production environment only, and redeploy; remove any production SEO_INDEXING=false setting. Preview deployments must keep SEO_INDEXING=false. The existing HTTPS/security/email configuration is still required to run in production. Do not use SPA catch-all hosting rewrites that turn missing pages into HTTP 200; use the included Node server or equivalent path/404 configuration.

Run `npm run test:seo` after building to verify raw HTML, metadata, sitemap/schema generation, preview blocking, redirects and 404 status. The test temporarily generates a test-domain build and restores a non-indexable build afterwards; run `npm run build` again with your production environment after testing, before deployment.

After domain/hosting and real business details are ready: verify ownership in Google Search Console, submit `/sitemap.xml`, inspect representative page URLs, check Core Web Vitals on the live host, and create/update an eligible Google Business Profile with consistent, genuine name/address/contact information. A business street address and phone were not supplied, so LocalBusiness address markup is intentionally pending. Search rankings and indexing are controlled by search engines and are not guaranteed.

References: [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google LocalBusiness guidelines](https://developers.google.com/search/docs/appearance/structured-data/local-business).
