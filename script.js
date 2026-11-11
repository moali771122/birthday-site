const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);

/* ================= CONFETTI (canvas) ================= */
const canvas = $('#fx');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, parts = [], running = false;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize); resize();

const COLORS = ['#ff5c93', '#ffd1e1', '#ffffff', '#e0245e', '#ff9bbb', '#ffcf6b', '#ff7ab0'];
function addPart(x, y, vx, vy) {
  parts.push({
    x, y, vx, vy,
    w: rand(4, 9), h: rand(3, 6), r: rand(0, 6.28), vr: rand(-.3, .3),
    c: COLORS[(Math.random() * COLORS.length) | 0],
    circle: Math.random() < .4, life: 0, max: rand(140, 260)
  });
}
function burst(x, y, n = 150) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(3, 13);
    addPart(x, y, Math.cos(a) * s, Math.sin(a) * s - rand(2, 6));
  }
  start();
}
function rain(ms = 4500) {
  const t0 = performance.now();
  const id = setInterval(() => {
    for (let i = 0; i < 7; i++) addPart(rand(0, W), -10, rand(-1.5, 1.5), rand(1.5, 4.5));
    start();
    if (performance.now() - t0 > ms) clearInterval(id);
  }, 70);
}
function start() { if (!running) { running = true; requestAnimationFrame(tick); } }
function tick() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life < p.max && p.y < H + 20);
  for (const p of parts) {
    p.life++; p.vy += .16; p.vx *= .992; p.vy *= .992;
    p.x += p.vx; p.y += p.vy; p.r += p.vr;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
    ctx.fillStyle = p.c;
    if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.28); ctx.fill(); }
    else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (parts.length) requestAnimationFrame(tick); else running = false;
}

/* emoji hearts bursting from an element */
function heartsFrom(el, n = 14) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const set = ['💗', '💖', '💕', '✨', '💜', '❤️'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'burst';
    s.textContent = set[(Math.random() * set.length) | 0];
    s.style.left = cx + rand(-r.width / 2, r.width / 2) + 'px';
    s.style.top = cy + rand(-r.height / 2, r.height / 2) + 'px';
    s.style.setProperty('--x', rand(-110, 110) + 'px');
    s.style.setProperty('--y', rand(-150, -30) + 'px');
    s.style.setProperty('--r', rand(-240, 240) + 'deg');
    s.style.setProperty('--s', rand(14, 28) + 'px');
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

/* ================= FLOATING BACKGROUND HEARTS ================= */
const bg = $('#bgHearts');
const bgSet = ['💗', '💗', '💖', '💜', '💕', '✨', '💓'];
function spawnBg() {
  if (bg.childElementCount > 20) return;
  const s = document.createElement('span');
  s.className = 'bg-heart';
  s.textContent = bgSet[(Math.random() * bgSet.length) | 0];
  s.style.left = rand(2, 96) + '%';
  s.style.fontSize = rand(13, 26) + 'px';
  s.style.setProperty('--d', rand(9, 15) + 's');
  s.style.setProperty('--sway', rand(-40, 40) + 'px');
  bg.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}
for (let i = 0; i < 6; i++) setTimeout(spawnBg, i * 350);
setInterval(spawnBg, 900);

/* ================= DOCK + REVEAL ================= */
$$('.dock button').forEach(b => b.addEventListener('click', () => $(b.dataset.target).scrollIntoView({ behavior: 'smooth' })));
const dockIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('.dock button').forEach(b => b.classList.toggle('active', b.dataset.target === '#' + e.target.id));
}), { threshold: .55 });
$$('main .section').forEach(s => dockIO.observe(s));
const revIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); }
}), { threshold: .25 });
$$('.reveal').forEach(el => revIO.observe(el));

/* ================= HERO: BLOW THE CANDLE ================= */
const cake = $('#cake'), blowBtn = $('#blowBtn'), heroCopy = $('#heroCopy');
const heroTitle = $('#heroTitle'), heroSub = $('#heroSub');
let lit = true;
const TEXT = {
  wish: ['Make a wish,<br /><em>manoushhhhhhh💗</em>', 'Take a deep breath, make a heartfelt wish, and blow out the candle!', 'Blow the Candle ❤️'],
  done: ['Happy Birthday,<br />manoushhhhhhh💗', 'May all your wishes and dreams come true this year! ✨', 'Light it Again ✨']
};
function setHero(k) {
  heroCopy.classList.add('swap');
  setTimeout(() => {
    heroTitle.innerHTML = TEXT[k][0];
    heroSub.textContent = TEXT[k][1];
    heroCopy.classList.remove('swap');
  }, 260);
  blowBtn.innerHTML = TEXT[k][2];
  blowBtn.classList.toggle('again', k === 'done');
}
function blow() {
  lit = false;
  cake.classList.add('out');
  setHero('done');
  const r = $('#flame').getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 170);
  setTimeout(() => burst(innerWidth * .2, innerHeight * .3, 60), 250);
  setTimeout(() => burst(innerWidth * .8, innerHeight * .3, 60), 400);
  heartsFrom(cake, 18);
}
function relight() {
  lit = true;
  cake.classList.remove('out');
  setHero('wish');
  heartsFrom(cake, 8);
}
blowBtn.addEventListener('click', () => (lit ? blow() : relight()));

/* ================= MEMORIES ================= */
const memories = [
  ['assets/memory-1.jpg', 'our mirror day ♡'],
  ['assets/memory-2.jpg', 'silly us, forever'],
  ['assets/memory-3.jpg', 'my favorite view'],
  ['assets/memory-4.jpg', 'sunny days with you'],
  ['assets/memory-video.mp4', 'a little moment, on repeat']
];
let mi = 0;
const polaroid = $('#polaroid'), caption = $('#memoryCaption'), count = $('#photoCount');
function renderMemory() {
  const [src, text] = memories[mi];
  polaroid.classList.add('changing');
  setTimeout(() => {
    polaroid.querySelector('img, video')?.remove();
    let el;
    if (/\.(mov|mp4)$/i.test(src)) {
      el = document.createElement('video');
      Object.assign(el, { src, autoplay: true, muted: true, loop: true, playsInline: true });
    } else {
      el = document.createElement('img'); el.src = src; el.alt = text;
    }
    polaroid.insertBefore(el, caption);
    caption.textContent = text;
    count.textContent = `PHOTO ${mi + 1} OF ${memories.length}`;
    polaroid.classList.remove('changing');
  }, 170);
}
$('.prev').addEventListener('click', () => { mi = (mi - 1 + memories.length) % memories.length; renderMemory(); });
$('.next').addEventListener('click', () => { mi = (mi + 1) % memories.length; renderMemory(); });

/* ================= SONG ================= */
const audio = $('#song-audio'), playBtn = $('#playSong'), disc = $('#disc');
const seek = $('#seek'), vol = $('#vol'), playedEl = $('#played'), remEl = $('#remaining');
// ثانية بداية المقطع داخل الأغنية. للتجربة السريعة افتح الصفحة بـ  index.html?start=25  وغيّر الرقم
const CLIP_START = Number(new URLSearchParams(location.search).get('start')) || 9;
const CLIP_LEN = 30;   // مدة المقطع بالثواني
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const paint = el => el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%');
function ui(elapsed) {
  seek.value = elapsed; paint(seek);
  playedEl.textContent = fmt(elapsed);
  remEl.textContent = '-' + fmt(Math.max(0, CLIP_LEN - elapsed));
}
function setPlaying(p) {
  $('#iconPlay').hidden = p; $('#iconPause').hidden = !p;
  disc.classList.toggle('playing', p);
}
function begin() { audio.currentTime = CLIP_START; audio.play(); }
playBtn.addEventListener('click', () => {
  if (audio.paused) { if (audio.currentTime < CLIP_START || audio.currentTime >= CLIP_START + CLIP_LEN) audio.currentTime = CLIP_START; audio.play(); }
  else audio.pause();
});
$('#rewind').addEventListener('click', () => { audio.currentTime = Math.max(CLIP_START, audio.currentTime - 5); });
$('#forward').addEventListener('click', () => { audio.currentTime = Math.min(CLIP_START + CLIP_LEN - .1, audio.currentTime + 5); });
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('timeupdate', () => {
  const el = audio.currentTime - CLIP_START;
  if (el >= CLIP_LEN) { audio.pause(); audio.currentTime = CLIP_START; ui(0); return; }
  if (el >= 0) ui(el);
});
seek.addEventListener('input', () => { audio.currentTime = CLIP_START + parseFloat(seek.value); ui(parseFloat(seek.value)); });
vol.addEventListener('input', () => { audio.volume = parseFloat(vol.value); paint(vol); });
audio.volume = .7; paint(vol);
seek.max = CLIP_LEN; ui(0);

/* ================= ENDING ================= */
const ending = $('#ending'), yesBtn = $('#yesBtn'), noBtn = $('#noBtn');
const noLabels = ['No', 'Please? 🥺', 'Really?!', 'Are you sure? 🥹', 'Knew you would say yes! ✨'];
let noCount = 0;
let finished = false;
function finale() {
  if (finished) return;
  finished = true;
  const r = yesBtn.getBoundingClientRect();
  heartsFrom(yesBtn, 26);
  burst(r.left + r.width / 2, r.top + r.height / 2, 190);
  setTimeout(() => { ending.classList.add('done'); rain(5200); burst(innerWidth / 2, innerHeight * .3, 120); }, 450);
}
noBtn.addEventListener('click', () => {
  // بعد ما الرسائل تخلص، الضغطة اللي بعدها تفتح الرسالة الأخيرة
  if (noCount >= noLabels.length - 1) { heartsFrom(yesBtn, 20); finale(); return; }
  noCount++;
  noBtn.textContent = noLabels[Math.min(noCount, noLabels.length - 1)];
  yesBtn.style.fontSize = Math.min(16 + noCount * 6, 40) + 'px';
  yesBtn.style.borderRadius = noCount > 2 ? '28px' : '40px';
  noBtn.style.fontSize = Math.max(10, 15 - noCount * 1.5) + 'px';
  noBtn.style.padding = noCount > 2 ? '10px 12px' : '12px 18px';
  heartsFrom(yesBtn, 12 + noCount * 3);
  // آخر رسالة: بعد ثانية ونص تفتح الصفحة الأخيرة لوحدها (أو بالضغط)
  if (noCount >= noLabels.length - 1) setTimeout(() => { if (!finished) { heartsFrom(yesBtn, 20); finale(); } }, 1500);
});
yesBtn.addEventListener('click', finale);
$('#backTop').addEventListener('click', () => {
  scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    ending.classList.remove('done');
    noCount = 0; finished = false; noBtn.textContent = 'No';
    yesBtn.removeAttribute('style'); noBtn.removeAttribute('style');
    if (!lit) relight();
  }, 900);
});
