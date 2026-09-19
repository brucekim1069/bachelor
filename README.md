# BACHELOR

Pre-launch landing page for BACHELOR men's odor care.

Managed with ChatGPT + Netlify continuous deployment.

## Analytics funnel

- GA4: `page_view` (automatic), `view_item`, `cta_click`, `form_start`, `purchase_intent`, `generate_lead`
- Meta: `PageView`, `ViewContent`, `CtaClick`, `LeadFormStart`, `PurchaseIntent`, `Lead`
- `purchase_intent` is emitted only after a visitor explicitly checks the 15,900 KRW purchase-intent option.
- UTM parameters and ad click IDs are persisted for the browser session and submitted with the Netlify form.
- The lead `event_id` is stored with the form submission for future Meta CAPI deduplication.

Run `npm run check` before deployment.
