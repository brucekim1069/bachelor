window.BACHELOR_CONFIG = {
  GA4_ID: "G-3JC70205RN",
  META_PIXEL_ID: "1099018075907550",
  CLARITY_PROJECT_ID: "REPLACE_ME"
};

(() => {
  "use strict";

  const cfg = window.BACHELOR_CONFIG || {};
  const TRACKING_VERSION = "2026-09-19.1";
  const ATTRIBUTION_STORAGE_KEY = "bachelor_attribution_v1";
  const ATTRIBUTION_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "wbraid",
    "gbraid"
  ];
  const PRODUCT = {
    id: "BACHELOR-SOLID-300G",
    name: "BACHELOR Solid Deodorizer 300g",
    price: 15900,
    currency: "KRW"
  };

  const eventLog = [];
  window.BACHELOR_TRACKING = {
    version: TRACKING_VERSION,
    events: eventLog
  };

  const valid = value => value && !String(value).includes("REPLACE_ME");

  function recordEvent(platform, name, params) {
    eventLog.push({
      platform,
      name,
      params: { ...params },
      timestamp: new Date().toISOString()
    });
    if (document.documentElement) {
      document.documentElement.dataset.lastTrackingEvent = `${platform}:${name}`;
      document.documentElement.dataset.trackingEventCount = String(eventLog.length);
    }
  }

  function gaEvent(name, params = {}) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
      recordEvent("ga4", name, params);
    }
  }

  function metaEvent(name, params = {}, eventId = "") {
    if (typeof window.fbq === "function") {
      if (eventId) window.fbq("track", name, params, { eventID: eventId });
      else window.fbq("track", name, params);
      recordEvent("meta", name, { ...params, event_id: eventId || undefined });
    }
  }

  function metaCustomEvent(name, params = {}) {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", name, params);
      recordEvent("meta", name, params);
    }
  }

  function initAnalytics() {
    if (valid(cfg.GA4_ID)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID);
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.GA4_ID, { send_page_view: true });
    }

    if (valid(cfg.META_PIXEL_ID)) {
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
        n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
      }(window, document,"script","https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", cfg.META_PIXEL_ID);
      metaEvent("PageView");
      metaEvent("ViewContent", {
        content_ids: [PRODUCT.id],
        content_name: PRODUCT.name,
        content_type: "product",
        currency: PRODUCT.currency,
        value: PRODUCT.price
      });
    }

    if (valid(cfg.CLARITY_PROJECT_ID)) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", cfg.CLARITY_PROJECT_ID);
    }

    gaEvent("view_item", {
      currency: PRODUCT.currency,
      value: PRODUCT.price,
      items: [{
        item_id: PRODUCT.id,
        item_name: PRODUCT.name,
        price: PRODUCT.price,
        quantity: 1
      }]
    });
  }

  function readStoredAttribution() {
    try {
      return JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveAttribution(attribution) {
    try {
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch (_) {
      // Tracking still works when storage is unavailable.
    }
  }

  function captureAttribution() {
    const query = new URLSearchParams(window.location.search);
    const attribution = readStoredAttribution();

    ATTRIBUTION_KEYS.forEach(key => {
      const value = query.get(key);
      if (value) attribution[key] = value;
    });

    attribution.utm_source = attribution.utm_source || "direct";
    attribution.landing_page = attribution.landing_page || window.location.href.split("#")[0];
    attribution.referrer = attribution.referrer || document.referrer || "direct";
    attribution.attribution_captured_at = attribution.attribution_captured_at || new Date().toISOString();
    saveAttribution(attribution);
    return attribution;
  }

  function applyAttribution(form, attribution) {
    Object.entries(attribution).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = value;
    });
  }

  function makeEventId(prefix) {
    const random = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    return `${prefix}-${random}`;
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  initAnalytics();
  const attribution = captureAttribution();

  onReady(() => {
    const form = document.getElementById("waitlistForm");
    const success = document.getElementById("successMsg");
    if (!form || !success) return;

    applyAttribution(form, attribution);
    const trackingVersionField = form.elements.namedItem("tracking_version");
    if (trackingVersionField) trackingVersionField.value = TRACKING_VERSION;
    document.documentElement.dataset.trackingReady = "true";
    document.documentElement.dataset.trackingVersion = TRACKING_VERSION;
    document.documentElement.dataset.attributionSource = attribution.utm_source;
    document.documentElement.dataset.attributionCampaign = attribution.utm_campaign || "";
    document.documentElement.dataset.attributionKeys = ATTRIBUTION_KEYS
      .filter(key => Boolean(attribution[key]))
      .join(",");

    document.querySelectorAll('[data-track="cta_click"]').forEach(element => {
      element.addEventListener("click", () => {
        const params = {
          cta_id: element.dataset.ctaId || "unknown",
          cta_location: element.dataset.ctaLocation || "unknown",
          cta_text: element.dataset.ctaLabel || element.textContent.trim(),
          destination: element.getAttribute("href") || "",
          lead_source: attribution.utm_source,
          campaign_name: attribution.utm_campaign || ""
        };
        gaEvent("cta_click", params);
        metaCustomEvent("CtaClick", {
          content_name: params.cta_text,
          content_category: params.cta_location,
          destination: params.destination
        });
      });
    });

    let scroll50Sent = false;
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!scroll50Sent && max > 0 && (window.scrollY / max) >= 0.5) {
        scroll50Sent = true;
        gaEvent("scroll_50");
      }
    }, { passive: true });

    let formStarted = false;
    form.addEventListener("focusin", () => {
      if (formStarted) return;
      formStarted = true;
      gaEvent("form_start", { form_name: "waitlist" });
      metaCustomEvent("LeadFormStart", { form_name: "waitlist" });
    });

    const purchaseIntent = document.getElementById("purchase_intent");
    let purchaseIntentSent = false;
    const sendPurchaseIntent = () => {
      if (purchaseIntentSent || !purchaseIntent || !purchaseIntent.checked) return;
      purchaseIntentSent = true;
      const params = {
        currency: PRODUCT.currency,
        value: PRODUCT.price,
        item_id: PRODUCT.id,
        item_name: PRODUCT.name,
        intent_source: "explicit_checkbox"
      };
      gaEvent("purchase_intent", params);
      metaCustomEvent("PurchaseIntent", {
        content_ids: [PRODUCT.id],
        content_name: PRODUCT.name,
        content_type: "product",
        currency: PRODUCT.currency,
        value: PRODUCT.price,
        intent_source: "explicit_checkbox"
      });
    };
    if (purchaseIntent) purchaseIntent.addEventListener("change", sendPurchaseIntent);

    form.addEventListener("submit", async event => {
      event.preventDefault();

      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      if (!phone && !email) {
        window.alert("휴대전화 또는 이메일 중 하나를 입력해주세요.");
        return;
      }

      applyAttribution(form, attribution);
      const consentTimestamp = form.elements.namedItem("consent_timestamp");
      if (consentTimestamp) consentTimestamp.value = new Date().toISOString();
      const eventId = makeEventId("lead");
      const eventIdField = form.elements.namedItem("event_id");
      if (eventIdField) eventIdField.value = eventId;

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "신청 중...";

      try {
        if (window.location.protocol === "file:") {
          await new Promise(resolve => setTimeout(resolve, 250));
        } else {
          const body = new URLSearchParams(new FormData(form));
          const response = await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString()
          });
          if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);
        }

        gaEvent("generate_lead", {
          form_name: "waitlist",
          lead_source: attribution.utm_source,
          campaign_name: attribution.utm_campaign || "",
          campaign_content: attribution.utm_content || "",
          interest: document.getElementById("interest").value || "not_selected",
          purchase_intent: purchaseIntent && purchaseIntent.checked ? "yes" : "no"
        });
        metaEvent("Lead", {
          content_name: PRODUCT.name,
          content_category: "prelaunch_waitlist",
          status: "submitted"
        }, eventId);
        sendPurchaseIntent();

        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
        submitButton.textContent = "신청 완료";
      } catch (error) {
        console.error(error);
        window.alert("신청 전송에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.");
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  });
})();
