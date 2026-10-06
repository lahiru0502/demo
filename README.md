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

Attachments are disabled until CLAMAV_HOST points to a private, maintained ClamAV scanning service (port 3310 by default). Only PDF/JPG/PNG, maximum 2 files at 5 MB each, are accepted. The server checks filename extensions and file signatures, then requires a clean antivirus result before forwarding. DOC/DOCX attachments are intentionally unsupported. Uploaded buffers stay in process memory and are not saved, served, or executed. Keep ClamAV signatures updated and never expose its TCP port publicly. Signature and malware checks reduce risk; they cannot guarantee every document is harmless.

The backend enforces field lengths, enums, valid email/phone, consent, a honeypot, exact origin plus custom-header checks, request/file limits, per-IP rate limits, TLS SMTP, fixed sender/recipient, plain-text email and generic errors. SMTP credentials are never exposed via the API. Security headers include CSP/HSTS; responses do not cache enquiry data. Request data and credentials are not logged.

Rate limits use an in-memory store suitable for a single running instance. For multiple replicas or serverless deployment, use a shared rate-limit store and edge limits before launch. Configure hosting request-body limits, monitoring, dependency updates and a company privacy notice. No system is 100% secure.

## Verification

`npm run test:server` tests validation, recipient control, origins, CAPTCHA failure, SMTP errors, rate limiting, file limits/signatures/scanning and production configuration. `npm test` checks browser forms, failure states and responsive layouts. Browser email responses and server SMTP are mocked in automated tests; no real email is sent. `npm audit` checks published dependency advisories.

Security references: [OWASP file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Cloudflare Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Nodemailer SMTP](https://nodemailer.com/smtp).
