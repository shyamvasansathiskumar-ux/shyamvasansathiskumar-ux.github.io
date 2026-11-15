/* Runs in <head>: marks scripts on, restores the saved theme before paint, refuses to run inside another site's frame,
   and makes sure the opening screen can never stay stuck. */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try { var t = localStorage.getItem("sk-theme"); if (t === "light" || t === "dark") d.setAttribute("data-theme", t); } catch (e) {}
  if (window.top !== window.self) { d.classList.add("framed"); try { window.top.location = window.location.href; } catch (e) {} }
  /* bending what is behind the glass needs SVG filters in backdrop-filter, which only Chromium draws */
  try { if (window.chrome && window.CSS && CSS.supports("backdrop-filter", "blur(2px)")) d.classList.add("lg-refract"); } catch (e) {}
  setTimeout(function () {
    var l = document.getElementById("loader");
    if (l && !l.classList.contains("out")) { l.classList.add("out", "gone"); d.classList.add("ready", "forced"); }
  }, 9000);
})();
