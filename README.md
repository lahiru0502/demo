# Acre — property valuation client demo

React + Vite responsive concept based on `Theme.docx`. Includes a landing page, market assessment page with quote form, and a three-step valuation request (contact, property, ownership), with validation and a review/confirmation state.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. Production build: `npm run build`. Preview: `npm run preview`.

## Client preview

Additional pages: Our Clients, Our Specialties, Insight (filterable articles with reading views), Our Locations (search and area enquiry), Contact Us, Referral Partner, and About Us. Each page has a direct hash URL, such as `/#locations`, and is available in desktop/mobile navigation and the footer. Client descriptions, company story, editorial content and service coverage are sample content; no third-party client logos or credentials are attributed to Acre. Contact and partner forms validate inputs and show local demo confirmations.

Browser checks: `npm test` (uses installed Microsoft Edge through Playwright).

Use the navigation and valuation buttons to explore the pages. The form retains values while moving between steps. Required fields and email format are validated. Submissions show a demo confirmation; no backend, payment, email delivery or permanent storage is connected. Refreshing clears entered values. Acre is a sample brand and the contact email uses the reserved `.example` domain.

Original references: https://romeopropertyvaluers.com.au/ and https://duotax.com.au/property-valuations/market-assessment-valuation/ and https://duotax.com.au/property-valuations/order/ . Embedded brief screenshots are in `reference/`. The design uses original sample copy, green/ivory styling, and Unsplash imagery. Images and Google Fonts require internet access; system fonts are provided as fallbacks.

Before launch, replace sample branding/contact details, confirm all service copy, and integrate form processing and an appropriate privacy policy.
