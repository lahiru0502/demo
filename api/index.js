import { createApp, configuration } from "../server/app.js";

// Keep the existing validation, CAPTCHA and mail handling on Vercel too.
// Initialisation is deferred so missing hosting settings return JSON, not a
// crashed function or a static HTML page.
export function createVercelHandler(env = process.env) {
  let app;
  return (req, res) => {
    if (!app) {
      try {
        app = createApp({
          config: configuration({ ...env, NODE_ENV: "production" }),
        });
      } catch (error) {
        const required = [
          "APP_ORIGINS",
          "SMTP_HOST",
          "SMTP_USER",
          "SMTP_PASS",
          "MAIL_FROM",
          "MAIL_TO",
          "TURNSTILE_SITE_KEY",
          "TURNSTILE_SECRET_KEY",
        ];
        const missing = required.filter(
          (key) => !String(env[key] || "").trim(),
        );
        const knownErrors = [
          "APP_ORIGINS must contain exact origins (HTTPS in production).",
          "SMTP_PORT must be 465 or 587.",
          "Production requires SMTP and Turnstile settings.",
        ];
        console.error("Herriton enquiry backend configuration failed.", {
          missingVariables: missing,
          reason: knownErrors.includes(error.message)
            ? error.message
            : "Backend initialisation failed.",
        });
        res.statusCode = 503;
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.end(
          JSON.stringify({
            error:
              "Enquiries are unavailable at the moment. Please try again later.",
          }),
        );
      }
    }
    return app(req, res);
  };
}

export default createVercelHandler();
