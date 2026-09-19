const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('every in-page CTA has unified tracking metadata', () => {
  const ctas = [...html.matchAll(/<a\b[^>]*href="#[^"]+"[^>]*>/g)].map(match => match[0]);
  assert.ok(ctas.length >= 4);
  for (const cta of ctas) {
    assert.match(cta, /data-track="cta_click"/);
    assert.match(cta, /data-cta-id="[^"]+"/);
    assert.match(cta, /data-cta-location="[^"]+"/);
  }
});

test('Netlify form registers attribution, consent, and deduplication fields', () => {
  const requiredNames = [
    'form-name', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
    'utm_term', 'fbclid', 'gclid', 'wbraid', 'gbraid', 'landing_page',
    'referrer', 'attribution_captured_at', 'consent_timestamp',
    'privacy_policy_version', 'event_id', 'tracking_version',
    'privacy_consent', 'purchase_intent'
  ];
  for (const name of requiredNames) assert.match(html, new RegExp(`name="${name}"`));
  assert.match(html, /name="privacy_consent"[^>]*required/);
});

test('GA4 and Meta receive the complete prelaunch funnel', () => {
  for (const eventName of ['view_item', 'cta_click', 'form_start', 'purchase_intent', 'generate_lead']) {
    assert.ok(app.includes(`"${eventName}"`), `Missing GA4 event: ${eventName}`);
  }
  for (const eventName of ['PageView', 'ViewContent', 'CtaClick', 'LeadFormStart', 'PurchaseIntent', 'Lead']) {
    assert.ok(app.includes(`"${eventName}"`), `Missing Meta event: ${eventName}`);
  }
  assert.match(app, /eventID: eventId/);
  assert.match(app, /dataset\.lastTrackingEvent/);
  assert.match(app, /dataset\.attributionKeys/);
});

test('lead value is not reported as product revenue', () => {
  const generateLeadBlock = app.slice(app.indexOf('gaEvent("generate_lead"'), app.indexOf('metaEvent("Lead"'));
  assert.ok(!generateLeadBlock.includes('value: PRODUCT.price'));
  assert.ok(!generateLeadBlock.includes('currency: PRODUCT.currency'));
});
