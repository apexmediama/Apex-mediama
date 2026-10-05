/* Apex Media Leads · main.js · rev 2026-09-30
   Classic script (no modules). Every feature is optional: the page
   reads fine with JavaScript off. */
(function () {
  "use strict";

  /* ------------------------------------------------------------
     Settings. Edit these, nothing else.
     ------------------------------------------------------------ */
  var CONFIG = {
    calendlyUrl: "https://calendly.com/yendryquintero808/15",
    formEndpoint: "https://formspree.io/f/xqeyzkqd",
    phoneDisplay: "(870) 600-4285",
    metaPixelId: "1300463091913590",
    googleAdsId: "",                                   // e.g. "AW-123456789"
    googleAdsLabels: { booking: "", form: "", call: "" },
    liveHosts: ["apexmediama.com", "www.apexmediama.com"]
  };

  var root = document.documentElement;
  var isEs = (root.lang || "").toLowerCase().indexOf("es") === 0;
  var T = isEs ? {
    required: "Obligatorio.", phone: "Escriba un teléfono de 10 dígitos.", sending: "Enviando\u2026",
    failed: "No se pudo enviar. Llámenos al {phone} o intente de nuevo."
  } : {
    required: "Required.", phone: "Enter a 10-digit phone number.", sending: "Sending\u2026",
    failed: "That didn't go through. Call us at {phone} or try again."
  };
  var isLive = CONFIG.liveHosts.indexOf(location.hostname) !== -1;
  var attribution = {};

  function $(sel, scope) { return (scope || document).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function sdel(k) { try { sessionStorage.removeItem(k); } catch (e) { /* private mode */ } }

  /* ------------------------------------------------------------
     Tracking: Meta Pixel + Google Ads, only on the real domain.
     ------------------------------------------------------------ */
  function loadPixel() {
    if (!CONFIG.metaPixelId || window.fbq) return;
    /* Meta's standard base code */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
  }

  function loadGoogleAds() {
    if (!CONFIG.googleAdsId) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.googleAdsId);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.googleAdsId);
  }

  /* kind: "booking" | "form" | "call" */
  function track(kind) {
    var metaEvent = { booking: "Schedule", form: "Lead", call: "Contact" }[kind];
    if (!isLive) { if (window.console) console.info("[preview] conversion not sent:", kind); return; }
    if (window.fbq && metaEvent) window.fbq("track", metaEvent);
    var label = CONFIG.googleAdsLabels[kind];
    if (window.gtag && CONFIG.googleAdsId && label) {
      window.gtag("event", "conversion", { send_to: CONFIG.googleAdsId + "/" + label });
    }
  }

  function initTracking() {
    if (!isLive) {
      root.classList.add("is-preview");
      return;
    }
    loadPixel();
    loadGoogleAds();
  }

  /* ------------------------------------------------------------
     Attribution: keep the ad's UTM tags for the whole visit and
     pass them to Calendly and the call-back form.
     ------------------------------------------------------------ */
  var ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "trade"];

  function initAttribution() {
    var stored = {};
    try { stored = JSON.parse(sget("apex_attr") || "{}") || {}; } catch (e) { stored = {}; }
    var fresh = {};
    var params = new URLSearchParams(location.search);
    ATTR_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) fresh[k] = v.slice(0, 150);
    });
    if (Object.keys(fresh).length) { attribution = fresh; sset("apex_attr", JSON.stringify(fresh)); }
    else { attribution = stored; }
    $$("[data-attr]").forEach(function (input) {
      var k = input.getAttribute("data-attr");
      if (attribution[k]) input.value = attribution[k];
    });
  }

  var TRADE_RULES = [
    ["hvac", /hvac|heating|cooling|heat.?pump|air.?condition/],
    ["pools", /pool|outdoor.?living/],
    ["foundation", /foundation|slab|pier/],
    ["remodel", /remodel|kitchen|bath/],
    ["windows", /window|door/],
    ["epoxy", /epoxy|coating|garage|polyaspartic/],
    ["roof", /roof/]
  ];
  var TRADE_FORM_VALUE = {
    roof: "Roofing", hvac: "HVAC", pools: "Pools", foundation: "Foundation repair",
    remodel: "Kitchen & bath", windows: "Windows & doors", epoxy: "Epoxy & coatings"
  };

  function tradeHint() {
    var t = [attribution.trade, attribution.utm_campaign, attribution.utm_term, attribution.utm_content].join(" ").toLowerCase();
    for (var i = 0; i < TRADE_RULES.length; i++) {
      if (TRADE_RULES[i][1].test(t)) return TRADE_RULES[i][0];
    }
    return "";
  }

  /* ------------------------------------------------------------
     The board: appointments book in one by one, Roofing/HVAC tabs.
     ------------------------------------------------------------ */
  function initBoard() {
    var board = $("[data-board]");
    if (!board) return;
    var tabs = $$("[role=tab]", board);

    function select(id, replay) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-tab") === id;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      var current = $('[role=tab][aria-selected="true"]', board);
      var strip = current && current.parentNode;
      if (strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollLeft = current.offsetLeft - (strip.clientWidth - current.offsetWidth) / 2;
      }
      if (replay) {
        board.classList.remove("play");
        void board.offsetWidth; /* restart the CSS animation */
        board.classList.add("play");
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab.getAttribute("data-tab"), true); });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        select(next.getAttribute("data-tab"), true);
      });
    });

    var hint = tradeHint();
    if (hint) select(hint, false);

    var trade = $("#cb-trade");
    if (trade && hint && TRADE_FORM_VALUE[hint]) trade.value = TRADE_FORM_VALUE[hint];

    board.classList.add("play");
  }

  /* ------------------------------------------------------------
     Trade index: questions open on wide screens, tucked away on phones.
     ------------------------------------------------------------ */
  function initTradeIndex() {
    var list = $$("[data-trade-qs]");
    if (!list.length || !window.matchMedia) return;
    var wide = window.matchMedia("(min-width: 960px)");
    function sync() { list.forEach(function (d) { d.open = wide.matches; }); }
    sync();
    if (wide.addEventListener) wide.addEventListener("change", sync);
  }

  /* ------------------------------------------------------------
     Phone taps count as a conversion.
     ------------------------------------------------------------ */
  function initCalls() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
      if (a) track("call");
    });
  }

  /* ------------------------------------------------------------
     Calendly inline, loaded when the booking section gets close.
     ------------------------------------------------------------ */
  function calendlyUrl() {
    var box = $("[data-calendly]");
    var u = (box && box.getAttribute("data-url")) || CONFIG.calendlyUrl;
    var q = "hide_gdpr_banner=1&primary_color=8c6a1c&text_color=0e1b2e&background_color=ffffff";
    return u + (u.indexOf("?") === -1 ? "?" : "&") + q;
  }

  function calendlyUtm() {
    var map = { utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign", utm_content: "utmContent", utm_term: "utmTerm" };
    var out = {};
    Object.keys(map).forEach(function (k) { if (attribution[k]) out[map[k]] = attribution[k]; });
    return out;
  }

  function initCalendly() {
    var box = $("[data-calendly]");
    var mount = $("[data-calendly-mount]");
    if (!box || !mount) return;
    var requested = false;

    function load() {
      if (requested) return;
      requested = true;
      var s = document.createElement("script");
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      s.onload = function () {
        if (!window.Calendly || typeof window.Calendly.initInlineWidget !== "function") return;
        window.Calendly.initInlineWidget({ url: calendlyUrl(), parentElement: mount, utm: calendlyUtm() });
        box.classList.add("is-live");
      };
      document.head.appendChild(s);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { load(); io.disconnect(); } });
      }, { rootMargin: "900px 0px", threshold: 0.01 });
      io.observe(box);
    } else {
      load();
    }

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href="#book"]') : null;
      if (a) load();
    });

    window.addEventListener("message", function (e) {
      if (e.origin !== "https://calendly.com" || !e.data || typeof e.data !== "object") return;
      if (e.data.event === "calendly.event_scheduled") track("booking");
    });
  }

  /* ------------------------------------------------------------
     Call-back form → Formspree, then the thank-you page.
     ------------------------------------------------------------ */
  function initForm() {
    var form = $("[data-callback]");
    if (!form) return;
    var msg = $(".form-msg", form);
    var btn = $("button[type=submit]", form);
    var btnText = btn ? btn.textContent : "";

    function setError(field, text) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.toggle("is-invalid", !!text);
      var el = $(".field__err", wrap);
      if (!el && text) {
        el = document.createElement("span");
        el.className = "field__err";
        el.id = field.id + "-err";
        wrap.appendChild(el);
        field.setAttribute("aria-describedby", el.id);
      }
      if (el) el.textContent = text || "";
      field.setAttribute("aria-invalid", text ? "true" : "false");
    }

    function check(field) {
      var v = (field.value || "").trim();
      if (field.required && !v) { setError(field, T.required); return false; }
      if (field.type === "tel" && v.replace(/\D/g, "").length < 10) { setError(field, T.phone); return false; }
      setError(field, "");
      return true;
    }

    var fields = $$("input[required], select[required]", form);
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value) check(f); });
      f.addEventListener("change", function () { if (f.getAttribute("aria-invalid") === "true") check(f); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var results = fields.map(check);
      if (results.indexOf(false) !== -1) {
        var first = fields.filter(function (f) { return f.getAttribute("aria-invalid") === "true"; })[0];
        if (first) first.focus();
        return;
      }
      var trap = $('[name="_gotcha"]', form);
      if (trap && trap.value) return;

      btn.disabled = true;
      btn.textContent = T.sending;
      msg.textContent = "";

      fetch(CONFIG.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          sset("apex_lead", "1");
          location.href = (form.getAttribute("data-thanks") || "thanks.html") + "?src=form";
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = btnText;
          msg.textContent = T.failed.replace("{phone}", CONFIG.phoneDisplay);
        });
    });
  }

  /* ------------------------------------------------------------
     Thank-you page: count the lead once.
     ------------------------------------------------------------ */
  function initThanks() {
    if (!document.body.hasAttribute("data-thanks")) return;
    var src = new URLSearchParams(location.search).get("src");
    if (src === "form" && sget("apex_lead") === "1") {
      sdel("apex_lead");
      track("form");
    }
  }

  /* ------------------------------------------------------------
     Mobile dock steps aside while the booking section is on screen.
     ------------------------------------------------------------ */
  function initDock() {
    var dock = $(".dock");
    var book = $("#book");
    if (!dock || !book || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { dock.classList.toggle("is-hidden", en.isIntersecting); });
    }, { threshold: 0.01 }).observe(book);
  }

  /* ------------------------------------------------------------
     Motion: sections ease in as they scroll into view; the nav
     picks up a soft shadow once the page moves.
     ------------------------------------------------------------ */
  function initMotion() {
    var nav = $(".nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var items = $$(".sec-head, .feat, .show, .bcard, .steps-tabs, .who > div, .split > div, .trade, .plan, .incl, .extra, .wcard, .band, .quote, .faq details, .book__grid > *, .foot__cta");
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; /* already on screen: leave it alone */
      var sib = el.previousElementSibling;
      var idx = 0;
      while (sib && idx < 4) { if (sib.classList.contains("rv")) idx++; else break; sib = sib.previousElementSibling; }
      el.style.setProperty("--rv-d", (idx * 0.07) + "s");
      el.classList.add("rv");
    });
    root.classList.add("js-motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".rv").forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------
     Step tabs: Form, Call, Qualify, Book.
     ------------------------------------------------------------ */
  function initSteps() {
    var bar = $("[data-steps]");
    if (!bar) return;
    var tabs = $$("[role=tab]", bar);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) { panel.hidden = !on; panel.classList.toggle("is-on", on); }
      });
      if (focus) tab.focus();
      if (bar.scrollWidth > bar.clientWidth) bar.scrollLeft = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        select(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length], true);
      });
    });
  }

  function boot() {
    safe(initTracking, "tracking");
    safe(initAttribution, "attribution");
    safe(initBoard, "board");
    safe(initTradeIndex, "tradeIndex");
    safe(initCalls, "calls");
    safe(initCalendly, "calendly");
    safe(initForm, "form");
    safe(initDock, "dock");
    safe(initThanks, "thanks");
    safe(initSteps, "steps");
    safe(initMotion, "motion");
    root.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
