window.BACHELOR_CONFIG = {
  GA4_ID: "G-3JC70205RN",
  META_PIXEL_ID: "1099018075907550",
  CLARITY_PROJECT_ID: "REPLACE_ME"
};

(function () {
  const cfg = window.BACHELOR_CONFIG || {};
  const valid = v => v && !String(v).includes("REPLACE_ME");

  if (valid(cfg.GA4_ID)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.GA4_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){dataLayer.push(arguments);};
    gtag("js", new Date());
    gtag("config", cfg.GA4_ID, {send_page_view:true});
  }

  if (valid(cfg.META_PIXEL_ID)) {
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window, document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", cfg.META_PIXEL_ID);
    fbq("track", "PageView");
  }

  if (valid(cfg.CLARITY_PROJECT_ID)) {
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", cfg.CLARITY_PROJECT_ID);
  }
})();

const params = new URLSearchParams(location.search);
["utm_source","utm_medium","utm_campaign","utm_content","fbclid"].forEach(key => {
  const el = document.getElementById(key);
  if (el) el.value = params.get(key) || "";
});

function gaEvent(name, eventParams={}) {
  if (typeof window.gtag === "function") window.gtag("event", name, eventParams);
}
function metaEvent(name, eventParams={}) {
  if (typeof window.fbq === "function") window.fbq("track", name, eventParams);
}

document.querySelectorAll("[data-track]").forEach(el => {
  el.addEventListener("click", () => {
    gaEvent(el.dataset.track, {
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || ""
    });
  });
});

let scroll50 = false;
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (!scroll50 && max > 0 && (window.scrollY / max) >= 0.5) {
    scroll50 = true;
    gaEvent("scroll_50");
  }
}, {passive:true});

const form = document.getElementById("waitlistForm");
const success = document.getElementById("successMsg");
let formStarted = false;

form.addEventListener("focusin", () => {
  if (!formStarted) {
    formStarted = true;
    gaEvent("form_start", {form_name:"waitlist"});
  }
});

form.addEventListener("submit", async function(e){
  e.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!phone && !email) {
    alert("휴대전화 또는 이메일 중 하나를 입력해주세요.");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "신청 중...";

  try {
    if (location.protocol === "file:") {
      await new Promise(r => setTimeout(r, 250));
    } else {
      const body = new URLSearchParams(new FormData(form));
      const res = await fetch("/", {
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body: body.toString()
      });
      if (!res.ok) throw new Error("Form submission failed");
    }

    gaEvent("generate_lead", {
      currency:"KRW",
      value:15900,
      lead_source: params.get("utm_source") || "direct",
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || ""
    });
    metaEvent("Lead", {currency:"KRW", value:15900});

    success.style.display = "block";
    success.scrollIntoView({behavior:"smooth", block:"center"});
    submitBtn.textContent = "신청 완료";
  } catch (err) {
    console.error(err);
    alert("신청 전송에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.");
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
