/* Ava — AI chat for Apex Media Growth.
   The brain lives in Make (scenario "APEX GROWTH | Ava chat web"). This file only draws the chat and sends the conversation.
   Config: set AVA_ENDPOINT to the Make webhook URL. Never put API keys here (this file is public). */
(function () {
  "use strict";
  var AVA_ENDPOINT = "https://hook.us2.make.com/y76rmhc82gjsi9ylsnt7grqe7hi199th"; // Make: APEX GROWTH | Ava chat web
  var CALENDLY = "https://calendly.com/yendryquintero808/15";
  var EMAIL = "apexmediama@gmail.com";
  var MAX_USER_MSGS = 30, MAX_LEN = 600;

  var lang = (document.documentElement.lang || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en";
  var T = {
    en: { open: "Chat with Ava", title: "Ava · Apex Media Growth", sub: "AI assistant · replies in seconds",
      hi: "Hi! I'm Ava, Apex Media Growth's AI assistant. Ask me anything about pricing, what's included or whether it fits your business.",
      tease: "Questions? I reply in seconds.", ph: "Type your message…", send: "Send", close: "Close chat",
      quick: ["How much is it?", "What's included?", "Is it right for my business?", "Tell me about the AI receptionist"],
      err: "Sorry, I'm having trouble connecting. You can book a 15-minute call here: " + CALENDLY + " or email " + EMAIL + ".",
      limit: "Thanks for chatting! To keep going, book a 15-minute call: " + CALENDLY,
      ai: "AI", disc: "You're chatting with an AI. Messages are shared with the Apex team so we can help you. Don't share passwords or card numbers." },
    es: { open: "Hable con Ava", title: "Ava · Apex Media Growth", sub: "Asistente IA · responde en segundos",
      hi: "¡Hola! Soy Ava, la asistente IA de Apex Media Growth. Pregúnteme lo que quiera sobre precios, qué incluye o si encaja con su negocio.",
      tease: "¿Preguntas? Le respondo en segundos.", ph: "Escriba su mensaje…", send: "Enviar", close: "Cerrar chat",
      quick: ["¿Cuánto cuesta?", "¿Qué incluye?", "¿Sirve para mi negocio?", "Cuénteme de la recepcionista IA"],
      err: "Perdón, tengo problemas de conexión. Puede agendar una llamada de 15 minutos aquí: " + CALENDLY + " o escribir a " + EMAIL + ".",
      limit: "¡Gracias por escribir! Para seguir, agende una llamada de 15 minutos: " + CALENDLY,
      ai: "IA", disc: "Está hablando con una IA. Los mensajes se comparten con el equipo de Apex para ayudarle. No comparta contraseñas ni números de tarjeta." }
  }[lang];

  var KEY = "ava_growth_v1";
  var state = { msgs: [], notified: false, sid: Math.random().toString(36).slice(2, 10), tease: false };
  try { var saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (saved && saved.msgs) state = saved; } catch (e) {}
  function persist() { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var css = "\
.ava-btn{position:fixed;right:18px;bottom:18px;z-index:9998;display:flex;align-items:center;gap:10px;background:#11151C;color:#fff;border:0;border-radius:999px;padding:12px 18px 12px 12px;font:600 15px/1 'Hanken Grotesk',system-ui,sans-serif;box-shadow:0 14px 34px -12px rgba(17,21,28,.6);cursor:pointer}\
.ava-btn:focus-visible,.ava-x:focus-visible,.ava-q button:focus-visible,.ava-send:focus-visible{outline:2.5px solid #E2BC5F;outline-offset:2px}\
.ava-av{width:34px;height:34px;border-radius:50%;background:#8C6A1C;display:grid;place-items:center;font:800 15px 'Schibsted Grotesk',system-ui,sans-serif;color:#fff;position:relative;flex:none}\
.ava-av:after{content:'';position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;background:#2BC37F;border:2px solid #11151C}\
.ava-tease{position:fixed;right:18px;bottom:82px;z-index:9998;max-width:260px;background:#fff;color:#11151C;border:1px solid #E4E4E0;border-radius:14px 14px 4px 14px;padding:11px 14px;font:500 14px/1.4 'Hanken Grotesk',system-ui,sans-serif;box-shadow:0 14px 34px -14px rgba(17,21,28,.4);cursor:pointer}\
.ava-panel{position:fixed;right:18px;bottom:18px;z-index:9999;width:380px;max-width:calc(100vw - 24px);height:min(600px,calc(100vh - 36px));background:#fff;border:1px solid #E4E4E0;border-radius:20px;box-shadow:0 30px 70px -24px rgba(17,21,28,.55);display:flex;flex-direction:column;overflow:hidden;font:400 15px/1.45 'Hanken Grotesk',system-ui,sans-serif;color:#11151C}\
.ava-panel[hidden],.ava-btn[hidden],.ava-tease[hidden]{display:none!important}\
.ava-h{display:flex;align-items:center;gap:11px;padding:14px 14px 14px 16px;background:#11151C;color:#fff}\
.ava-h b{display:block;font:700 15px 'Schibsted Grotesk',system-ui,sans-serif}.ava-h span{font-size:12.5px;color:#9FE0BC}\
.ava-tag{margin-left:auto;font:600 11px 'DM Mono',monospace;border:1px solid #3A4150;border-radius:999px;padding:3px 8px;color:#C9CED6}\
.ava-x{background:transparent;border:0;color:#fff;width:34px;height:34px;border-radius:9px;font-size:22px;line-height:1;cursor:pointer}\
.ava-x:hover{background:#262C38}\
.ava-m{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:9px;background:#F4F4F2}\
.ava-b{max-width:86%;padding:10px 13px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}\
.ava-b.bot{align-self:flex-start;background:#fff;border:1px solid #E4E4E0;border-bottom-left-radius:5px}\
.ava-b.me{align-self:flex-end;background:#11151C;color:#fff;border-bottom-right-radius:5px}\
.ava-b a{color:#8C6A1C;font-weight:600;word-break:break-all}.ava-b.me a{color:#E2BC5F}\
.ava-ty{align-self:flex-start;background:#fff;border:1px solid #E4E4E0;border-radius:16px;padding:12px 14px;display:flex;gap:5px}\
.ava-ty i{width:7px;height:7px;border-radius:50%;background:#A6ADB8;animation:avab 1s infinite}.ava-ty i:nth-child(2){animation-delay:.15s}.ava-ty i:nth-child(3){animation-delay:.3s}\
@keyframes avab{0%,100%{opacity:.3}50%{opacity:1}}\
.ava-q{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px;background:#F4F4F2}\
.ava-q button{background:#fff;border:1.5px solid #11151C;color:#11151C;border-radius:999px;padding:7px 12px;font:600 13.5px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}\
.ava-q button:hover{background:#11151C;color:#fff}\
.ava-f{display:flex;gap:8px;padding:10px;border-top:1px solid #E4E4E0;background:#fff}\
.ava-f textarea{flex:1;min-width:0;resize:none;border:1.5px solid #E4E4E0;border-radius:12px;padding:10px 12px;font:inherit;max-height:96px;outline:none}\
.ava-f textarea:focus{border-color:#11151C}\
.ava-send{background:#8C6A1C;color:#fff;border:0;border-radius:12px;padding:0 15px;font:700 14px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}\
.ava-send:disabled{opacity:.45;cursor:default}\
.ava-d{font-size:11.5px;color:#6B7280;padding:0 12px 10px;background:#fff}\
@media (max-width:520px){.ava-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;border-radius:0}.ava-btn span.t{display:none}.ava-btn{padding:10px}}\
@media (prefers-reduced-motion:reduce){.ava-ty i{animation:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function linkify(s) { return esc(s).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }

  var btn = el("button", "ava-btn"); btn.type = "button"; btn.setAttribute("aria-label", T.open);
  btn.innerHTML = '<span class="ava-av" aria-hidden="true">A</span><span class="t">' + esc(T.open) + "</span>";
  var tease = el("div", "ava-tease"); tease.textContent = T.tease; tease.hidden = true; tease.setAttribute("role", "button"); tease.tabIndex = 0;
  var panel = el("div", "ava-panel"); panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", T.title);
  panel.innerHTML = '<div class="ava-h"><span class="ava-av" aria-hidden="true">A</span><div><b>' + esc(T.title) + "</b><span>" + esc(T.sub) +
    '</span></div><span class="ava-tag">' + T.ai + '</span><button type="button" class="ava-x" aria-label="' + esc(T.close) + '">×</button></div>' +
    '<div class="ava-m" aria-live="polite"></div><div class="ava-q"></div>' +
    '<form class="ava-f"><textarea rows="1" maxlength="' + MAX_LEN + '" aria-label="' + esc(T.ph) + '" placeholder="' + esc(T.ph) + '"></textarea><button type="submit" class="ava-send">' + esc(T.send) + "</button></form>" +
    '<div class="ava-d">' + esc(T.disc) + "</div>";
  document.body.appendChild(tease); document.body.appendChild(btn); document.body.appendChild(panel);

  var $m = panel.querySelector(".ava-m"), $q = panel.querySelector(".ava-q"), $f = panel.querySelector(".ava-f"),
      $t = panel.querySelector("textarea"), $s = panel.querySelector(".ava-send"), busy = false;

  function bubble(text, who) { var b = el("div", "ava-b " + who, linkify(text)); $m.appendChild(b); $m.scrollTop = $m.scrollHeight; }
  function renderAll() {
    $m.innerHTML = ""; bubble(T.hi, "bot");
    state.msgs.forEach(function (m) { bubble(m.t, m.r === "u" ? "me" : "bot"); });
    $q.innerHTML = "";
    if (!state.msgs.length) T.quick.forEach(function (q) {
      var b = el("button"); b.type = "button"; b.textContent = q; b.onclick = function () { send(q); }; $q.appendChild(b);
    });
  }
  function typing(on) {
    var x = $m.querySelector(".ava-ty"); if (x) x.remove();
    if (on) { $m.appendChild(el("div", "ava-ty", "<i></i><i></i><i></i>")); $m.scrollTop = $m.scrollHeight; }
  }
  function transcript() {
    return state.msgs.slice(-20).map(function (m) { return (m.r === "u" ? "Visitor: " : "Ava: ") + m.t; }).join("\n");
  }
  function hasContact(s) { return /[\w.+-]+@[\w-]+\.[\w.]+/.test(s) || s.replace(/\D/g, "").length >= 10; }

  function send(text) {
    text = String(text || "").trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    $q.innerHTML = "";
    state.msgs.push({ r: "u", t: text }); bubble(text, "me"); persist();
    var userCount = state.msgs.filter(function (m) { return m.r === "u"; }).length;
    if (userCount > MAX_USER_MSGS) { bubble(T.limit, "bot"); return; }
    var notify = !state.notified && hasContact(text);
    busy = true; $s.disabled = true; typing(true);
    var body = new URLSearchParams();
    body.set("history", transcript()); body.set("last", text); body.set("lang", lang);
    body.set("page", location.pathname); body.set("sid", state.sid); body.set("notify", notify ? "1" : "0");
    var done = function (reply, ok) {
      typing(false); busy = false; $s.disabled = false;
      reply = String(reply || "").trim() || T.err;
      state.msgs.push({ r: "a", t: reply }); bubble(reply, "bot");
      if (ok && notify) state.notified = true;
      persist(); $t.focus();
    };
    if (!AVA_ENDPOINT) { setTimeout(function () { done(T.err, false); }, 600); return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 45000);
    fetch(AVA_ENDPOINT, { method: "POST", body: body, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) { clearTimeout(timer); done(txt, true); })
      .catch(function () { clearTimeout(timer); done(T.err, false); });
  }

  function open() { panel.hidden = false; btn.hidden = true; tease.hidden = true; state.tease = true; persist(); renderAll(); setTimeout(function () { $t.focus(); }, 50); }
  function close() { panel.hidden = true; btn.hidden = false; btn.focus(); }
  btn.onclick = open; tease.onclick = open;
  tease.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
  panel.querySelector(".ava-x").onclick = close;
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  $f.addEventListener("submit", function (e) { e.preventDefault(); var v = $t.value; $t.value = ""; send(v); });
  $t.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $f.requestSubmit ? $f.requestSubmit() : $f.dispatchEvent(new Event("submit")); } });
  document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("[data-ava-open]"); if (a) { e.preventDefault(); open(); } });

  if (!state.tease) setTimeout(function () { if (panel.hidden) tease.hidden = false; }, 9000);
})();
