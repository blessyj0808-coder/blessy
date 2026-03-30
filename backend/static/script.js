const cur = document.getElementById('cur'), cur2 = document.getElementById('cur2');
let mx = 0, my = 0, rx = 0, ry = 0;
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.left = mx + 'px'; cur.style.top = my + 'px'; mouseX = mx; mouseY = my; });
(function animCur() { rx += (mx - rx) * .11; ry += (my - ry) * .11; cur2.style.left = rx + 'px'; cur2.style.top = ry + 'px'; requestAnimationFrame(animCur); })();

const bgC = document.getElementById('bg'), bCtx = bgC.getContext('2d');
let W, H;
function resize() { W = bgC.width = window.innerWidth; H = bgC.height = window.innerHeight }
resize(); window.addEventListener('resize', resize);

const PARTS = [];
for (let i = 0; i < 130; i++) { PARTS.push({ x: Math.random() * 2000, y: Math.random() * 2000, vx: (Math.random() - .5) * .75, vy: (Math.random() - .5) * .75, r: Math.random() * 2 + .4, col: ['#00fff0', '#ff00aa', '#ffe600', '#39ff14', '#ff6200'][Math.floor(Math.random() * 5)], op: Math.random() * .55 + .1 }); }
const LINES = [];
for (let i = 0; i < 90; i++) { LINES.push({ x: Math.random() * 3000, y: Math.random() * 3000, len: Math.random() * 250 + 80, spd: Math.random() * 22 + 10, op: Math.random() * .4 + .04, w: Math.random() * 1.5 + .3, col: Math.random() > .65 ? '#ff00aa' : Math.random() > .4 ? '#00fff0' : 'rgba(255,255,255,.5)' }); }
const BLOBS = [{ x: .14, y: .18, r: 400, c: 'rgba(0,255,240,' }, { x: .86, y: .58, r: 350, c: 'rgba(255,0,170,' }, { x: .5, y: .88, r: 280, c: 'rgba(255,230,0,' }, { x: .7, y: .1, r: 240, c: 'rgba(57,255,20,' }];
const SPARKS = [];
for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 5 + 1; SPARKS.push({ x: W * .5, y: H * .5, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, r: Math.random() * 2 + .5, col: ['#00fff0', '#ff00aa', '#ffe600'][Math.floor(Math.random() * 3)] }); }
let gOff = 0;

function drawBG() {
  bCtx.clearRect(0, 0, W, H);
  bCtx.fillStyle = '#020205'; bCtx.fillRect(0, 0, W, H);
  const t = Date.now() / 4200;
  BLOBS.forEach((b, i) => { const p = Math.sin(t + i) * .01 + .025; const g = bCtx.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, b.r * (1 + Math.sin(t + i) * .12)); g.addColorStop(0, b.c + p + ')'); g.addColorStop(1, 'transparent'); bCtx.fillStyle = g; bCtx.fillRect(0, 0, W, H); });
  gOff = (gOff + .8) % 60;
  const vx = W / 2, vy = H * .5;
  bCtx.save(); bCtx.globalAlpha = .07;
  for (let i = 0; i <= 20; i++) { const x = (W / 20) * i; bCtx.beginPath(); bCtx.moveTo(vx, vy); bCtx.lineTo(x, H); bCtx.strokeStyle = '#00fff0'; bCtx.lineWidth = .8; bCtx.stroke(); }
  for (let i = 0; i < 14; i++) { const tt = ((i / 14) + gOff / 840) % 1, p = tt * tt, yy = vy + (H - vy) * p, xl = vx - vx * p, xr = vx + (W - vx) * p; bCtx.beginPath(); bCtx.moveTo(xl, yy); bCtx.lineTo(xr, yy); bCtx.strokeStyle = '#00fff0'; bCtx.lineWidth = .6; bCtx.stroke(); }
  bCtx.restore();

  LINES.forEach(l => { bCtx.save(); bCtx.globalAlpha = l.op; const g = bCtx.createLinearGradient(l.x - l.len, l.y, l.x, l.y); g.addColorStop(0, 'transparent'); g.addColorStop(1, l.col); bCtx.strokeStyle = g; bCtx.lineWidth = l.w; bCtx.beginPath(); bCtx.moveTo(l.x - l.len, l.y); bCtx.lineTo(l.x, l.y); bCtx.stroke(); bCtx.restore(); l.x += l.spd; if (l.x > W + l.len) { l.x = -l.len; l.y = Math.random() * H; l.op = Math.random() * .4 + .04; } });

  PARTS.forEach((p, i) => {
    bCtx.save(); bCtx.globalAlpha = p.op; bCtx.beginPath(); bCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); bCtx.fillStyle = p.col; bCtx.fill(); bCtx.restore();
    if (mouseX || mouseY) { const dx = mouseX - p.x, dy = mouseY - p.y, dist = Math.sqrt(dx * dx + dy * dy); if (dist < 160) { bCtx.beginPath(); bCtx.strokeStyle = `rgba(255,0,170,${0.35 * (1 - dist / 160)})`; bCtx.lineWidth = .5; bCtx.moveTo(mouseX, mouseY); bCtx.lineTo(p.x, p.y); bCtx.stroke(); p.x += dx * .009; p.y += dy * .009; } }
    for (let j = i + 1; j < PARTS.length; j++) { const dx = p.x - PARTS[j].x, dy = p.y - PARTS[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 90) { bCtx.beginPath(); bCtx.strokeStyle = `rgba(0,255,240,${0.12 * (1 - d / 90)})`; bCtx.lineWidth = .4; bCtx.moveTo(p.x, p.y); bCtx.lineTo(PARTS[j].x, PARTS[j].y); bCtx.stroke(); } }
    p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
  });

  const wt = Date.now() * .0018;
  for (let i = 0; i < W; i += 28) { const wy = Math.sin(i * .018 + wt) * 12 + (H - 50); bCtx.fillStyle = 'rgba(255,0,170,0.45)'; bCtx.beginPath(); bCtx.arc(i, wy, 1, 0, Math.PI * 2); bCtx.fill(); }

  if (mouseX || mouseY) { const mg = bCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200); mg.addColorStop(0, 'rgba(0,255,240,0.055)'); mg.addColorStop(1, 'transparent'); bCtx.fillStyle = mg; bCtx.fillRect(0, 0, W, H); }

  SPARKS.forEach(s => { if (s.life > 0) { bCtx.save(); bCtx.globalAlpha = s.life * .65; bCtx.beginPath(); bCtx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2); bCtx.fillStyle = s.col; bCtx.fill(); bCtx.restore(); s.x += s.vx; s.y += s.vy; s.vy += .03; s.life -= .013; } });

  requestAnimationFrame(drawBG);
}
drawBG();

setInterval(() => { document.getElementById('sysLatency').textContent = Math.floor(Math.random() * 8 + 8) + 'ms'; }, 2000);

const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl.classList.toggle('solid', scrollY > 30));
const ham = document.getElementById('ham'), mob = document.getElementById('mobMenu');
ham.addEventListener('click', () => mob.classList.toggle('show')); document.querySelectorAll('.mm').forEach(a => a.addEventListener('click', () => mob.classList.remove('show')));

const kickerEl = document.getElementById('kickerTxt');
const kickerTxt = '>> INITIALIZING NEURAL_PORTFOLIO 2026...';
let ki = 0;
function typeKicker() { if (ki <= kickerTxt.length) { kickerEl.textContent = kickerTxt.slice(0, ki++); setTimeout(typeKicker, 48) } }
typeKicker();

function glitch() { [document.getElementById('gn1'), document.getElementById('gn2')].forEach(el => { if (!el) return; el.style.filter = 'hue-rotate(180deg) brightness(1.7)'; el.style.transform = 'skew(3deg)'; setTimeout(() => { el.style.filter = ''; el.style.transform = ''; }, 80); }); }
setInterval(glitch, 3600);

const rvEls = document.querySelectorAll('.rv');
rvEls.forEach(el => { new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }) }, { threshold: .1 }).observe(el); });
document.querySelectorAll('.jstep').forEach((j, i) => { new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('in'), i * 130) }) }, { threshold: .1 }).observe(j); });

let barsAnim = false;
new IntersectionObserver(entries => { if (entries[0].isIntersecting && !barsAnim) { barsAnim = true; document.querySelectorAll('.skill-fill').forEach(b => setTimeout(() => { b.style.width = b.dataset.w + '%' }, 200)); } }, { threshold: .3 }).observe(document.getElementById('skillsCont'));

['tc2', 'tc3'].forEach(id => { const c = document.getElementById(id); if (!c) return; c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; c.style.transform = `perspective(800px) rotateX(${-(y / r.height) * 10}deg) rotateY(${(x / r.width) * 10}deg) translateZ(8px)`; }); c.addEventListener('mouseleave', () => c.style.transform = ''); });
document.querySelectorAll('.gcar').forEach(c => { c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; c.style.transform = `perspective(600px) rotateX(${-(y / r.height) * 6}deg) rotateY(${(x / r.width) * 6}deg) translateY(-6px)`; }); c.addEventListener('mouseleave', () => c.style.transform = ''); });

const heroSec = document.getElementById('hero'), heroL = document.querySelector('.hero-left'), heroR = document.querySelector('.hero-right');
heroSec.addEventListener('mousemove', e => { const dx = (e.clientX - W / 2) / W, dy = (e.clientY - H / 2) / H; if (heroL) heroL.style.transform = `translate(${dx * 14}px,${dy * 8}px)`; if (heroR) heroR.style.transform = `translate(${dx * -18}px,${dy * -10}px)`; });
heroSec.addEventListener('mouseleave', () => { if (heroL) heroL.style.transform = ''; if (heroR) heroR.style.transform = ''; });

document.querySelectorAll('.sec-kicker').forEach(el => { setInterval(() => { if (Math.random() > .93) { el.style.opacity = '.15'; setTimeout(() => el.style.opacity = '1', 65) } }, 2200); });

function setCStatus(s, msg, ok) {
  if (!s) return;
  s.style.color = ok ? 'var(--cyan)' : 'var(--magenta)';
  s.textContent = msg;
}

function validateEmail(v) {
  // Lightweight validation; backend also validates
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

document.getElementById('csub').addEventListener('click', async () => {
  const nEl = document.getElementById('fName');
  const eEl = document.getElementById('fEmail');
  const mEl = document.getElementById('fMsg');
  const s = document.getElementById('cstat');
  const btn = document.getElementById('csub');

  const n = (nEl.value || '').trim();
  const e = (eEl.value || '').trim();
  const m = (mEl.value || '').trim();

  if (!n || !e || !m) { setCStatus(s, '⚠ All fields required.', false); return; }
  if (!validateEmail(e)) { setCStatus(s, '⚠ Enter a valid email.', false); return; }

  btn.disabled = true;
  setCStatus(s, '⚡ Transmitting…', true);

  try {
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n, email: e, message: m })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || 'Failed to send');

    setCStatus(s, '⚡ Transmission sent! ETA: shortly.', true);
    nEl.value = ''; eEl.value = ''; mEl.value = '';
    setTimeout(() => { if (s) s.textContent = ''; }, 4000);
  } catch (err) {
    setCStatus(s, '⚠ Transmission failed. Try again.', false);
  } finally {
    btn.disabled = false;
  }
});

document.querySelectorAll('a[href^=\"#\"]').forEach(a => { a.addEventListener('click', e => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }) } }); });

// Visitor counter
fetch('/api/visit', { method: 'POST' }).catch(() => {});

