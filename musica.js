const lyrics = [
  {
    time: 0,
    original: "",
    translation: ""
  }
  // Adicione mais objetos no mesmo formato:
  // { time: 12, original: "verso original", translation: "tradução em português" },
];

/* ---------------------------------------------------------
   2) Referências do DOM
   --------------------------------------------------------- */
const introScreen   = document.getElementById('intro');
const playerScreen  = document.getElementById('player');
const endingScreen  = document.getElementById('ending');

const startBtn      = document.getElementById('startBtn');
const playBtn       = document.getElementById('playBtn');
const iconPlay      = document.getElementById('iconPlay');
const iconPause     = document.getElementById('iconPause');

const audio         = document.getElementById('audio');
const cover         = document.getElementById('cover');
const progressBar   = document.getElementById('progressBar');
const progressFill  = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');


const endText2      = document.getElementById('endText2');
const continueBtn   = document.getElementById('continueBtn');

/* ---------------------------------------------------------
   3) Transições entre telas
   --------------------------------------------------------- */
function showScreen(screen) {
  [introScreen, playerScreen, endingScreen].forEach(s => {
    s.classList.remove('active', 'fade-out');
  });
  // pequeno atraso para garantir o reflow do fade
  requestAnimationFrame(() => screen.classList.add('active'));
}

function fadeOut(screen, cb) {
  screen.classList.add('fade-out');
  setTimeout(() => {
    screen.classList.remove('active', 'fade-out');
    if (cb) cb();
  }, 900);
}

/* ---------------------------------------------------------
   4) Tela inicial -> Player
   --------------------------------------------------------- */
startBtn.addEventListener('click', () => {
  fadeOut(introScreen, () => {
    showScreen(playerScreen);

    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log("Autoplay bloqueado, aguarde interação.");
      });
    }
  });
});

/* ---------------------------------------------------------
   5) Player - Play/Pause
   --------------------------------------------------------- */
function setPlayingUI(isPlaying) {
  iconPlay.style.display  = isPlaying ? 'none' : 'block';
  iconPause.style.display = isPlaying ? 'block' : 'none';
  cover.classList.toggle('spinning', isPlaying);
}

playBtn.addEventListener('click', togglePlay);

function togglePlay() {
  if (audio.paused) {
    audio.play();
    setPlayingUI(true);
  } else {
    audio.pause();
    setPlayingUI(false);
  }
}

audio.addEventListener('play', () => {
  audio.muted = false;
});
audio.addEventListener('pause', () => setPlayingUI(false));

/* ---------------------------------------------------------
   6) Tempo & Barra de progresso
   --------------------------------------------------------- */
function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / audio.duration) * 100 || 0;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

function seekFromEvent(e) {
  const rect = progressBar.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;

  const ratio = Math.max(0, Math.min(1, x / rect.width));
  const newTime = ratio * audio.duration;

  audio.currentTime = newTime;

  updateUIProgress(newTime);
}

function updateUIProgress(time) {
  const pct = (time / audio.duration) * 100;

  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  currentTimeEl.textContent = formatTime(time);

  syncLyrics(time); // se estiver usando letras
}

progressBar.addEventListener('mousedown', (e) => { isScrubbing = true; seekFromEvent(e); });
window.addEventListener('mousemove', (e) => { if (isScrubbing) seekFromEvent(e); });
window.addEventListener('mouseup',   () => { isScrubbing = false; });
progressBar.addEventListener('touchstart', (e) => { isScrubbing = true; seekFromEvent(e); }, {passive:true});
window.addEventListener('touchmove', (e) => { if (isScrubbing) seekFromEvent(e); }, {passive:true});
window.addEventListener('touchend',  () => { isScrubbing = false; });

/* ---------------------------------------------------------
   7) Letra - render & sincronização
   --------------------------------------------------------- */
let lyricNodes = [];
let currentLyricIndex = -1;

/* ---------------------------------------------------------
   8) Fim da música -> tela final
   --------------------------------------------------------- */
audio.addEventListener('ended', goToEnding);

function goToEnding() {
  fadeOut(playerScreen, () => {
    showScreen(endingScreen);
    // Após 3 segundos: revela segundo texto e botão
    setTimeout(() => {
      endText2.style.opacity = '1';
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
    }, 3000);
  });
}

continueBtn.addEventListener('click', () => {
  window.location.href = "Valentina.html";
});

/* ---------------------------------------------------------
   9) Atalho de teclado - Espaço = Play/Pause
   --------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && playerScreen.classList.contains('active')) {
    e.preventDefault();
    togglePlay();
  }
});

/* ---------------------------------------------------------
   10) Fundo: corações subindo
   --------------------------------------------------------- */
const heartsLayer = document.getElementById('hearts');
const HEART_CHARS = ['❤', '♥', '❤️', '🤍'];

function spawnHeart() {
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
  const size = 14 + Math.random() * 22;
  const duration = 9 + Math.random() * 8;
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = size + 'px';
  h.style.animationDuration = duration + 's';
  h.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
  h.style.color = Math.random() > 0.7 ? '#d9b56b' : '#ff86b0';
  heartsLayer.appendChild(h);
  setTimeout(() => h.remove(), duration * 1000 + 500);
}
setInterval(spawnHeart, 600);

/* ---------------------------------------------------------
   11) Fundo: partículas brilhantes (canvas)
   --------------------------------------------------------- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function initParticles() {
  const count = Math.min(70, Math.floor(window.innerWidth / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    a: Math.random() * 0.6 + 0.2,
    twinkle: Math.random() * Math.PI * 2
  }));
}
initParticles();
window.addEventListener('resize', initParticles);

// Leve efeito parallax com mouse
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx + mouseX * 0.15;
    p.y += p.vy + mouseY * 0.15;
    p.twinkle += 0.03;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    const alpha = p.a * (0.6 + 0.4 * Math.sin(p.twinkle));
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
    grd.addColorStop(0, `rgba(255, 220, 235, ${alpha})`);
    grd.addColorStop(1, 'rgba(255, 220, 235, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ---------------------------------------------------------
   12) Parallax suave no card central
   --------------------------------------------------------- */
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 8;
  const y = (e.clientY / window.innerHeight - 0.5) * 8;
  document.querySelectorAll('.screen.active .card, .screen.active .player-wrapper').forEach(el => {
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
});