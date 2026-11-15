/* The scene on the first screen, drawn over the page's own clouds (transparent background).
   - A chain of five records in pearl and ink. Press and hold: the middle one is pulled out,
     the way a forged entry breaks a hash chain.
   - One object per project, in soft pearl colours: shield (Kaaval), ledger (Pathivu), link (Kanakku),
     dot face (Mugam), padlock (Kaappu), flag (Stewards' Room), drop (AquaNXT), tag (Thavanai).
     They move out of the pointer's way.
   - A pearl arrow follows the pointer inside the scene.
   - Scrolling away, the links part and the objects float up and out. Nothing is pinned.
   No light follows the pointer. Paused when hidden or scrolled past. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const host = document.getElementById("world");
const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const glOK = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();

if (host && glOK) setTimeout(() => { try { start(); } catch (e) { root.classList.remove("has-world"); } }, 300);

function start() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  let DPR = Math.min(1.75, devicePixelRatio || 1);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.0;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(0, 0, 26);

  /* ---------- materials: pearl, soft and warm ---------- */
  const pearl = (hex, rough = 0.3, irid = 0.4) => new THREE.MeshPhysicalMaterial({
    color: hex, roughness: rough, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12,
    iridescence: irid, iridescenceIOR: 1.32, iridescenceThicknessRange: [180, 520],
    sheen: 0.25, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.5, envMapIntensity: 1.0 });
  const ivory = pearl(0xf4ebdc), sand = pearl(0xdcc19c), ink = pearl(0x2a241d, 0.22, 0.2);
  const lav = pearl(0xb9a6ee), peach = pearl(0xefae86), sage = pearl(0xaec79c), sky = pearl(0xa5c3e6), rose = pearl(0xe9a6b4), honey = pearl(0xe6c078);
  const clay = pearl(0xd98d6c, 0.28, 0.35);

  /* ---------- the chain of five records ---------- */
  const word = new THREE.Group();
  const lp = []; for (let i = 0; i < 96; i++) { const t = i / 96 * Math.PI * 2, c = Math.cos(t); lp.push(new THREE.Vector3(Math.sign(c) * Math.pow(Math.abs(c), .55) * 1.25, Math.sin(t) * .66, 0)); }
  const linkGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp, true), 200, .26, 28, true);
  const links = [];
  const order = [ink, ivory, lav, ivory, ink];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(linkGeo, order[i]);
    m.position.x = (i - 2) * 1.95; m.rotation.x = i % 2 ? Math.PI / 2 : 0;
    word.add(m); links.push(m);
  }
  scene.add(word);
  let pull = 0, pullT = 0;
  addEventListener("pointerdown", (e) => { if (e.target && e.target.closest && e.target.closest("#hero") && !e.target.closest("a, button")) pullT = 1; });
  addEventListener("pointerup", () => { pullT = 0; });
  addEventListener("pointercancel", () => { pullT = 0; });

  /* ---------- one object per project ---------- */
  const stickers = [];
  function add(obj, x, y, z, s, depth) { obj.position.set(x, y, z); obj.scale.setScalar(s); obj.userData = { home: new THREE.Vector3(x, y, z), base: new THREE.Vector3(x, y, z), vel: new THREE.Vector3(), spin: (Math.random() - .5) * .5, phase: Math.random() * 6, depth: depth || 1 }; scene.add(obj); stickers.push(obj); }
  const bevel = (depth, t = .12, s = .1) => ({ depth, bevelEnabled: true, bevelThickness: t, bevelSize: s, bevelSegments: 8, curveSegments: 24 });

  const sh = new THREE.Shape();
  sh.moveTo(0, 1.2); sh.quadraticCurveTo(0.6, 1.0, 1.0, 1.1); sh.lineTo(1.0, 0.1);
  sh.quadraticCurveTo(0.95, -0.8, 0, -1.25); sh.quadraticCurveTo(-0.95, -0.8, -1.0, 0.1);
  sh.lineTo(-1.0, 1.1); sh.quadraticCurveTo(-0.6, 1.0, 0, 1.2);
  const shield = new THREE.Group();
  shield.add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, bevel(.25, .2, .16)), peach));
  shield.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.45, 0, .66), new THREE.Vector3(-.1, -.35, .66), new THREE.Vector3(.5, .4, .66)]), 20, .1, 12), ivory));
  add(shield, -9.4, 2.4, -1, .72, 1.3);

  const book = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.ExtrudeGeometry(roundRect(1.7, 2.2, .14), bevel(.34, .08, .06)), rose); cover.position.set(-.85, -1.1, -.17); book.add(cover);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, .3), ivory); pages.position.set(.08, 0, 0); book.add(pages);
  add(book, 9.4, -1.4, -2, .58, .9);

  const kp = []; for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2, c = Math.cos(t); kp.push(new THREE.Vector3(Math.sign(c) * Math.pow(Math.abs(c), .55) * 1.1, Math.sin(t) * .6, 0)); }
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(kp, true), 120, .22, 18, true), sky), 9.2, 2.7, -1, .68, 1.4);

  const lock = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundRect(1.6, 1.25, .3), bevel(.5)), lav); body.position.set(-.8, -.9, -.25); lock.add(body);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(.55, .14, 16, 48, Math.PI), sand); shackle.position.y = .35; lock.add(shackle);
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .2, 16), ink); hole.rotation.x = Math.PI / 2; hole.position.set(0, -.3, .44); lock.add(hole);
  add(lock, -9.3, -1.1, -2, .58, .8);

  const face = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .32, 56), rose); disc.rotation.x = Math.PI / 2; face.add(disc);
  const dotG = new THREE.SphereGeometry(.075, 12, 10);
  for (let a = -5; a <= 5; a++) for (let b = -6; b <= 6; b++) { const u = a / 5, v = b / 6; if (u * u * 1.4 + v * v > .85) continue; const dd = new THREE.Mesh(dotG, ivory); dd.position.set(u * .8, v * 1.0, .2); face.add(dd); }
  add(face, 6.0, 4.4, -3, .5, 1.7);

  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 12), sand); pole.position.set(-1, -.2, 0); flag.add(pole);
  const cell = new THREE.BoxGeometry(.38, .38, .1);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(cell, (i + j) % 2 ? ink : ivory); m.position.set(-.8 + i * .38, .9 - j * .38, Math.sin(i * .9) * .12); flag.add(m); }
  add(flag, -6.2, 4.3, -3, .55, 1.6);

  const dp = []; for (let i = 0; i <= 28; i++) { const t = i / 28, y = 1.3 - t * 2.4, r = t < .45 ? Math.sin(t / .45 * Math.PI / 2) * .45 * t / .45 + .02 : Math.sqrt(Math.max(0, 1 - Math.pow((t - .72) / .28, 2))) * .9; dp.push(new THREE.Vector2(Math.max(.001, r), y)); }
  add(new THREE.Mesh(new THREE.LatheGeometry(dp, 48), sky), -0.4, 4.7, -4, .46, 2);

  const tg = new THREE.Shape();
  tg.moveTo(-.9, .6); tg.lineTo(.5, .6); tg.lineTo(1.1, 0); tg.lineTo(.5, -.6); tg.lineTo(-.9, -.6); tg.closePath();
  const th = new THREE.Path(); th.absarc(.55, 0, .16, 0, Math.PI * 2, true); tg.holes.push(th);
  const tag = new THREE.Group();
  tag.add(new THREE.Mesh(new THREE.ExtrudeGeometry(tg, bevel(.14, .08, .07)), sage));
  for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(i === 2 ? .5 : .9, .09, .06), ivory); l.position.set(i === 2 ? -.5 : -.3, .25 - i * .25, .26); tag.add(l); }
  add(tag, 6.6, -4.2, -3, .7, 1.2);

  const coin = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .18, 48), honey); coin.rotation.x = Math.PI / 2.4;
  add(coin, -3.2, -4.6, -4, .7, 1.5);

  /* ---------- a pearl arrow following the pointer ---------- */
  const ar = new THREE.Shape();
  ar.moveTo(0, 0); ar.lineTo(1.5, -.62); ar.quadraticCurveTo(1.62, -.7, 1.5, -.8); ar.lineTo(.86, -.98); ar.lineTo(.62, -1.62); ar.quadraticCurveTo(.5, -1.74, .42, -1.6); ar.closePath();
  const mark = new THREE.Mesh(new THREE.ExtrudeGeometry(ar, bevel(.16, .14, .12)), lav);
  mark.scale.setScalar(.66); mark.visible = false; scene.add(mark);

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0xd9cbb8, 1.1));
  const key = new THREE.DirectionalLight(0xfff1e0, 1.3); key.position.set(4, 7, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe6e2ff, .5); fill.position.set(-6, -2, 5); scene.add(fill);

  /* ---------- size ---------- */
  let W = 0, H = 0, narrow = false, k = 1, need = true;
  function size() {
    W = innerWidth; H = innerHeight; narrow = W < 760;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.position.z = narrow ? 40 : 26; camera.updateProjectionMatrix();
    const halfH = Math.tan(15 * Math.PI / 180) * camera.position.z, halfW = halfH * camera.aspect;
    k = Math.min(1, halfW / 11.1);
    for (const s of stickers) { const b = s.userData.base; s.userData.home.set(b.x * (halfW / 11.1), b.y * (halfH / 6.97) * (narrow ? .92 : 1), b.z); }
    word.scale.setScalar(narrow ? .82 : 1.12);
    need = true;
  }

  /* ---------- input ---------- */
  const mouse = new THREE.Vector2(0, 0), target = new THREE.Vector3(0, 0, 3), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3);
  let hasMouse = false;
  addEventListener("pointermove", (e) => { mouse.set(e.clientX / W * 2 - 1, -(e.clientY / H) * 2 + 1); hasMouse = e.pointerType === "mouse"; }, { passive: true });
  root.classList.add("has-world");

  let p = 0, past = false;
  function onScroll() { p = Math.min(1.2, scrollY / Math.max(1, H)); past = p > .55; need = true; }
  addEventListener("scroll", onScroll, { passive: true });
  size(); addEventListener("resize", size); onScroll();

  /* ---------- loop ---------- */
  const clock = new THREE.Clock(); let running = false;
  const go = () => { if (!running && !document.hidden) { running = true; clock.getDelta(); requestAnimationFrame(loop); } };
  document.addEventListener("visibilitychange", go);
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  let frames = 0, slow = 0, lite = false, shownPast = false;
  function loop() {
    if (document.hidden) { running = false; return; }
    requestAnimationFrame(loop);
    const dtRaw = clock.getDelta() || .016, dt = Math.min(.05, dtRaw), t = clock.elapsedTime;
    if (past) { if (!shownPast) { host.style.visibility = "hidden"; shownPast = true; } return; }
    if (shownPast) { host.style.visibility = ""; shownPast = false; }
    if (reduce && !need) return;
    need = false;
    /* slow machine: after a short trial, draw at a lower resolution */
    if (!lite && frames < 30) { frames++; if (frames > 8) slow += dtRaw; if (frames === 30 && slow / 22 > .045) { lite = true; DPR = 1; renderer.setPixelRatio(1); renderer.setSize(W, H, false); } }

    ray.setFromCamera(mouse, camera); ray.ray.intersectPlane(plane, target);
    mark.visible = hasMouse && p < .5 && !reduce;
    mark.position.lerp(target, 1 - Math.exp(-dt * 9));
    mark.rotation.set(-.3 + mouse.y * -.35, .35 + mouse.x * .5, .5 + Math.sin(t * 1.3) * .06);

    const out = smooth(0, 1, p);
    word.rotation.y = -0.18 + (reduce ? 0 : Math.sin(t * .4) * .12) + mouse.x * .18 + out * .5;
    word.rotation.x = (-0.12 + mouse.y * -.12) * (1 - out);
    word.rotation.z = 0.06;
    word.position.set(narrow ? 0 : 2.4 * k * (1 - out), (narrow ? 2.0 : 1.2) + (reduce ? 0 : Math.sin(t * .8) * .15) + out * 2, 0);
    pull += (pullT - pull) * (1 - Math.exp(-dt * 6));
    const spread = smooth(.05, .8, p);
    links.forEach((l, i) => { l.position.x = (i - 2) * (1.95 + spread * 1.2); l.rotation.z = (i - 2) * spread * .2; });
    const lift = Math.max(pull, spread);
    links[2].position.y = spread * 1.6 + pull * 1.6;
    links[2].material = lift > .35 ? clay : lav;

    for (const s of stickers) {
      const u = s.userData; tmp.copy(u.home); tmp.y += out * 9 * u.depth; tmp.sub(s.position).multiplyScalar(2.2);
      tmp2.copy(s.position).sub(target); const dd = tmp2.length();
      if (hasMouse && dd < 4.5) tmp.add(tmp2.normalize().multiplyScalar((4.5 - dd) * 9));
      u.vel.add(tmp.multiplyScalar(dt)).multiplyScalar(.9);
      s.position.addScaledVector(u.vel, dt * 6);
      if (!reduce) { s.rotation.y += u.spin * dt; s.rotation.x = Math.sin(t * .7 + u.phase) * .25; s.position.y += Math.sin(t + u.phase) * .004; }
    }
    host.style.opacity = String(1 - smooth(.12, .5, p));
    renderer.render(scene, camera);
    if (!reduce) need = true;
  }
  go();
}

function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function roundRect(w, h, r) { const s = new THREE.Shape(); s.moveTo(r, 0); s.lineTo(w - r, 0); s.quadraticCurveTo(w, 0, w, r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(r, h); s.quadraticCurveTo(0, h, 0, h - r); s.lineTo(0, r); s.quadraticCurveTo(0, 0, r, 0); return s; }
