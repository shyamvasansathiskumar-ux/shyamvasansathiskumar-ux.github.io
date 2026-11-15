/* The pointer, drawn as a printer's registration mark: a fine crosshair at the tip and four crop-mark corners
   that close around whatever you can use, naming it when useful. Over a link inside a sentence it becomes a small solid square.
   No light, no glow. Touch screens keep their own behaviour. */
(function () {
  "use strict";
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var wrap = document.createElement("div"); wrap.className = "cur is-hidden"; wrap.setAttribute("aria-hidden", "true");
  function make(cls, parent, tag) { var e = document.createElement(tag || "div"); e.className = cls; (parent || wrap).appendChild(e); return e; }
  document.body.appendChild(wrap);
  var cross = make("cur-cross"), box = make("cur-box"), sq = make("cur-sq");
  ["tl", "tr", "bl", "br"].forEach(function (c) { make("cur-c " + c, box); });
  var label = make("cur-label", box, "span");
  root.classList.add("has-cur");

  var HOT = "a[href], button, label, summary, [role='button']";
  function nameOf(el) {
    if (el.dataset.cursor) return el.dataset.cursor;
    if (el.classList.contains("poster")) return "Open";
    if (el.closest(".index")) return "Read";
    return "";
  }

  var x = innerWidth / 2, y = innerHeight / 2, seen = false, target = null;
  var bx = x, by = y, bw = 26, bh = 26, tx = x, ty = y, tw = 26, th = 26, last = performance.now();

  function sense(node) {
    var el = node && node.closest ? node : null;
    var hot = el && el.closest(HOT);
    var inline = !!(hot && hot.classList.contains("lk"));
    wrap.classList.toggle("is-link", inline);
    target = inline ? null : hot || null;
    var name = target ? nameOf(target) : "";
    if (!hot && el && el.closest("#hero") && root.classList.contains("has-world")) name = "Hold";
    label.textContent = name;
    wrap.classList.toggle("has-label", !!name);
    wrap.classList.toggle("is-on", !!target);
  }
  addEventListener("pointermove", function (e) {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; bx = x; by = y; wrap.classList.remove("is-hidden"); }
    sense(e.target);
  }, { passive: true });
  var sq_ = false;
  addEventListener("scroll", function () { if (!seen || sq_) return; sq_ = true; requestAnimationFrame(function () { sq_ = false; sense(document.elementFromPoint(x, y)); }); }, { passive: true });
  addEventListener("pointerdown", function () { wrap.classList.add("is-down"); }, { passive: true });
  addEventListener("pointerup", function () { wrap.classList.remove("is-down"); }, { passive: true });
  document.addEventListener("pointerleave", function () { wrap.classList.add("is-hidden"); });
  document.addEventListener("pointerenter", function () { if (seen) wrap.classList.remove("is-hidden"); });

  function frame(now) {
    var dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    if (target && !target.isConnected) { target = null; wrap.classList.remove("is-on", "has-label"); }
    if (target) {
      var r = target.getBoundingClientRect();
      tx = r.left + r.width / 2; ty = r.top + r.height / 2; tw = r.width + 14; th = r.height + 14;
      if (tw > innerWidth * 0.7 || th > innerHeight * 0.6) { tx = x; ty = y; tw = th = 46; }
    } else { tx = x; ty = y; tw = th = 26; }
    var k = reduce ? 1 : 1 - Math.exp(-dt * (target ? 20 : 13));
    bx += (tx - bx) * k; by += (ty - by) * k; bw += (tw - bw) * k; bh += (th - bh) * k;
    box.style.width = bw.toFixed(1) + "px"; box.style.height = bh.toFixed(1) + "px";
    box.style.transform = "translate3d(" + (bx - bw / 2).toFixed(1) + "px," + (by - bh / 2).toFixed(1) + "px,0)";
    var p = "translate3d(" + x + "px," + y + "px,0)";
    cross.style.transform = p; sq.style.transform = p;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
