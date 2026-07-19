const startBtn = document.getElementById("startBtn");
const teamPickBtn = document.getElementById("teamPickBtn");
const teamsPanel = document.getElementById("teamsPanel");
const replayBtn = document.getElementById("replayBtn");
const quitBtn = document.getElementById("quitBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const loseScreen = document.getElementById("loseScreen");
const hudTeamFlag = document.getElementById("hudTeamFlag");
const ballEl = document.getElementById("ball");
const patternEl = document.getElementById("ballPattern");
const ghostEl = document.getElementById("ballGhost");
const ghostPatternEl = document.getElementById("ghostPattern");
const goalArea = document.getElementById("goalArea");
const cageEl = document.getElementById("cage");
const keeperEl = document.getElementById("keeper");
const keeperBodyEl = document.getElementById("keeperBody");
const keeperHeadEl = document.getElementById("keeperHead");
const goalMarker = document.getElementById("goalMarker");
const scoreValEl = document.getElementById("scoreVal");
const livesEl = document.getElementById("livesEl");
const hitboxBgImg = document.getElementById("hitboxBg");
const hitboxCageImg = document.getElementById("hitboxCage");

const BALL_SIZE = 118;
const SCALE_NEAR = 1;
const SCALE_FAR = 0.42;
const DRAG = 0.994;
const MIN_SPEED = 90;
const MAX_SPEED = 2200;
const FLIGHT_MIN = 45;
const FLIGHT_MAX = 360;
const POWER_SPAN = 1700;
const MESH_TILE = 46;
const RESET_DELAY = 900;
const ROLL_GAIN = 0.55;
const CURVE_SPIN_MAX = 4.5;
/** en dessous : pas de déviation (tir quasi droit) */
const CURVE_DEADZONE = 1.15;
/** rad/s de courbure de trajectoire (arc) */
const CURVE_TURN = 0.72;
const FLIGHT_ROLL = 0.085;
const BOUNCE = 0.34;
/** hitbox collision balle (centre du ballon blanc) */
const BALL_HIT = 10;
const RECOVER_DELAY = 100;
const BOUNCE_LIFE = 1000;
const SIDE_MARGIN = 0.04; // zone de clamp au tir / aim
const SIDE_OUT_MARGIN = -0.02; // sortie latérale plus tard (laisse passer les effets)
const KEEPER_FRAMES = ["Gardien_walk_bas1.png", "Gardien_walk_bas2.png"];
const KEEPER_WIN = ["Gardien_win1.png", "Gardien_win2.png"];
const KEEPER_HEAD = "Gardien_head_idle.png";
const KEEPER_HEAD_SMILE = "Gardien_head_souriant.png";
const KEEPER_HEAD_ANXIOUS = "Gardien_head_anxious.png";
const KEEPER_HIT = "Gardien_Goal_hit.png";
const KEEPER_WIN_MS = 500;
const KEEPER_FRAME_MS = 270;
const KEEPER_CELEBRATE_MS = 1000;
const KEEPER_ANXIOUS_MS = 500;
const KEEPER_MIN_X = 0.16;
const KEEPER_MAX_X = 0.84;
const KEEPER_SPEED_BASE = 0.14;
const KEEPER_SPEED_PER_GOAL = 0.045;
const KEEPER_BOB_PX = 3.5;
const KEEPER_BASE_Y = 10; // descend un peu
const KEEPER_BOUNCE_MS = 320;
const KEEPER_BOUNCE_PX = 9;
/** masques alpha : corps (2 frames) + tête */
const keeperBodyMasks = [null, null];
let keeperHeadMask = null;
/** bande sol hitbox_bg (bleu), ratios hauteur image */
/** bande hitbox_bg : rouge=vide, bleu=sol */
const BG_RED_BOT = 0.225;
const BG_BLUE_TOP = 0.456;
const BG_BLUE_BOT = 0.695;

// Masque hitbox_cage 97x50 : 0=rien, 1=rouge(faible), 2=vert, 3=bleu(moyen), 4=violet(fort)
const CAGE_MASK_W = 97;
const CAGE_MASK_H = 50;
const CAGE_MASK = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000222222222222222222222222222222222222222222222222222222222222222222222222222222222222222200000002222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222200002222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222220000222444444444444444444444444444444444444444444444444444444444444444444444444444444444444444422200022244444444444444444444444444444444444444444444444444444444444444444444444444444444444444442220002244444444444444444444444444444444444444444444444444444444444444444444444444444444444444444222000224444444444444444444444444444444444444444444444444444444444444444444444444444444444444444422200022444444444444444444444444444444444444444444444444444444444444444444444444444444444444444442220002244444444444444444444444444444444444444444444444444444444444444444444444444444444444444444222000224444444444444444444444444444444444444444444444444444444444444444444444444444444444444444422200022444444444444444444444444444444444444444444444444444444444444444444444444444444444444444442220002244444444444444444444444444444444444444444444444444444444444444444444444444444444444444444222000224444444444444444444444444444444444444444444444444444444444444444444444444444444444444444422200022444444444444444444444444444444444444444444444444444444444444444444444444444444444444444442220002244444444444444444444444444444444444444444444444444444444444444444444444444444444444444444222000224444444444444444444444444444444444444444444444444444444444444444444444444444444444444444422200022444444444444444444444444444444444444444444444444444444444444444444444444444444444444444442220002233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333222000223333333333333333333333333333333333333333333333333333333333333333333333333333333333333333322200022333333333333333333333333333333333333333333333333333333333333333333333333333333333333333332220002233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333222000223333333333333333333333333333333333333333333333333333333333333333333333333333333333333333322200022333333333333333333333333333333333333333333333333333333333333333333333333333333333333333332220002233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333222000223333333333333333333333333333333333333333333333333333333333333333333333333333333333333333322200022333333333333333333333333333333333333333333333333333333333333333333333333333333333333333332220002233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333222000223333333333333333333333333333333333333333333333333333333333333333333333333333333333333333322200022333333333333333333333333333333333333333333333333333333333333333333333333333333333333333332220002211111111111111111111111111111111111111111111111111111111111111111111111111111111111111111222000221111111111111111111111111111111111111111111111111111111111111111111111111111111111111111122200022111111111111111111111111111111111111111111111111111111111111111111111111111111111111111112220002211111111111111111111111111111111111111111111111111111111111111111111111111111111111111111222000221111111111111111111111111111111111111111111111111111111111111111111111111111111111111111122200022111111111111111111111111111111111111111111111111111111111111111111111111111111111111111112220000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111100000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111110000000011111111110000000000000000000000001111111111111111111111111111111111111111111111111111111000000001111111100000000000000000000000000000000000000000000000000000000000000000000000011111111100000000111111000000000000000000000000000000000000000000000000000000000000000000000000000011111110000000011110000000000000000000000000000000000000000000000000000000000000000000000000000000011111000000001100000000000000000000000000000000000000000000000000000000000000000000000000000000000011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const ZONE = { none: 0, red: 1, green: 2, blue: 3, violet: 4 };

let state = "idle";
let x = 0;
let y = 0;
let vx = 0;
let vy = 0;
let patX = 0;
let patY = 0;
let homeX = 0;
let homeY = 0;
let nearY = 0;
let farY = 0;
let lastT = 0;
let pointerId = null;
let samples = [];
let lastAim = null;
let ballSpin = 0;
let spinVel = 0;
let flightSpin = 0;
let lastSpinAng = 0;
let hasSpinAng = false;
let floorBounceLock = false;
let leftGround = false;
let prevBgZone = "blue";
let ignoreFloorUntil = 0;
let shotPower = 0;
let throwStartY = 0;
let targetZone = ZONE.red;
let targetMaskX = 48;
let targetMaskY = 35;
let zoneCellsCache = {};
let prevX = 0;
let prevY = 0;
let bounceEndAt = 0;
let recoverTimer = null;
let ghostActive = false;
let gx = 0;
let gy = 0;
let gvx = 0;
let gvy = 0;
let gpatX = 0;
let gpatY = 0;
let keeperFrame = 0;
let keeperX = 0.5;
let keeperDir = -1;
let goalCount = 0;
let score = 0;
let lives = 3;
let keeperCelebrating = false;
let keeperCelebrateTimer = null;
let keeperHeadTimer = null;
let keeperBounceAt = 0;
let gameOver = false;
let keeperWinFrame = 0;
let keeperWinTimer = null;

function loadKeeperMask(src, onDone) {
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    try {
      onDone(ctx.getImageData(0, 0, c.width, c.height));
    } catch (_) {
      onDone({ width: c.width, height: c.height, data: null });
    }
  };
  img.src = src;
}

KEEPER_FRAMES.forEach((src, i) => {
  loadKeeperMask(src, (mask) => { keeperBodyMasks[i] = mask; });
});
loadKeeperMask(KEEPER_HEAD, (mask) => { keeperHeadMask = mask; });

function keeperFlipScaleX() {
  return keeperDir > 0 ? -1 : 1;
}

function keeperBounceY(now) {
  const t = (now - keeperBounceAt) / KEEPER_BOUNCE_MS;
  if (t < 0 || t >= 1) return 0;
  return -Math.sin(t * Math.PI) * KEEPER_BOUNCE_PX;
}

function keeperBounceScale(now) {
  const t = (now - keeperBounceAt) / KEEPER_BOUNCE_MS;
  if (t < 0 || t >= 1) return 1;
  if (t < 0.35) return 1 + 0.16 * (t / 0.35);
  if (t < 0.7) return 1.16 - 0.22 * ((t - 0.35) / 0.35);
  return 0.94 + 0.06 * ((t - 0.7) / 0.3);
}

function updateKeeper(dt) {
  if (!keeperEl || game.hidden) return;
  const now = performance.now();
  const fx = keeperFlipScaleX();

  if (gameOver) {
    keeperEl.style.left = `${keeperX * 100}%`;
    keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y}px) scale(${fx}, 1)`;
    return;
  }

  if (keeperCelebrating) {
    const by = KEEPER_BASE_Y + keeperBounceY(now);
    const sc = keeperBounceScale(now);
    keeperEl.style.left = `${keeperX * 100}%`;
    keeperEl.style.transform = `translateX(-50%) translateY(${by}px) scale(${sc * fx}, ${sc})`;
    return;
  }

  const speed = KEEPER_SPEED_BASE + goalCount * KEEPER_SPEED_PER_GOAL;
  keeperX += keeperDir * speed * dt;
  if (keeperX <= KEEPER_MIN_X) {
    keeperX = KEEPER_MIN_X;
    keeperDir = 1;
  } else if (keeperX >= KEEPER_MAX_X) {
    keeperX = KEEPER_MAX_X;
    keeperDir = -1;
  }
  keeperEl.style.left = `${keeperX * 100}%`;
  const bobHz = 1000 / KEEPER_FRAME_MS;
  const s = Math.sin(now * 0.001 * bobHz * Math.PI * 2);
  const bobY = Math.sign(s) * Math.pow(Math.abs(s), 0.55) * KEEPER_BOB_PX;
  keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y + bobY}px) scale(${fx}, 1)`;
}

function bounceKeeperHead() {
  if (!keeperHeadEl) return;
  keeperHeadEl.classList.remove("is-head-bounce");
  void keeperHeadEl.offsetWidth;
  keeperHeadEl.classList.add("is-head-bounce");
}

function setKeeperHead(src) {
  if (!keeperHeadEl) return;
  if (keeperHeadEl.getAttribute("src") !== src) {
    keeperHeadEl.src = src;
  }
  bounceKeeperHead();
}

function playKeeperSaveAnim() {
  if (gameOver) return;
  keeperCelebrating = true;
  keeperBounceAt = performance.now();
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_HIT;
  setKeeperHead(KEEPER_HEAD_SMILE);
  const fx = keeperFlipScaleX();
  keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y}px) scale(${fx}, 1)`;

  keeperCelebrateTimer = setTimeout(() => {
    keeperCelebrating = false;
    if (keeperBodyEl) keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
    setKeeperHead(KEEPER_HEAD);
  }, KEEPER_CELEBRATE_MS);
}

function playKeeperAnxiousHead() {
  if (gameOver || keeperCelebrating) return;
  clearTimeout(keeperHeadTimer);
  setKeeperHead(KEEPER_HEAD_ANXIOUS);
  keeperHeadTimer = setTimeout(() => {
    if (!keeperCelebrating) setKeeperHead(KEEPER_HEAD);
  }, KEEPER_ANXIOUS_MS);
}

setInterval(() => {
  if (!keeperBodyEl || keeperCelebrating || gameOver) return;
  keeperFrame = 1 - keeperFrame;
  keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
}, KEEPER_FRAME_MS);

function showGameOver() {
  gameOver = true;
  state = "idle";
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  keeperCelebrating = false;
  clearInterval(keeperWinTimer);
  keeperWinFrame = 0;
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_WIN[0];
  if (keeperHeadEl) {
    keeperHeadEl.src = KEEPER_HEAD_SMILE;
    bounceKeeperHead();
  }
  const fx = keeperFlipScaleX();
  if (keeperEl) {
    keeperEl.style.left = `${keeperX * 100}%`;
    keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y}px) scale(${fx}, 1)`;
  }
  keeperWinTimer = setInterval(() => {
    if (!gameOver || !keeperBodyEl) return;
    keeperWinFrame = 1 - keeperWinFrame;
    keeperBodyEl.src = KEEPER_WIN[keeperWinFrame];
  }, KEEPER_WIN_MS);
  if (ballEl) ballEl.hidden = true;
  if (ghostEl) ghostEl.hidden = true;
  if (loseScreen) loseScreen.hidden = false;
}

function replayGame() {
  gameOver = false;
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  if (loseScreen) loseScreen.hidden = true;
  score = 0;
  goalCount = 0;
  lives = 3;
  updateHud();
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
  setKeeperHead(KEEPER_HEAD);
  if (ballEl) ballEl.hidden = false;
  resetBall(false);
}

function quitToMenu() {
  gameOver = false;
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  keeperCelebrating = false;
  if (loseScreen) loseScreen.hidden = true;
  if (teamsPanel) teamsPanel.hidden = true;
  if (ballEl) {
    ballEl.hidden = false;
    ballEl.style.opacity = "1";
  }
  hideGhost();
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
  if (keeperHeadEl) keeperHeadEl.src = KEEPER_HEAD;
  score = 0;
  goalCount = 0;
  lives = 3;
  state = "idle";
  game.hidden = true;
  menu.hidden = false;
}

function bindPress(btn) {
  if (!btn) return;
  btn.addEventListener("pointerdown", () => btn.classList.add("is-pressed"));
  btn.addEventListener("pointerup", () => btn.classList.remove("is-pressed"));
  btn.addEventListener("pointerleave", () => btn.classList.remove("is-pressed"));
}

let selectedTeam = "fr";

function updateHudTeamFlag() {
  if (!hudTeamFlag) return;
  hudTeamFlag.className = `flag flag--${selectedTeam}`;
}

function selectTeam(btn) {
  if (!btn) return;
  document.querySelectorAll(".team").forEach((el) => {
    el.classList.remove("is-selected");
    el.setAttribute("aria-selected", "false");
  });
  btn.classList.add("is-selected");
  btn.setAttribute("aria-selected", "true");
  selectedTeam = btn.dataset.team || "fr";
  updateHudTeamFlag();
  if (teamsPanel) teamsPanel.hidden = true;
}

function toggleTeamsPanel() {
  if (!teamsPanel) return;
  teamsPanel.hidden = !teamsPanel.hidden;
}

const teamGrid = document.getElementById("teamGrid");
if (teamGrid) {
  teamGrid.querySelectorAll(".team").forEach((btn) => {
    bindPress(btn);
    btn.addEventListener("click", () => selectTeam(btn));
  });
}

bindPress(startBtn);
bindPress(teamPickBtn);
bindPress(replayBtn);
bindPress(quitBtn);

if (teamPickBtn) {
  teamPickBtn.addEventListener("click", () => toggleTeamsPanel());
}

if (teamsPanel) {
  teamsPanel.addEventListener("click", (e) => {
    if (e.target === teamsPanel) teamsPanel.hidden = true;
  });
}

startBtn.addEventListener("click", () => {
  if (teamsPanel) teamsPanel.hidden = true;
  menu.hidden = true;
  game.hidden = false;
  updateHudTeamFlag();
  requestAnimationFrame(() => {
    layout();
    buildPions();
    score = 0;
    goalCount = 0;
    lives = 3;
    gameOver = false;
    updateHud();
    resetBall(false);
    lastT = performance.now();
    requestAnimationFrame(loop);
  });
});

if (replayBtn) {
  replayBtn.addEventListener("click", () => {
    replayGame();
  });
}

if (quitBtn) {
  quitBtn.addEventListener("click", () => {
    quitToMenu();
  });
}

window.addEventListener("resize", () => {
  if (game.hidden) return;
  layout();
  if (state === "idle") resetBall(false);
});

function layout() {
  homeX = game.clientWidth / 2;
  homeY = game.clientHeight * 0.78;
  nearY = homeY;
  const goal = goalArea.getBoundingClientRect();
  const g = game.getBoundingClientRect();
  farY = goal.top - g.top + goal.height * 0.35;
}

function resetBall(animate, durMs) {
  if (gameOver) {
    state = "idle";
    if (ballEl) {
      ballEl.hidden = true;
      ballEl.style.opacity = "0";
    }
    hideGhost();
    return;
  }
  vx = 0;
  vy = 0;
  patX = 0;
  patY = 0;
  lastAim = null;
  floorBounceLock = false;
  leftGround = false;
  prevBgZone = "blue";
  ignoreFloorUntil = 0;
  shotPower = 0;
  throwStartY = homeY;
  ballEl.classList.remove("is-flying");

  if (!animate) {
    state = "idle";
    x = homeX;
    y = homeY;
    ballSpin = 0;
    spinVel = 0;
    flightSpin = 0;
    hasSpinAng = false;
    ballEl.hidden = false;
    ballEl.style.opacity = "1";
    setBallRing(true);
    render();
    return;
  }

  // Réapparition : glisse du bas → idle + fade 0→1
  state = "respawning";
  setBallRing(false);
  x = homeX;
  const fromY = game.clientHeight + BALL_SIZE * 0.6;
  const toY = homeY;
  y = fromY;
  ballEl.hidden = false;
  ballEl.style.opacity = "0";
  render();

  const t0 = performance.now();
  const dur = durMs ?? 280;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function slide(now) {
    if (gameOver || state !== "respawning") return;
    const t = clamp((now - t0) / dur, 0, 1);
    const e = easeOut(t);
    y = fromY + (toY - fromY) * e;
    ballEl.style.opacity = String(t);
    render();
    if (t < 1) {
      requestAnimationFrame(slide);
    } else {
      y = toY;
      ballEl.style.opacity = "1";
      state = "idle";
      setBallRing(true);
      render();
    }
  }
  requestAnimationFrame(slide);
}

function updateHud() {
  if (scoreValEl) scoreValEl.textContent = String(score);
  if (!livesEl) return;
  livesEl.querySelectorAll(".hud-ball").forEach((el, i) => {
    el.classList.toggle("is-on", i < lives);
  });
}

function loseLife() {
  lives = Math.max(0, lives - 1);
  updateHud();
  if (lives <= 0) {
    showGameOver();
  }
}

function addScore() {
  score += 1;
  goalCount += 1;
  updateHud();
}

function stopOnGoal(zone) {
  setBallRing(false);
  bounceCage();
  addScore();
  showGoalMarker();
  playKeeperAnxiousHead();
  frenzyPions();
  beginGroundBounce(true);
}

const PION_FRENZY_RATE = 4.2;
let pionRate = 1;
let pionRaf = 0;
let pionLast = 0;
/** @type {{ el: HTMLElement, phase: number, period: number, amp: number }[]} */
const pionData = [];

function buildPions() {
  const wrap = document.getElementById("pionsEl") || document.querySelector(".pions");
  if (!wrap) return;
  const srcs = [
    "pion_01.png", "pion_02.png", "pion_03.png",
    "pion_04.png", "pion_05.png", "pion_06.png",
  ];
  wrap.innerHTML = "";
  pionData.length = 0;
  const count = 48;
  for (let i = 0; i < count; i++) {
    const img = document.createElement("img");
    img.className = "pion";
    img.src = srcs[i % srcs.length];
    img.alt = "";
    img.draggable = false;
    const period = 0.42 + Math.random() * 0.24;
    const amp = -(7 + Math.floor(Math.random() * 9));
    const x = (4 + Math.random() * 92).toFixed(2);
    img.style.setProperty("--x", `${x}%`);
    wrap.appendChild(img);
    pionData.push({
      el: img,
      phase: Math.random() * Math.PI * 2,
      period,
      amp,
    });
  }
  startPionBounce();
}

function startPionBounce() {
  cancelAnimationFrame(pionRaf);
  pionLast = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - pionLast) / 1000);
    pionLast = now;
    for (let i = 0; i < pionData.length; i++) {
      const p = pionData[i];
      p.phase += (Math.PI * dt * pionRate) / p.period;
      const y = p.amp * (0.5 - 0.5 * Math.cos(p.phase));
      p.el.style.transform = `translateX(-50%) translateY(${y}px)`;
    }
    pionRaf = requestAnimationFrame(tick);
  };
  pionRaf = requestAnimationFrame(tick);
}

function frenzyPions() {
  pionRate = PION_FRENZY_RATE;
  clearTimeout(frenzyPions._t);
  frenzyPions._t = setTimeout(() => {
    pionRate = 1;
  }, 500);
}

function stopOnGreen() {
  setBallRing(false);
  bounceCage();
  loseLife();
  beginGroundBounce(true);
}

function stopOnKeeper() {
  setBallRing(false);
  playKeeperSaveAnim();
  loseLife();
  beginGroundBounce(true);
}

/** Raté / hors terrain = 0 */
function stopOnMiss() {
  setBallRing(false);
  loseLife();
  beginGroundBounce(false);
}

/** Trop sur les côtés → continue de rouler + fade, puis revient */
function beginSideExit() {
  if (state !== "flying") return;
  state = "sideOut";
  setBallRing(false);
  // pousse vers l’extérieur pour finir la sortie
  if (x < game.clientWidth * 0.5) {
    vx = -Math.max(Math.abs(vx), 120);
  } else {
    vx = Math.max(Math.abs(vx), 120);
  }
}

function updateSideExit(dt) {
  const w = game.clientWidth;
  const h = game.clientHeight;
  const scale = depthScale(y);
  const r = (BALL_SIZE / 2) * scale;

  vx *= Math.pow(DRAG, dt * 60);
  vy *= Math.pow(0.99, dt * 60);
  x += vx * dt;
  y += vy * dt;

  patX = wrapMesh(patX + vx * FLIGHT_ROLL * dt);
  patY = wrapMesh(patY + Math.abs(vy) * FLIGHT_ROLL * 0.5 * dt);

  // fade selon la sortie de l’écran
  let visible = 1;
  if (x < r) visible = clamp((x + r) / (r * 2 + w * SIDE_MARGIN), 0, 1);
  else if (x > w - r) visible = clamp((w + r - x) / (r * 2 + w * SIDE_MARGIN), 0, 1);
  ballEl.style.opacity = String(visible);
  render();

  if (x + r < -4 || x - r > w + 4 || y < -r || y > h + r) {
    ballEl.style.opacity = "0";
    state = "reset";
    vx = 0;
    vy = 0;
    ballEl.classList.remove("is-flying");
    loseLife();
    scheduleRecover();
  }
}

function isPastSideLimit(px = x, py = y) {
  const w = game.clientWidth;
  const margin = w * SIDE_OUT_MARGIN;
  const scale = depthScale(py);
  const r = (BALL_SIZE / 2) * scale * 0.85;
  return px - r < margin || px + r > w - margin;
}

/** Zone rouge hitbox_bg = vide → balle revient */
function stopOnVoid() {
  setBallRing(false);
  vx = 0;
  vy = 0;
  ballEl.classList.remove("is-flying");
  ballEl.style.opacity = "0";
  state = "reset";
  loseLife();
  scheduleRecover();
}

function scheduleRecover() {
  clearTimeout(recoverTimer);
  if (gameOver) return;
  recoverTimer = setTimeout(() => {
    if (gameOver || state === "idle" || state === "respawning" || state === "aiming") return;
    resetBall(true, 130);
  }, RECOVER_DELAY);
}

function pitchFloorY() {
  return game.clientHeight * (BG_BLUE_BOT - 0.04);
}

function renderGhost() {
  ghostEl.style.transform = ballTransform(gx, gy, undefined, 0);
  ghostPatternEl.style.transform = `translate(calc(-50% + ${gpatX}px), calc(-50% + ${gpatY}px))`;
}

function hideGhost() {
  ghostActive = false;
  ghostEl.hidden = true;
  ghostEl.style.opacity = "0";
  ghostEl.classList.remove("is-flying");
}

/** Fantôme : saut + sol 1s ; balle joueur revient à 0.3s */
function beginGroundBounce(fromCage) {
  if (gameOver) return;
  gx = x;
  gy = y;
  gpatX = patX;
  gpatY = patY;
  gvx = (Math.random() - 0.5) * (fromCage ? 28 : 40);
  gvy = fromCage ? -(240 + Math.random() * 60) : 30 + Math.random() * 40;
  bounceEndAt = performance.now() + BOUNCE_LIFE;
  ghostActive = true;
  ghostEl.hidden = false;
  ghostEl.style.opacity = "1";
  ghostEl.classList.add("is-flying");
  renderGhost();

  ballEl.style.opacity = "0";
  ballEl.classList.remove("is-flying");
  setBallRing(false);
  state = "reset";
  vx = 0;
  vy = 0;
  scheduleRecover();
}

function updateGhostBounce(dt, now) {
  if (!ghostActive) return;

  const floorY = pitchFloorY();
  const onGround = gy >= floorY - 0.5 && gvy >= -40;
  const gravity = onGround ? 650 : 1050;
  gvy += gravity * dt;

  if (onGround) {
    gvx *= Math.pow(0.86, dt * 60);
  } else {
    gvx *= Math.pow(0.99, dt * 60);
  }

  gx += gvx * dt;
  gy += gvy * dt;

  if (gy >= floorY && gvy > 0) {
    gy = floorY;
    const impact = Math.abs(gvy);
    if (impact > 70) {
      gvy = -impact * 0.2;
      gvx *= 0.7;
    } else {
      gvy = 0;
      gvx *= 0.8;
    }
  }

  gx = clamp(gx, BALL_SIZE * 0.25, game.clientWidth - BALL_SIZE * 0.25);

  const rollGain = onGround ? 0.004 : 0.02;
  gpatX = wrapMesh(gpatX + gvx * rollGain * dt * 60);
  gpatY = wrapMesh(gpatY + Math.abs(gvy) * (onGround ? 0.002 : 0.01) * dt * 60);

  const left = bounceEndAt - now;
  if (left <= 0) {
    hideGhost();
    return;
  }
  if (left < 180) {
    ghostEl.style.opacity = String(clamp(left / 180, 0, 1));
  }

  renderGhost();
}

function depthScale(py) {
  // loin = petit, près = grand
  const t = clamp((nearY - py) / Math.max(1, nearY - farY), 0, 1);
  const eased = t * t * (3 - 2 * t);
  return SCALE_NEAR + (SCALE_FAR - SCALE_NEAR) * eased;
}

function ballTransform(px, py, scale, rot = ballSpin) {
  const s = scale ?? depthScale(py);
  const r = rot ?? 0;
  return `translate3d(${px - BALL_SIZE / 2}px, ${py - BALL_SIZE / 2}px, 0) scale(${s}) rotate(${r}rad)`;
}

function wrapMesh(v) {
  while (v > MESH_TILE) v -= MESH_TILE * 2;
  while (v < -MESH_TILE) v += MESH_TILE * 2;
  return v;
}

function render() {
  ballEl.style.transform = ballTransform(x, y);
  patternEl.style.transform = `translate(calc(-50% + ${patX}px), calc(-50% + ${patY}px))`;
}

function setBallRing(on) {
  ballEl.classList.toggle("show-ring", on);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function localPoint(e) {
  const rect = game.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
}

function hitBall(px, py) {
  const scale = depthScale(y);
  const r = (BALL_SIZE / 2) * scale * 1.12;
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= r * r;
}

function maskAt(mx, my) {
  if (mx < 0 || my < 0 || mx >= CAGE_MASK_W || my >= CAGE_MASK_H) return 0;
  return CAGE_MASK.charCodeAt(my * CAGE_MASK_W + mx) - 48;
}

function cellsForZone(zoneId) {
  if (zoneCellsCache[zoneId]) return zoneCellsCache[zoneId];
  const cells = [];
  for (let my = 0; my < CAGE_MASK_H; my++) {
    for (let mx = 0; mx < CAGE_MASK_W; mx++) {
      if (maskAt(mx, my) === zoneId) cells.push({ mx, my });
    }
  }
  zoneCellsCache[zoneId] = cells;
  return cells;
}

function pickRandomCell(zoneId) {
  let cells = cellsForZone(zoneId);
  if (!cells.length) return { mx: 48, my: 30 };

  if (zoneId === ZONE.violet) {
    // bien au milieu du violet (pas le bord du bleu)
    const pool = cells.filter((c) => c.my >= 5 && c.my <= 14 && c.mx >= 10 && c.mx <= 86);
    if (pool.length) cells = pool;
  } else if (zoneId === ZONE.blue) {
    const pool = cells.filter((c) => c.my >= 19 && c.my <= 27 && c.mx >= 10 && c.mx <= 86);
    if (pool.length) cells = pool;
  } else if (zoneId === ZONE.red) {
    const pool = cells.filter((c) => c.my >= 31 && c.my <= 42 && c.mx >= 10 && c.mx <= 86);
    if (pool.length) cells = pool;
  }

  if (!cells.length) cells = cellsForZone(zoneId);
  for (let i = 0; i < 8; i++) {
    const pick = cells[(Math.random() * cells.length) | 0];
    if (maskAt(pick.mx, pick.my) === zoneId) return pick;
  }
  return cells[(Math.random() * cells.length) | 0];
}

function zoneFromPower(power) {
  if (power < 0.36) return ZONE.red;
  if (power < 0.52) return ZONE.blue;
  return ZONE.violet;
}

function zoneName(id) {
  if (id === ZONE.red) return "red";
  if (id === ZONE.blue) return "blue";
  if (id === ZONE.violet) return "violet";
  if (id === ZONE.green) return "green";
  return "other";
}

/** Collision : petit carré ~10x10 au centre — ne compte QUE la zone voulue (passe rouge/bleu pour aller au violet) */
function probeCageAtScreen(cx, cy) {
  const cage = hitboxCageImg.getBoundingClientRect();
  if (cage.width < 2 || cage.height < 2) return "other";

  const half = BALL_HIT * 0.5;
  const offsets = [
    [0, 0],
    [-half, -half], [half, -half], [-half, half], [half, half],
    [-half, 0], [half, 0], [0, -half], [0, half],
  ];

  const hits = { red: 0, blue: 0, violet: 0, green: 0 };
  const wanted = zoneName(targetZone);
  for (const [ox, oy] of offsets) {
    const px = cx + ox;
    const py = cy + oy;
    if (px < cage.left || px > cage.right || py < cage.top || py > cage.bottom) continue;
    const mx = Math.floor(((px - cage.left) / cage.width) * CAGE_MASK_W);
    const my = Math.floor(((py - cage.top) / cage.height) * CAGE_MASK_H);
    const cell = maskAt(mx, my);
    // uniquement la vraie couleur — pas de fuzzy bleu→violet (sinon but sur le bleu)
    if (cell === ZONE.violet) hits.violet++;
    else if (cell === ZONE.blue) hits.blue++;
    else if (cell === ZONE.red) hits.red++;
    else if (cell === ZONE.green) hits.green++;
  }

  if (wanted === "violet" && hits.violet >= 1) return "violet";
  if (wanted === "blue" && hits.blue >= 1) return "blue";
  if (wanted === "red" && hits.red >= 1) return "red";
  if (hits.green >= 2) return "green";
  return "other";
}

function probeCageZone() {
  const ball = ballEl.getBoundingClientRect();
  return probeCageAtScreen(ball.left + ball.width / 2, ball.top + ball.height / 2);
}

/** Balayage prev→current pour ne pas sauter la zone à haute vitesse */
function probeCageSwept() {
  const g = game.getBoundingClientRect();
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 4));
  let found = "other";
  const wanted = zoneName(targetZone);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = prevX + (x - prevX) * t;
    const sy = prevY + (y - prevY) * t;
    const z = probeCageAtScreen(g.left + sx, g.top + sy);
    if (z === wanted) return z;
    if (z === "green") found = "green";
  }
  return found;
}

/** Hitbox = pixels opaques du PNG gardien (frame courante) */
function keeperAlphaAt(mx, my, mask) {
  if (!mask) return false;
  if (mx < 0 || my < 0 || mx >= mask.width || my >= mask.height) return false;
  if (!mask.data) {
    const u = mx / mask.width;
    const v = my / mask.height;
    return u > 0.22 && u < 0.78 && v > 0.12 && v < 0.96;
  }
  return mask.data[(my * mask.width + mx) * 4 + 3] > 40;
}

function probeKeeperAtScreen(cx, cy) {
  const rect = keeperEl.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const half = BALL_HIT * 0.5;
  const offsets = [
    [0, 0],
    [-half, -half], [half, -half], [-half, half], [half, half],
    [-half, 0], [half, 0], [0, -half], [0, half],
  ];
  const bodyMask = keeperBodyMasks[keeperFrame];
  if (!bodyMask && !keeperHeadMask) return false;
  const mw = (bodyMask || keeperHeadMask).width;
  const mh = (bodyMask || keeperHeadMask).height;
  let hits = 0;
  for (const [ox, oy] of offsets) {
    const px = cx + ox;
    const py = cy + oy;
    if (px < rect.left || px > rect.right || py < rect.top || py > rect.bottom) continue;
    let u = (px - rect.left) / rect.width;
    if (keeperDir > 0) u = 1 - u;
    const mx = Math.floor(u * mw);
    const my = Math.floor(((py - rect.top) / rect.height) * mh);
    if (keeperAlphaAt(mx, my, bodyMask) || keeperAlphaAt(mx, my, keeperHeadMask)) hits++;
  }
  return hits >= 1;
}

function probeKeeperSwept() {
  const g = game.getBoundingClientRect();
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 4));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = prevX + (x - prevX) * t;
    const sy = prevY + (y - prevY) * t;
    if (probeKeeperAtScreen(g.left + sx, g.top + sy)) return true;
  }
  return false;
}

function probeBgZone() {
  const g = game.getBoundingClientRect();
  const bg = hitboxBgImg.getBoundingClientRect();
  const cy = g.top + y;
  if (bg.height < 2) return "other";
  const t = (cy - bg.top) / bg.height;
  if (t <= BG_RED_BOT) return "red";
  if (t >= BG_BLUE_TOP && t <= BG_BLUE_BOT) return "blue";
  return "black";
}

function bounceCage() {
  cageEl.classList.remove("is-bounce");
  void cageEl.offsetWidth;
  cageEl.classList.add("is-bounce");
}

function showGoalMarker() {
  const ball = ballEl.getBoundingClientRect();
  const wrap = document.querySelector(".cage-wrap").getBoundingClientRect();
  const size = Math.max(36, ball.width * 1.05);
  goalMarker.hidden = false;
  goalMarker.classList.remove("is-fade");
  goalMarker.textContent = String(score);
  goalMarker.style.width = `${size}px`;
  goalMarker.style.height = `${size}px`;
  goalMarker.style.fontSize = `${Math.max(16, size * 0.42)}px`;
  goalMarker.style.left = `${ball.left - wrap.left + ball.width / 2}px`;
  goalMarker.style.top = `${ball.top - wrap.top + ball.height / 2}px`;
  goalMarker.style.background = "#e53935";
  goalMarker.style.border = "none";
  goalMarker.style.boxShadow = "none";
  goalMarker.style.opacity = "1";
  goalMarker.style.visibility = "visible";
  clearTimeout(showGoalMarker._t1);
  clearTimeout(showGoalMarker._t2);
  showGoalMarker._t1 = setTimeout(() => {
    goalMarker.classList.add("is-fade");
    goalMarker.style.opacity = "0";
    showGoalMarker._t2 = setTimeout(() => {
      goalMarker.hidden = true;
      goalMarker.classList.remove("is-fade");
      goalMarker.textContent = "";
      goalMarker.style.visibility = "hidden";
      goalMarker.style.background = "transparent";
      goalMarker.style.width = "0";
      goalMarker.style.height = "0";
    }, 150);
  }, 500);
}

function bounceFloor() {
  if (vy <= 0) return;
  // rebond faible, peu de retour vers la caméra ensuite
  vy = -Math.abs(vy) * BOUNCE;
  vx *= 0.88;
  y = Math.min(y - 2, game.clientHeight * BG_BLUE_BOT - BALL_SIZE * 0.2);
  floorBounceLock = true;
  setTimeout(() => { floorBounceLock = false; }, 160);
}

function resolveHits() {
  const bgZone = probeBgZone();

  // rouge hitbox_bg = vide → retour joueur
  if (bgZone === "red") {
    stopOnVoid();
    prevBgZone = bgZone;
    return;
  }

  if (bgZone === "black") leftGround = true;

  // gardien d'abord (hitbox = son PNG)
  if (probeKeeperSwept()) {
    ignoreFloorUntil = performance.now() + 800;
    stopOnKeeper();
    prevBgZone = bgZone;
    return;
  }

  const cageZone = probeCageSwept();
  const wanted = zoneName(targetZone);
  if (cageZone === wanted) {
    ignoreFloorUntil = performance.now() + 800;
    stopOnGoal(cageZone);
    prevBgZone = bgZone;
    return;
  }

  if (cageZone === "green") {
    ignoreFloorUntil = performance.now() + 800;
    stopOnGreen();
    prevBgZone = bgZone;
    return;
  }

  if (
    leftGround &&
    performance.now() > ignoreFloorUntil &&
    !floorBounceLock &&
    bgZone === "blue" &&
    prevBgZone === "black" &&
    vy > 60
  ) {
    bounceFloor();
  }

  prevBgZone = bgZone;
}

/** Guide vers une cellule RANDOM — violet traverse rouge/bleu jusqu’au haut */
function applyPowerAim(dt) {
  const g = game.getBoundingClientRect();
  const cage = hitboxCageImg.getBoundingClientRect();
  if (cage.height < 2) return;

  const targetX = (cage.left - g.left) + ((targetMaskX + 0.5) / CAGE_MASK_W) * cage.width;
  const targetY = (cage.top - g.top) + ((targetMaskY + 0.5) / CAGE_MASK_H) * cage.height;

  const denom = Math.max(40, throwStartY - targetY);
  const progress = clamp((throwStartY - y) / denom, 0, 1);
  const boost = targetZone === ZONE.violet ? 1.15 : targetZone === ZONE.blue ? 0.85 : 0.65;
  const pullY = (0.04 + progress * progress * (0.35 + shotPower * 0.45)) * boost;
  const spinAmt = Math.abs(clamp(flightSpin, -CURVE_SPIN_MAX, CURVE_SPIN_MAX));
  // moins de correction X si effet : laisse l’arc se former
  const pullX = (0.03 + progress * progress * 0.28) * (0.5 + shotPower * 0.3) * (1 - Math.min(0.45, spinAmt * 0.1));

  x += (targetX - x) * Math.min(1, pullX * dt * 6);
  y += (targetY - y) * Math.min(1, pullY * dt * (7 + shotPower * 6));

  // force la montée jusqu’au violet (ne s’arrête pas dans le bleu)
  if (targetZone === ZONE.violet && y > targetY + 4) {
    const catchUp = (y - targetY) * 1.1;
    vy = Math.min(vy, -60 - catchUp - shotPower * 120);
  } else if (targetZone === ZONE.blue && y > targetY + 6) {
    vy = Math.min(vy, -45 - shotPower * 80);
  }
}

game.addEventListener("pointerdown", (e) => {
  if (gameOver || state !== "idle") return;
  const p = localPoint(e);
  if (!hitBall(p.x, p.y)) return;
  pointerId = e.pointerId;
  game.setPointerCapture(pointerId);
  state = "aiming";
  samples = [p];
  lastAim = p;
  spinVel = 0;
  hasSpinAng = false;
  lastSpinAng = 0;
});

game.addEventListener("pointermove", (e) => {
  if (state !== "aiming" || e.pointerId !== pointerId) return;
  const p = localPoint(e);
  samples.push(p);
  if (samples.length > 8) samples.shift();

  const ang = Math.atan2(p.y - y, p.x - x);
  const dist = Math.hypot(p.x - x, p.y - y);
  if (hasSpinAng && dist > 10) {
    let dAng = ang - lastSpinAng;
    dAng = Math.atan2(Math.sin(dAng), Math.cos(dAng));
    ballSpin += dAng * 0.45;
    spinVel += dAng * 5.5;
    spinVel = clamp(spinVel, -CURVE_SPIN_MAX, CURVE_SPIN_MAX);
    patX = wrapMesh(patX + dAng * 12);
    patY = wrapMesh(patY + Math.abs(dAng) * 4);
  }
  if (dist > 6) {
    lastSpinAng = ang;
    hasSpinAng = true;
  }

  if (lastAim) {
    const dx = p.x - lastAim.x;
    const dy = p.y - lastAim.y;
    patX = wrapMesh(patX + dx * ROLL_GAIN * 0.45);
    patY = wrapMesh(patY + dy * ROLL_GAIN * 0.45);
    ballSpin += (dx * 0.004 - dy * 0.0025);
  }
  lastAim = p;

  // suivi souple : le doigt peut tourner autour pendant que le ballon suit
  const tx = clamp(p.x, game.clientWidth * SIDE_MARGIN + BALL_SIZE * 0.2, game.clientWidth * (1 - SIDE_MARGIN) - BALL_SIZE * 0.2);
  const ty = clamp(p.y, nearY - 50, Math.min(game.clientHeight - BALL_SIZE * 0.35, nearY + game.clientHeight * 0.28));
  x += (tx - x) * 0.42;
  y += (ty - y) * 0.42;
  render();
});

function endAim(e) {
  if (state !== "aiming" || e.pointerId !== pointerId) return;
  pointerId = null;
  lastAim = null;
  hasSpinAng = false;

  // Fenêtre courte = vraie vitesse du flick (doigt/souris)
  const recent = samples.slice(-4);
  if (recent.length < 2) {
    resetBall(false);
    return;
  }
  const a = recent[0];
  const b = recent[recent.length - 1];
  const dt = Math.max(12, b.t - a.t) / 1000;
  const rawVx = (b.x - a.x) / dt;
  const rawVy = (b.y - a.y) / dt;
  const rawSpeed = Math.hypot(rawVx, rawVy);

  if (rawSpeed < MIN_SPEED || rawVy >= -15) {
    resetBall(false);
    return;
  }

  // vitesse = lancer, avec plafond
  vx = rawVx;
  vy = rawVy;
  const sp = Math.hypot(vx, vy);
  if (sp > FLIGHT_MAX) {
    const k = FLIGHT_MAX / sp;
    vx *= k;
    vy *= k;
  }

  const t = clamp((rawSpeed - MIN_SPEED) / POWER_SPAN, 0, 1);
  shotPower = Math.pow(t, 1.65);
  targetZone = zoneFromPower(shotPower);
  const cell = pickRandomCell(targetZone);
  targetMaskX = cell.mx;
  targetMaskY = cell.my;
  throwStartY = y;

  floorBounceLock = false;
  leftGround = false;
  ignoreFloorUntil = 0;
  const rawSpin = clamp(spinVel, -CURVE_SPIN_MAX, CURVE_SPIN_MAX);
  if (Math.abs(rawSpin) <= CURVE_DEADZONE) {
    flightSpin = 0;
  } else {
    const sign = rawSpin < 0 ? -1 : 1;
    flightSpin = sign * (Math.abs(rawSpin) - CURVE_DEADZONE);
  }
  spinVel = 0;
  render();
  prevBgZone = probeBgZone();
  state = "flying";
  setBallRing(false);
  ballEl.classList.add("is-flying");
}

game.addEventListener("pointerup", endAim);
game.addEventListener("pointercancel", endAim);

function loop(now) {
  if (game.hidden) return;
  const dt = Math.min(0.033, (now - lastT) / 1000);
  lastT = now;

  updateKeeper(dt);

  if (state === "aiming") {
    if (Math.abs(spinVel) > 0.002) {
      ballSpin += spinVel * dt * 0.35;
      patX = wrapMesh(patX + spinVel * dt * 6);
      spinVel *= Math.pow(0.06, dt);
      render();
    }
  }

  if (state === "flying") {
    prevX = x;
    prevY = y;

    // sous-pas si très rapide (évite de sauter la hitbox)
    const speedNow = Math.hypot(vx, vy);
    const steps = Math.max(1, Math.ceil((speedNow * dt) / 18));
    const sdt = dt / steps;
    for (let s = 0; s < steps; s++) {
      vx *= Math.pow(DRAG, sdt * 60);
      vy *= Math.pow(DRAG, sdt * 60);
      if (Math.abs(flightSpin) > 0.015) {
        // arc : on fait pivoter progressivement la direction du tir
        const spd = Math.hypot(vx, vy);
        if (spd > 8) {
          const ang = Math.atan2(vy, vx);
          const turn = flightSpin * CURVE_TURN * sdt;
          const na = ang + turn;
          vx = Math.cos(na) * spd;
          vy = Math.sin(na) * spd;
        }
        ballSpin += flightSpin * sdt * 0.7;
        flightSpin *= Math.pow(0.988, sdt * 60);
      }
      x += vx * sdt;
      y += vy * sdt;
      applyPowerAim(sdt);
      patX = wrapMesh(patX + vx * FLIGHT_ROLL * sdt);
      patY = wrapMesh(patY + vy * FLIGHT_ROLL * sdt);
      render();
      if (isPastSideLimit()) {
        beginSideExit();
        break;
      }
      resolveHits();
      if (state !== "flying") break;
      prevX = x;
      prevY = y;
    }

    if (state === "flying") {
      const w = game.clientWidth;
      const h = game.clientHeight;
      const scale = depthScale(y);
      const r = (BALL_SIZE / 2) * scale;
      const speed = Math.hypot(vx, vy);
      if (isPastSideLimit()) {
        beginSideExit();
      } else if (y < -r || y > h + r || (speed < 35 && y < nearY - 80)) {
        stopOnMiss();
      }
    }
  }

  if (state === "sideOut") {
    updateSideExit(dt);
  }

  if (ghostActive) {
    updateGhostBounce(dt, now);
  }

  requestAnimationFrame(loop);
}