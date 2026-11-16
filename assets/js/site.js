/* Everything the page does: the opening, the frame, sound, smooth scroll, text and scroll animation,
   the moving band, poster tilt, counters, and the rosette. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var $ = function (s, el) { return (el || d).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var pad = function (n, k) { n = String(Math.max(0, Math.round(n))); while (n.length < k) n = "0" + n; return n; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
  var anim = !!(gsap && ST) && !reduce;
  if (gsap && ST) gsap.registerPlugin(ST);
  if (gsap && Split) gsap.registerPlugin(Split);

  /* ---------- sound: interface ticks and a soft room tone, made here, off until asked ---------- */
  var ac = null, soundOn = false, tone = null;
  function ctx() { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; }
  function tick(f) {
    if (!soundOn) return;
    try {
      var a = ctx(), o = a.createOscillator(), g = a.createGain(), now = a.currentTime;
      o.type = "sine"; o.frequency.value = f || 1600; g.gain.setValueAtTime(.03, now); g.gain.exponentialRampToValueAtTime(.0001, now + .06);
      o.connect(g).connect(a.destination); o.start(now); o.stop(now + .07);
    } catch (e) {}
  }
  function toneOn() {
    try {
      var a = ctx(), out = a.createGain(), lp = a.createBiquadFilter(), lfo = a.createOscillator(), lg = a.createGain();
      lp.type = "lowpass"; lp.frequency.value = 600; out.gain.value = 0;
      var os = [130.8, 196, 246.9, 329.6].map(function (f, i) { var o = a.createOscillator(); o.type = "sine"; o.frequency.value = f; o.detune.value = (i - 1.5) * 4; var g = a.createGain(); g.gain.value = .22; o.connect(g).connect(lp); o.start(); return o; });
      lfo.frequency.value = .05; lg.gain.value = 180; lfo.connect(lg).connect(lp.frequency); lfo.start();
      lp.connect(out).connect(a.destination);
      out.gain.linearRampToValueAtTime(.045, a.currentTime + 3);
      tone = { out: out, os: os.concat([lfo]) };
    } catch (e) {}
  }
  function toneOff() {
    if (!tone || !ac) return;
    var t = tone; tone = null;
    try { t.out.gain.cancelScheduledValues(ac.currentTime); t.out.gain.setTargetAtTime(0, ac.currentTime, .3); setTimeout(function () { t.os.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 1500); } catch (e) {}
  }
  function setSound(on) {
    soundOn = on; $("#soundBtn").setAttribute("aria-pressed", on); $("#soundV").textContent = on ? "ON" : "–";
    if (on) { if (ac && ac.state === "suspended") ac.resume(); toneOn(); tick(1200); } else toneOff();
  }
  $("#soundBtn").addEventListener("click", function () { setSound(!soundOn); });
  $("#soundBtn2").addEventListener("click", function () { setSound(!soundOn); });
  $$("[data-snd]").forEach(function (el) { el.addEventListener("pointerenter", function () { tick(2100); }); el.addEventListener("click", function () { tick(900); }); });
  d.addEventListener("visibilitychange", function () { if (ac) { if (d.hidden) ac.suspend(); else if (soundOn) ac.resume(); } });
  addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
    if (e.key === "/") { e.preventDefault(); setSound(!soundOn); }
  });

  /* ---------- menu on small screens ---------- */
  var sheet = $("#sheet"), menu = $("#menuBtn");
  function setMenu(open) { sheet.hidden = !open; menu.setAttribute("aria-expanded", open); menu.textContent = open ? "CLOSE" : "MENU"; }
  menu.addEventListener("click", function () { setMenu(sheet.hidden); });
  $$("a", sheet).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) setMenu(false); });

  /* ---------- frame: Chennai clock, weather, pointer position ---------- */
  var clock = $("#clock");
  function tickClock() { try { clock.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }).format(new Date()); } catch (e) {} }
  tickClock(); setInterval(tickClock, 10000);
  var wx = $("#wx");
  function weather() {
    if (!window.fetch) return;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.08&longitude=80.27&current=temperature_2m&timezone=Asia%2FKolkata", { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var t = j && j.current && j.current.temperature_2m; if (typeof t === "number" && isFinite(t) && t > -50 && t < 70) wx.textContent = Math.round(t) + "°C"; })
      .catch(function () {});
  }
  weather(); setInterval(weather, 15 * 60 * 1000);
  var cx = $("#cx"), cy = $("#cy");
  addEventListener("pointermove", function (e) { cx.textContent = pad(e.clientX, 4); cy.textContent = pad(e.clientY, 4); }, { passive: true });

  var rule = $("#rule");
  function crosses() {
    $$(".x", rule).forEach(function (e) { e.remove(); });
    var xs = $$("i", rule).map(function (c) { return c.getBoundingClientRect().left; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    [.333, .68].forEach(function (fy) { xs.forEach(function (px) { var e = d.createElement("span"); e.className = "x"; e.style.left = px + "px"; e.style.top = (fy * innerHeight) + "px"; rule.appendChild(e); }); });
  }
  crosses(); addEventListener("resize", crosses);

  var rail = $("#rail"), secs = $$("[data-rail]"), navLinks = $$(".nav a[href^='#']");
  var railLinks = secs.map(function (s) {
    var a = d.createElement("a"); a.href = "#" + s.id; a.setAttribute("aria-label", s.dataset.rail);
    var l = d.createElement("span"); l.className = "pix"; l.textContent = s.dataset.rail; a.appendChild(l); rail.appendChild(a); return a;
  });

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: .09, smoothWheel: true });
    if (gsap && ST) { lenis.on("scroll", ST.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = $(a.getAttribute("href")); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.5 }); else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      try { history.replaceState(null, "", a.getAttribute("href")); } catch (er) {}
    });
  });

  /* ---------- one scroll handler: meter, active section, clouds, band speed ---------- */
  var meter = $("#meter"), sp = $("#sp"), tl = $("#tl"), lastY = scrollY, vel = 0;
  function onScroll() {
    var H = innerHeight, max = root.scrollHeight - H, p = max > 0 ? scrollY / max : 0;
    sp.textContent = pad(p * 100, 3); meter.style.setProperty("--p", p.toFixed(4));
    var cur = 0; secs.forEach(function (sec, i) { if (sec.getBoundingClientRect().top <= H * .5) cur = i; });
    railLinks.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
    navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + secs[cur].id); });
    vel = clamp(vel + (scrollY - lastY) * .04, -12, 12); lastY = scrollY;
    var tr = tl.getBoundingClientRect(); tl.style.setProperty("--tlp", clamp((H * .62 - tr.top) / Math.max(1, tr.height - 60), 0, 1).toFixed(3));
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);

  /* the band moves on its own and speeds up (or runs backwards) with the scroll */
  var band = $("#band");
  band.innerHTML += band.innerHTML;
  var bx = 0, bLast = performance.now(), bOn = true;
  new IntersectionObserver(function (es) { bOn = es[0].isIntersecting; }).observe(band);
  (function bandLoop(now) {
    var dt = Math.min(.05, (now - bLast) / 1000); bLast = now;
    if (bOn && !reduce) {
      var w = band.scrollWidth / 2;
      bx -= (40 + vel * 22) * dt; vel *= Math.pow(.05, dt);
      if (bx <= -w) bx += w; if (bx > 0) bx -= w;
      band.style.transform = "translate3d(" + bx.toFixed(1) + "px,0,0)";
    }
    requestAnimationFrame(bandLoop);
  })(bLast);

  /* project names pass the other way */
  var names = $("#names"); names.innerHTML += names.innerHTML;
  var nx = 0, nLast = performance.now(), nOn = false;
  new IntersectionObserver(function (es) { nOn = es[0].isIntersecting; }).observe(names);
  (function namesLoop(now) {
    var dt = Math.min(.05, (now - nLast) / 1000); nLast = now;
    if (nOn && !reduce) { var w = names.scrollWidth / 2; nx += (60 + vel * 30) * dt; if (nx >= 0) nx -= w; if (nx < -w) nx += w; names.style.transform = "translate3d(" + nx.toFixed(1) + "px,0,0)"; }
    requestAnimationFrame(namesLoop);
  })(nLast);

  /* ---------- posters lean toward the pointer (no light, just angle) ---------- */
  if (fine && !reduce) $$(".poster").forEach(function (p) {
    var rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
    function step() { rx += (tx - rx) * .12; ry += (ty - ry) * .12; p.style.setProperty("--tx", rx.toFixed(2) + "deg"); p.style.setProperty("--ty", ry.toFixed(2) + "deg"); raf = (Math.abs(tx - rx) + Math.abs(ty - ry) > .02) ? requestAnimationFrame(step) : 0; }
    p.addEventListener("pointermove", function (e) { var r = p.getBoundingClientRect(); ty = ((e.clientX - r.left) / r.width - .5) * 7; tx = -((e.clientY - r.top) / r.height - .5) * 6; if (!raf) raf = requestAnimationFrame(step); });
    p.addEventListener("pointerleave", function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(step); });
  });

  /* ---------- curved display: blocks lean back toward the top and bottom edges, more so while the page moves ---------- */
  if (!reduce) {
    var cv = $$(".cvx"), vS = 0, cY = scrollY;
    (function curve() {
      var H = innerHeight, v = scrollY - cY; cY = scrollY;
      vS += (Math.min(1, Math.abs(v) / 42) - vS) * .1;
      var k = .42 + vS * .8;
      for (var i = 0; i < cv.length; i++) {
        var r = cv[i].getBoundingClientRect();
        if (r.bottom < -240 || r.top > H + 240) continue;
        var c = clamp((r.top + r.height / 2 - H / 2) / (H / 2), -1.35, 1.35);
        cv[i].style.setProperty("--rx", (c * 10.5 * k).toFixed(2) + "deg");
        cv[i].style.setProperty("--tz", (c * c * 42 * k).toFixed(1) + "px");
      }
      requestAnimationFrame(curve);
    })();
  }

  /* ---------- a glass badge follows the pointer over posters ---------- */
  var badge = $("#curBadge");
  if (fine && badge) {
    var bx2 = 0, by2 = 0, tx2 = 0, ty2 = 0, bOn2 = false, braf = 0;
    function bstep() { bx2 += (tx2 - bx2) * .2; by2 += (ty2 - by2) * .2; badge.style.transform = "translate3d(" + bx2.toFixed(1) + "px," + by2.toFixed(1) + "px,0)"; braf = (bOn2 || Math.abs(tx2 - bx2) + Math.abs(ty2 - by2) > .5) ? requestAnimationFrame(bstep) : 0; }
    addEventListener("pointermove", function (e) {
      tx2 = e.clientX; ty2 = e.clientY;
      var on = !!(e.target && e.target.closest && e.target.closest(".poster"));
      if (on && !bOn2) { bx2 = tx2; by2 = ty2; }
      if (on !== bOn2) { bOn2 = on; badge.classList.toggle("on", on); var cw = $(".cur"); if (cw) cw.classList.toggle("is-badge", on); }
      if (!braf) braf = requestAnimationFrame(bstep);
    }, { passive: true });
    addEventListener("scroll", function () { if (bOn2) { var el = d.elementFromPoint(tx2, ty2); if (!(el && el.closest(".poster"))) { bOn2 = false; badge.classList.remove("on"); var cw = $(".cur"); if (cw) cw.classList.remove("is-badge"); } } }, { passive: true });
  }

  /* ---------- demo 01: the guard. A short rule list; text is only ever shown as text ---------- */
  var RULES = [
    [/\brm\s+-[a-z]*r[a-z]*f?\b.*(~|\/\s*$|\/\*|\$HOME|\.\.)|\brm\s+-[a-z]*f[a-z]*r/i, "deny", "Deletes files outside the project folder."],
    [/\.env|id_rsa|\.ssh|credentials|secret|token|password/i, "deny", "Touches secrets. An agent never needs to read or send these."],
    [/\b(drop|truncate)\s+(table|database)|\bdelete\s+from\b(?!.*\bwhere\b)/i, "deny", "Destroys data with no way back."],
    [/\b(curl|wget|nc)\b.*\|\s*(ba)?sh|\|\s*(curl|nc)\b|\bcurl\b.*(-d|--data)/i, "deny", "Runs or sends something through an outside host."],
    [/\bsudo\b|\bchmod\s+777|\bmkfs\b|\bdd\s+if=|:\(\)\s*\{/i, "deny", "Changes the machine itself, not the project."],
    [/push\s+.*(--force|-f\b)|reset\s+--hard|\bgit\s+clean\b|rebase/i, "ask", "Rewrites shared history. A person confirms first."],
    [/\b(npm|pnpm|yarn)\s+(install|add|i)\b|\bpip3?\s+install\b|\bbrew\s+install\b|\bapt(-get)?\s+install\b/i, "ask", "Installs code from the network. A person confirms first."],
    [/\b(deploy|publish|release)\b|\bkubectl\b|\bterraform\s+apply\b|\bgit\s+push\b/i, "ask", "Leaves this machine. A person confirms first."],
    [/^\s*(ls|cat|pwd|echo|grep|rg|head|tail|wc|git\s+(status|diff|log)|npm\s+(test|run\s+\w+)|pytest|node|python3?)\b/i, "allow", "Reads or tests inside the project."]
  ];
  function judge(cmd) { for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(cmd)) return RULES[i]; return [null, "ask", "Not on the allow-list, so a person decides."]; }
  var gOut = $("#gOut"), gIn = $("#gIn");
  function runGuard(cmd) {
    cmd = String(cmd || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 120); if (!cmd) return;
    var v = judge(cmd);
    if (gOut.children.length > 6 || $(".t-dim", gOut)) gOut.textContent = "";
    var c = d.createElement("p"); c.className = "t-cmd"; c.textContent = cmd;
    var r = d.createElement("p"); r.className = "t-v " + v[1]; var b = d.createElement("b"); b.textContent = v[1].toUpperCase(); var s = d.createElement("span"); s.textContent = v[2]; r.appendChild(b); r.appendChild(s);
    gOut.appendChild(c); gOut.appendChild(r); gOut.scrollTop = gOut.scrollHeight;
    tick(v[1] === "deny" ? 220 : v[1] === "ask" ? 520 : 1100);
  }
  $$("#gChips [data-cmd]").forEach(function (b) { b.addEventListener("click", function () { runGuard(b.dataset.cmd); }); });
  $("#gForm").addEventListener("submit", function (e) { e.preventDefault(); runGuard(gIn.value); gIn.value = ""; });

  /* ---------- demo 02: a chain of sealed entries, real SHA-256 ---------- */
  var SEED = ["Agent opened ticket #114", "Agent read the customer file", "Agent issued a refund of ₹2,400", "Supervisor notified at 14:02"];
  var recs = $("#recs"), chainV = $("#chainV"), rows = [], sealed = [];
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function sha(text) {
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(hex);
    var h = 2166136261; for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return Promise.resolve(("0000000" + (h >>> 0).toString(16)).slice(-8));
  }
  function chainOf(texts) { var out = [], p = Promise.resolve("genesis"); texts.forEach(function (t) { p = p.then(function (prev) { return sha(prev + "|" + t); }).then(function (h) { out.push(h); return h; }); }); return p.then(function () { return out; }); }
  function check() {
    chainOf(rows.map(function (r) { return r.input.value; })).then(function (now) {
      var good = 0, broken = false;
      rows.forEach(function (r, i) { var ok = now[i] === sealed[i]; if (!ok) broken = true; if (ok) good++; r.li.classList.toggle("bad", !ok); r.st.textContent = ok ? "SEALED" : "BROKEN"; r.code.textContent = "sha-256 " + now[i].slice(0, 28) + "…"; });
      chainV.textContent = broken ? "Chain broken · " + good + " of " + rows.length + " match" : "Chain intact · " + rows.length + " of " + rows.length + " match";
      chainV.classList.toggle("bad", broken);
    });
  }
  SEED.forEach(function (t, i) {
    var li = d.createElement("li"), input = d.createElement("input"), st = d.createElement("span"), code = d.createElement("code");
    input.type = "text"; input.value = t; input.maxLength = 60; input.spellcheck = false; input.setAttribute("aria-label", "Entry " + (i + 1));
    st.className = "st"; st.textContent = "SEALED";
    li.appendChild(input); li.appendChild(st); li.appendChild(code); recs.appendChild(li);
    rows.push({ li: li, input: input, st: st, code: code });
    input.addEventListener("input", function () { check(); tick(700); });
  });
  chainOf(SEED).then(function (h) { sealed = h; check(); });
  $("#chainReset").addEventListener("click", function () { rows.forEach(function (r, i) { r.input.value = SEED[i]; }); check(); });

  /* buttons and pills drift a little toward the pointer */
  if (fine && !reduce) $$(".mail, .foot-g a, .btn, .chip").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + "px"; });
    b.addEventListener("pointerleave", function () { b.style.translate = "0 0"; });
  });

  /* ---------- rosette: lace from security printing, drawn live ---------- */
  function rosette(cv) {
    var c = cv.getContext("2d"), W = 0, t0 = performance.now(), on = false;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(); W = r.width; cv.width = cv.height = Math.max(2, Math.round(W * dpr)); c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function band(R, amp, n, m, ph, col) {
      c.strokeStyle = col; c.lineWidth = .6;
      for (var j = 0; j < m; j++) {
        c.beginPath();
        for (var i = 0; i <= 360; i++) {
          var th = i / 360 * Math.PI * 2, r = R + amp * Math.sin(n * th + ph + j * Math.PI * 2 / m) * Math.cos((n / 2 - 1) * th - ph * .5);
          var x = W / 2 + r * Math.cos(th), y = W / 2 + r * Math.sin(th);
          if (i) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.stroke();
      }
    }
    function draw(now) {
      var t = reduce ? 2 : (now - t0) / 1000, R = W / 2;
      c.clearRect(0, 0, W, W);
      band(R * .86, R * .11, 16, 9, t * .2, "rgba(29,26,22,.26)");
      band(R * .63, R * .1, 12, 8, -t * .26, "rgba(107,91,149,.42)");
      band(R * .42, R * .085, 8, 7, t * .33, "rgba(29,26,22,.24)");
      band(R * .23, R * .07, 6, 6, -t * .42, "rgba(180,120,90,.42)");
    }
    function loop(now) { if (!on) return; draw(now); if (!reduce) requestAnimationFrame(loop); }
    addEventListener("resize", function () { if (on) { size(); draw(performance.now()); } });
    return { start: function () { if (on) return; on = true; size(); requestAnimationFrame(loop); }, stop: function () { on = false; } };
  }
  var rose = rosette($("#rose"));
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) rose.start(); else rose.stop(); }); }).observe($("#rose"));

  /* ---------- entrances ---------- */
  $$(".poster").forEach(function (p, i) { p.classList.add("fx"); p.style.setProperty("--d", ((i % 3) * .08) + "s"); });
  $$(".say-2, .stats, .band, .steps li, .index li, .ab-r, .q, .mail, .foot-g, .sec-h .note, .sec-h .idx, .rulebook > .idx, .foot > .idx, .lab-c, .kit-c, .tline li, .faq details").forEach(function (el, i) { el.classList.add("fx"); });
  $$(".steps li, .kit-c, .lab-c").forEach(function (el, i) { el.style.setProperty("--d", ((i % 3) * .1) + "s"); });
  $$(".faq details").forEach(function (el, i) { el.style.setProperty("--d", ((i % 2) * .08) + "s"); });
  var me = $("#me");
  function count(el) {
    var n = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1400;
    (function s(now) { var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(n * e) + (p >= 1 ? suf : ""); if (p < 1) requestAnimationFrame(s); })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      el.classList.add("in");
      if (el.classList.contains("stats") && !reduce) $$("[data-count]", el).forEach(count);
      if (el === me) setTimeout(function () { tick(600); }, 600);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  function arm() {
    $$(".fx").forEach(function (el) { io.observe(el); });
    io.observe(me);
    if (!anim) return;
    try {
      /* headings rise line by line from behind a mask */
      if (Split) $$("[data-lines]").forEach(function (h) {
        var s = new Split(h, { type: "lines", linesClass: "line", mask: "lines" });
        gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: h, start: "top 85%" } });
      });
      /* long sentences fill with ink as they are read */
      if (Split) $$(".fill").forEach(function (p) {
        var s = new Split(p, { type: "words", wordsClass: "wd" });
        gsap.fromTo(s.words, { opacity: .14 }, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
      });
      /* the poster art drifts inside its frame */
      $$(".poster .emb").forEach(function (em) { gsap.fromTo(em, { yPercent: 10 }, { yPercent: -10, ease: "none", scrollTrigger: { trigger: em.parentNode, start: "top bottom", end: "bottom top", scrub: true } }); });
      /* the hero text lifts away slower than the page */
      gsap.to("#heroT", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".chips", { yPercent: -60, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      /* the photo settles as it comes in */
      gsap.fromTo("#me .ph img", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#me", start: "top bottom", end: "bottom 40%", scrub: true } });
      /* the last three words slide into place */
      [[".w1", -16], [".w2", 16], [".w3", -10]].forEach(function (w) { gsap.fromTo(w[0], { xPercent: w[1] }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: "#contact", start: "top 90%", end: "top 20%", scrub: true } }); });
      gsap.fromTo(".rose", { rotate: -25 }, { rotate: 25, ease: "none", scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: true } });
      ST.refresh();
    } catch (e) {}
  }

  function heroIn() {
    root.classList.add("ready");
    var h = $("#heroT");
    if (anim && Split) {
      try {
        var s = new Split(h.querySelectorAll(".ln"), { type: "words,chars", charsClass: "ch", wordsClass: "wd" });
        gsap.from(s.chars, { yPercent: 70, opacity: 0, filter: "blur(10px)", duration: 1.3, ease: "expo.out", stagger: .018, delay: .1, clearProps: "filter" });
      } catch (e) {}
    }
  }

  /* ---------- opening: the name signs itself while real steps finish ---------- */
  var NAMES = ["Kaaval", "Pathivu", "Kanakku", "Mugam", "Thavanai", "Kaappu", "Stewards' Room", "FairDoor", "AquaNXT", "UpAid", "Virasat"];
  var ld = $("#loader"), bar = $("#ldBar"), pct = $("#ldPct"), step = $("#ldStep"), list = $("#ldList");
  var items = NAMES.map(function (n) { var li = d.createElement("li"); li.textContent = n; list.appendChild(li); return li; });
  var finished = false;
  function finish() {
    if (finished) return; finished = true;
    onScroll(); arm();
    if (ld.classList.contains("gone")) { heroIn(); return; }
    ld.classList.add("out"); heroIn();
    setTimeout(function () { ld.classList.add("gone"); }, reduce ? 50 : 1200);
  }
  var seenBefore = false; try { seenBefore = sessionStorage.getItem("sk-open") === "1"; sessionStorage.setItem("sk-open", "1"); } catch (e) {}
  var MIN = reduce ? 150 : seenBefore ? 1300 : 2900, start = performance.now();
  var steps = { fonts: false, page: false };
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { steps.fonts = true; });
  if (d.readyState === "complete") steps.page = true; else addEventListener("load", function () { steps.page = true; });
  if (ld.classList.contains("gone")) finish();
  else {
    requestAnimationFrame(function () { ld.classList.add("go"); });
    (function run(now) {
      if (finished) return;
      var p = clamp((now - start) / MIN, 0, 1);
      var scene = root.classList.contains("has-world") || now - start > 2600;
      var real = (steps.fonts ? 1 : 0) + (steps.page ? 1 : 0) + (scene ? 1 : 0);
      p = Math.min(p, .4 + real * .2);
      step.textContent = p < .3 ? "Loading type" : p < .6 ? "Checking scripts" : p < .9 ? "Building the scene" : "Ready";
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")"; pct.textContent = pad(p * 100, 3);
      var k = Math.floor(p * NAMES.length);
      items.forEach(function (li, i) { li.classList.toggle("ok", i < k || p >= 1); });
      if (p < 1) return requestAnimationFrame(run);
      setTimeout(finish, reduce ? 0 : 250);
    })(start);
  }
  onScroll();
})();
