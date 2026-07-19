const startBtn = document.getElementById("startBtn");
const teamPickBtn = document.getElementById("teamPickBtn");
const diffBtn = document.getElementById("diffBtn");
const diffBtnLabel = document.getElementById("diffBtnLabel");
const teamsPanel = document.getElementById("teamsPanel");
const replayBtn = document.getElementById("replayBtn");
const quitBtn = document.getElementById("quitBtn");
const soundBtnMenu = document.getElementById("soundBtnMenu");
const soundBtnGame = document.getElementById("soundBtnGame");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const loseScreen = document.getElementById("loseScreen");
const loseScoreVal = document.getElementById("loseScoreVal");
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
const scoreRecapEl = document.getElementById("scoreRecap");
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
const FLIGHT_MAX = 490;
const POWER_SPAN = 1550;
const MESH_TILE = 46;
const RESET_DELAY = 900;
const ROLL_GAIN = 0.55;
const CURVE_SPIN_MAX = 18;
/** en dessous : pas de déviation (tir quasi droit / spin accidentel) */
const CURVE_DEADZONE = 2.75;
/** ignore les micro-rotations du doigt en visant */
const SPIN_ACCUM_MIN = 0.085;
/** gain par radian tourné autour du ballon */
const SPIN_GAIN = 9.2;
/** décroissance lente pendant la visée (inertie) */
const SPIN_AIM_DECAY = 0.62;
/** rad/s de courbure de trajectoire (arc) */
const CURVE_TURN = 1.45;
/** décroissance du spin en vol (plus haut = plus d’inertie) */
const CURVE_FLIGHT_DECAY = 0.997;
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
const KEEPER_LAUGH = "Gardien_laugh_bas.png";
const KEEPER_HEAD_LAUGH_A = ["Gardien_head_laugh1.png", "Gardien_head_laugh2.png"];
const KEEPER_HEAD_LAUGH_B = ["Gardien_head_laugh3.png", "Gardien_head_laugh4.png"];
const LAUGH_PHASE_SWITCH_MS = 1000;
const KEEPER_WIN_MS = 500;
const KEEPER_FRAME_MS = 270;
const KEEPER_CELEBRATE_MS = 1000;
const KEEPER_ANXIOUS_MS = 500;
const KEEPER_MIN_X = 0.16;
const KEEPER_MAX_X = 0.84;
const KEEPER_SPEED_BASE = 0.14;
const KEEPER_SPEED_PER_GOAL = 0.045;

const DIFF_ORDER = ["easy", "normal", "hard"];
const DIFF_LABELS = {
  easy: "Facile",
  normal: "Normale",
  hard: "Difficile",
};
/** Réglages par difficulté */
const DIFF = {
  easy: {
    keeperMul: 0.72,
    keeperGoalMul: 0.58,
    aimPull: 1.55,
    aimLat: 1.35,
    keeperMinHits: 3,
    keeperForgive: 0.62,
  },
  normal: {
    keeperMul: 1.2,
    keeperGoalMul: 1.15,
    aimPull: 1,
    aimLat: 1,
    keeperMinHits: 1,
    keeperForgive: 0,
  },
  hard: {
    keeperMul: 1.9,
    keeperGoalMul: 1.7,
    aimPull: 1,
    aimLat: 1,
    keeperMinHits: 1,
    keeperForgive: 0,
  },
};

const COOKIE_DAYS = 400;

function setCookie(name, value, days = COOKIE_DAYS) {
  try {
    const maxAge = Math.floor(days * 24 * 60 * 60);
    const encoded = encodeURIComponent(String(value));
    document.cookie = `${name}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (_) {}
}

function getCookie(name) {
  try {
    const prefix = `${name}=`;
    const parts = document.cookie.split(";");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith(prefix)) {
        return decodeURIComponent(part.slice(prefix.length));
      }
    }
  } catch (_) {}
  return null;
}

/** Cookie d’abord, sinon migre depuis localStorage */
function loadSave(key) {
  const fromCookie = getCookie(key);
  if (fromCookie != null && fromCookie !== "") return fromCookie;
  try {
    const fromLs = localStorage.getItem(key);
    if (fromLs != null && fromLs !== "") {
      setCookie(key, fromLs);
      return fromLs;
    }
  } catch (_) {}
  return null;
}

function saveValue(key, value) {
  setCookie(key, value);
  try {
    localStorage.setItem(key, String(value));
  } catch (_) {}
}

let difficulty = "normal";
{
  const d = loadSave("minicup-diff");
  if (DIFF_ORDER.includes(d)) difficulty = d;
}

function diffCfg() {
  return DIFF[difficulty] || DIFF.normal;
}

function syncDiffButton() {
  if (diffBtnLabel) {
    diffBtnLabel.textContent = `Difficulté : ${DIFF_LABELS[difficulty] || "Normale"}`;
  }
}

function cycleDifficulty() {
  const i = DIFF_ORDER.indexOf(difficulty);
  difficulty = DIFF_ORDER[(i + 1) % DIFF_ORDER.length];
  saveValue("minicup-diff", difficulty);
  syncDiffButton();
}
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
let throwStartX = 0;
let throwVx = 0;
let throwVy = 0;
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
let keeperLaughing = false;
let keeperLaughTimer = null;
let keeperLaughPhaseTimer = null;
let loseSeqTimer = null;
let laughHeadFrame = 0;
/** @type {{ left: number, top: number, n: number }[]} */
let goalHits = [];

function clearGoalRecapDots() {
  document.querySelectorAll(".goal-recap-dot").forEach((el) => el.remove());
}

function resetGoalHits() {
  goalHits = [];
  clearGoalRecapDots();
}

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

  if (gameOver || keeperLaughing) {
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

  const cfg = diffCfg();
  let speed = (KEEPER_SPEED_BASE * cfg.keeperMul) + goalCount * (KEEPER_SPEED_PER_GOAL * cfg.keeperGoalMul);
  let shakeX = 0;
  let shakeY = 0;
  if (now < keeperBrakeUntil) {
    speed *= 0.18;
    shakeX = (Math.random() - 0.5) * 4;
    shakeY = (Math.random() - 0.5) * 3.5;
  } else if (keeperEl.classList.contains("is-crowd-shake")) {
    keeperEl.classList.remove("is-crowd-shake");
  }
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
  keeperEl.style.transform = `translateX(calc(-50% + ${shakeX}px)) translateY(${KEEPER_BASE_Y + bobY + shakeY}px) scale(${fx}, 1)`;
}

function bounceKeeperPart(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function bounceKeeperHead() {
  bounceKeeperPart(keeperHeadEl, "is-head-bounce");
}

function bounceKeeperLaugh() {
  bounceKeeperPart(keeperHeadEl, "is-head-bounce");
  bounceKeeperPart(keeperBodyEl, "is-body-bounce");
}

function bounceKeeperSoft() {
  bounceKeeperPart(keeperHeadEl, "is-head-bounce-soft");
  bounceKeeperPart(keeperBodyEl, "is-body-bounce-soft");
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

function playKeeperAnxiousHead(ms = KEEPER_ANXIOUS_MS) {
  if (gameOver || keeperCelebrating) return;
  clearTimeout(keeperHeadTimer);
  setKeeperHead(KEEPER_HEAD_ANXIOUS);
  keeperHeadTimer = setTimeout(() => {
    if (!keeperCelebrating) setKeeperHead(KEEPER_HEAD);
  }, ms);
}

setInterval(() => {
  if (!keeperBodyEl || game.hidden || keeperCelebrating || keeperLaughing || gameOver) return;
  keeperFrame = 1 - keeperFrame;
  keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
}, KEEPER_FRAME_MS);

function clearLoseSequenceTimers() {
  clearTimeout(loseSeqTimer);
  loseSeqTimer = null;
  clearTimeout(keeperLaughPhaseTimer);
  keeperLaughPhaseTimer = null;
  clearInterval(keeperLaughTimer);
  keeperLaughTimer = null;
  keeperLaughing = false;
  stopSfx("laugh");
}

function startLoseSequence() {
  gameOver = true;
  state = "idle";
  recordTeamScore(score);
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  clearTimeout(recoverTimer);
  clearLoseSequenceTimers();
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  keeperCelebrating = false;
  clearTimeout(showGoalMarker._t1);
  clearTimeout(showGoalMarker._t2);
  if (goalMarker) {
    goalMarker.hidden = true;
    goalMarker.style.opacity = "0";
  }

  if (ballEl) {
    ballEl.hidden = true;
    ballEl.style.opacity = "0";
    ballEl.classList.remove("is-flying");
  }
  hideGhost();
  if (loseScreen) loseScreen.hidden = true;

  // Pose pendant le récap selon le score
  keeperLaughing = true;
  laughHeadFrame = 0;
  const fx = keeperFlipScaleX();
  if (keeperEl) {
    keeperEl.style.left = `${keeperX * 100}%`;
    keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y}px) scale(${fx}, 1)`;
  }

  if (score >= 20) {
    // Gros score : Goal_hit + tête anxious, bounce léger
    if (keeperBodyEl) keeperBodyEl.src = KEEPER_HIT;
    if (keeperHeadEl) {
      keeperHeadEl.src = KEEPER_HEAD_ANXIOUS;
      bounceKeeperSoft();
    }
    keeperLaughTimer = setInterval(() => {
      if (!keeperLaughing) return;
      bounceKeeperSoft();
    }, 320);
  } else if (score >= 10) {
    // Bon score : win + souriant (pas de laugh)
    if (keeperBodyEl) keeperBodyEl.src = KEEPER_WIN[0];
    if (keeperHeadEl) {
      keeperHeadEl.src = KEEPER_HEAD_SMILE;
      bounceKeeperHead();
    }
    keeperLaughTimer = setInterval(() => {
      if (!keeperLaughing || !keeperBodyEl) return;
      laughHeadFrame = 1 - laughHeadFrame;
      keeperBodyEl.src = KEEPER_WIN[laughHeadFrame];
      bounceKeeperPart(keeperBodyEl, "is-body-bounce");
    }, KEEPER_WIN_MS);
  } else {
    // Moins de 10 : se moque (laugh1/2 puis laugh3/4)
    let laughPair = KEEPER_HEAD_LAUGH_A;
    playSfx("laugh");
    if (keeperBodyEl) keeperBodyEl.src = KEEPER_LAUGH;
    if (keeperHeadEl) {
      keeperHeadEl.src = laughPair[0];
      bounceKeeperLaugh();
    }
    keeperLaughPhaseTimer = setTimeout(() => {
      if (!keeperLaughing) return;
      laughPair = KEEPER_HEAD_LAUGH_B;
      laughHeadFrame = 0;
      if (keeperHeadEl) {
        keeperHeadEl.src = laughPair[0];
        bounceKeeperLaugh();
      }
    }, LAUGH_PHASE_SWITCH_MS);
    keeperLaughTimer = setInterval(() => {
      if (!keeperLaughing || !keeperHeadEl) return;
      laughHeadFrame = 1 - laughHeadFrame;
      keeperHeadEl.src = laughPair[laughHeadFrame];
      bounceKeeperLaugh();
    }, 220);
  }

  const wrap = document.querySelector(".cage-wrap");
  clearGoalRecapDots();
  const dots = goalHits.map((hit) => {
    const dot = document.createElement("div");
    dot.className = "goal-recap-dot";
    dot.style.left = `${hit.left}px`;
    dot.style.top = `${hit.top}px`;
    if (wrap) wrap.appendChild(dot);
    return dot;
  });

  if (scoreRecapEl) {
    scoreRecapEl.hidden = false;
    scoreRecapEl.textContent = "0";
    scoreRecapEl.classList.remove("is-flash");
  }

  const finalScore = score;
  const startedAt = performance.now();
  const STEP_MS = 200;
  const MIN_MS = 2500;

  let step = 0;
  const endWhenReady = () => {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_MS - elapsed);
    loseSeqTimer = setTimeout(finishLoseSequence, wait);
  };

  const flashNext = () => {
    if (step >= finalScore) {
      endWhenReady();
      return;
    }
    step += 1;
    if (scoreRecapEl) {
      scoreRecapEl.textContent = String(step);
      scoreRecapEl.classList.remove("is-flash");
      void scoreRecapEl.offsetWidth;
      scoreRecapEl.classList.add("is-flash");
    }
    dots.forEach((d, i) => {
      d.classList.toggle("is-lit", i < step);
      d.classList.remove("is-impact");
    });
    const lit = dots[step - 1];
    if (lit) {
      void lit.offsetWidth;
      lit.classList.add("is-impact");
    }
    if (game) {
      game.classList.remove("is-recap-shake");
      void game.offsetWidth;
      game.classList.add("is-recap-shake");
    }
    loseSeqTimer = setTimeout(flashNext, STEP_MS);
  };

  if (finalScore <= 0) {
    if (scoreRecapEl) {
      scoreRecapEl.textContent = "0";
      scoreRecapEl.classList.add("is-flash");
    }
    loseSeqTimer = setTimeout(finishLoseSequence, MIN_MS);
  } else {
    flashNext();
  }
}

function finishLoseSequence() {
  clearLoseSequenceTimers();
  clearGoalRecapDots();
  if (game) game.classList.remove("is-recap-shake");
  if (scoreRecapEl) {
    scoreRecapEl.hidden = true;
    scoreRecapEl.classList.remove("is-flash");
  }
  if (scoreValEl) scoreValEl.textContent = String(score);
  showLoseMenu();
}

function showLoseMenu() {
  clearInterval(keeperWinTimer);
  keeperWinFrame = 0;
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_WIN[0];
  if (keeperHeadEl) {
    keeperHeadEl.src = KEEPER_HEAD_SMILE;
    bounceKeeperHead();
  }
  keeperWinTimer = setInterval(() => {
    if (!gameOver || !keeperBodyEl) return;
    keeperWinFrame = 1 - keeperWinFrame;
    keeperBodyEl.src = KEEPER_WIN[keeperWinFrame];
  }, KEEPER_WIN_MS);
  if (ballEl) ballEl.hidden = true;
  if (ghostEl) ghostEl.hidden = true;
  if (loseScoreVal) loseScoreVal.textContent = String(score);
  if (loseScreen) loseScreen.hidden = false;
  playSfx("lose");
}

function showGameOver() {
  startLoseSequence();
}

function replayGame() {
  gameOver = false;
  clearLoseSequenceTimers();
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  resetGoalHits();
  if (scoreRecapEl) {
    scoreRecapEl.hidden = true;
    scoreRecapEl.classList.remove("is-flash");
  }
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
  recordTeamScore(score);
  clearLoseSequenceTimers();
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  keeperCelebrating = false;
  resetGoalHits();
  if (scoreRecapEl) {
    scoreRecapEl.hidden = true;
    scoreRecapEl.classList.remove("is-flash");
  }
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
  btn.addEventListener("pointerdown", () => {
    btn.classList.add("is-pressed");
    playUiClick();
  });
  btn.addEventListener("pointerup", () => btn.classList.remove("is-pressed"));
  btn.addEventListener("pointerleave", () => btn.classList.remove("is-pressed"));
}

let soundOn = true;
{
  const s = loadSave("minicup-sound");
  if (s != null) soundOn = s !== "0";
}

const sfx = {
  kick: new Audio("kick.mp3"),
  filet: new Audio("filet.mp3"),
  lose: new Audio("lose.mp3"),
  laugh: new Audio("laugh.mp3"),
  stop: new Audio("stop.mp3"),
  win1: new Audio("win1.mp3"),
  win2: new Audio("win2.mp3"),
  win3: new Audio("win3.mp3"),
  win4: new Audio("win4.mp3"),
  metal1: new Audio("metal1.mp3"),
  metal2: new Audio("metal2.mp3"),
};
Object.values(sfx).forEach((a) => {
  a.preload = "metadata";
  a.volume = 0.85;
});
sfx.win1.volume = 0.38;
sfx.win2.volume = 0.38;
sfx.win3.volume = 0.38;
sfx.win4.volume = 0.38;

function playSfx(name) {
  if (!soundOn) return;
  const a = sfx[name];
  if (!a) return;
  try {
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (_) {}
}

function stopSfx(name) {
  const a = sfx[name];
  if (!a) return;
  try {
    a.pause();
    a.currentTime = 0;
  } catch (_) {}
}

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Clic UI basique (synthèse) */
function playUiClick() {
  if (!soundOn) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.045);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  } catch (_) {}
}

function syncSoundButtons() {
  [soundBtnMenu, soundBtnGame].forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle("is-muted", !soundOn);
    btn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    btn.setAttribute("aria-label", soundOn ? "Couper le son" : "Activer le son");
    const on = btn.querySelector(".sound-btn__on");
    const off = btn.querySelector(".sound-btn__off");
    if (on) on.hidden = !soundOn;
    if (off) off.hidden = soundOn;
  });
}

function toggleSound() {
  soundOn = !soundOn;
  saveValue("minicup-sound", soundOn ? "1" : "0");
  syncSoundButtons();
}

syncSoundButtons();
[soundBtnMenu, soundBtnGame].forEach((btn) => {
  if (!btn) return;
  bindPress(btn);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });
});

let selectedTeam = "fr";

const TEAM_IDS = ["fr", "ma", "es", "ar", "dz", "it", "us", "en", "no"];
const TEAM_SCORES_KEY = "minicup-team-scores";

function loadTeamScores() {
  try {
    const raw = loadSave(TEAM_SCORES_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch (_) {
    return {};
  }
}

function saveTeamScores(data) {
  saveValue(TEAM_SCORES_KEY, JSON.stringify(data));
}

let teamBestScores = loadTeamScores();

function getTeamBest(id) {
  const n = Number(teamBestScores[id]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function recordTeamScore(value) {
  const id = selectedTeam || "fr";
  const v = Math.max(0, Math.floor(value || 0));
  if (v <= getTeamBest(id)) return false;
  teamBestScores[id] = v;
  saveTeamScores(teamBestScores);
  renderTeamScores();
  return true;
}

function renderTeamScores() {
  TEAM_IDS.forEach((id) => {
    const el = document.querySelector(`[data-team-score="${id}"]`);
    if (el) el.textContent = String(getTeamBest(id));
  });
}

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
  saveValue("minicup-team", selectedTeam);
  updateHudTeamFlag();
  renderTeamScores();
  if (teamsPanel) teamsPanel.hidden = true;
}

function toggleTeamsPanel() {
  if (!teamsPanel) return;
  if (teamsPanel.hidden) renderTeamScores();
  teamsPanel.hidden = !teamsPanel.hidden;
}

const teamGrid = document.getElementById("teamGrid");
if (teamGrid) {
  teamGrid.querySelectorAll(".team").forEach((btn) => {
    bindPress(btn);
    btn.addEventListener("click", () => selectTeam(btn));
  });
}

{
  const savedTeam = loadSave("minicup-team");
  if (savedTeam && TEAM_IDS.includes(savedTeam)) {
    selectedTeam = savedTeam;
    const btn = teamGrid && teamGrid.querySelector(`.team[data-team="${savedTeam}"]`);
    if (btn) {
      teamGrid.querySelectorAll(".team").forEach((el) => {
        el.classList.remove("is-selected");
        el.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-selected", "true");
    }
  }
}
renderTeamScores();
updateHudTeamFlag();

bindPress(startBtn);
bindPress(diffBtn);
bindPress(teamPickBtn);
bindPress(replayBtn);
bindPress(quitBtn);

syncDiffButton();
if (diffBtn) {
  diffBtn.addEventListener("click", () => cycleDifficulty());
}

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
    resetGoalHits();
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
  recordTeamScore(score);
}

function stopOnGoal(zone) {
  setBallRing(false);
  bounceCage();
  addScore();
  showGoalMarker();
  playKeeperAnxiousHead();
  frenzyPions();
  playSfx("filet");
  playSfx(`win${1 + Math.floor(Math.random() * 4)}`);
  beginGroundBounce(true, true);
}

let pionWrapEl = null;
let crowdHelpUsed = false;
let keeperBrakeUntil = 0;

function tryCrowdHelp(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (state !== "flying" || crowdHelpUsed || gameOver) return;
  crowdHelpUsed = true;
  playUiClick();
  // ~1 fois sur 5
  if (Math.random() >= 0.2) return;
  bounceCage();
  keeperBrakeUntil = performance.now() + 300;
  playKeeperAnxiousHead(300);
  if (keeperEl) {
    keeperEl.classList.remove("is-crowd-shake");
    void keeperEl.offsetWidth;
    keeperEl.classList.add("is-crowd-shake");
  }
  frenzyPions();
}

function buildPions() {
  const wrap = document.getElementById("pionsEl") || document.querySelector(".pions");
  if (!wrap) return;
  pionWrapEl = wrap;
  const srcs = [
    "pion_01.png", "pion_02.png", "pion_03.png",
    "pion_04.png", "pion_05.png", "pion_06.png",
  ];
  wrap.innerHTML = "";
  const count = 32;
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
    img.style.setProperty("--period", `${period.toFixed(2)}s`);
    img.style.setProperty("--amp", `${amp}px`);
    img.style.setProperty("--delay", `${(-Math.random() * period).toFixed(2)}s`);
    img.addEventListener("pointerdown", tryCrowdHelp);
    wrap.appendChild(img);
  }
}

function frenzyPions() {
  if (!pionWrapEl) return;
  pionWrapEl.classList.add("is-frenzy");
  clearTimeout(frenzyPions._t);
  frenzyPions._t = setTimeout(() => {
    if (pionWrapEl) pionWrapEl.classList.remove("is-frenzy");
  }, 500);
}

function stopOnGreen() {
  setBallRing(false);
  bounceCage();
  playSfx(Math.random() < 0.5 ? "metal1" : "metal2");
  loseLife();
  beginGroundBounce(true);
}

function stopOnKeeper() {
  setBallRing(false);
  playKeeperSaveAnim();
  playSfx("stop");
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

/** Fantôme : saut + sol 1s ; balle joueur revient (immédiat si but) */
function beginGroundBounce(fromCage, recoverNow = false) {
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
  if (recoverNow) {
    clearTimeout(recoverTimer);
    resetBall(false);
  } else {
    scheduleRecover();
  }
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

/** Rects layout figés 1×/frame — évite le thrashing pendant les sous-pas */
const hitRects = { game: null, cage: null, bg: null, keeper: null };

function syncHitRects() {
  hitRects.game = game.getBoundingClientRect();
  hitRects.cage = hitboxCageImg.getBoundingClientRect();
  hitRects.bg = hitboxBgImg.getBoundingClientRect();
  hitRects.keeper = keeperEl ? keeperEl.getBoundingClientRect() : null;
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
  const cage = hitRects.cage || hitboxCageImg.getBoundingClientRect();
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
  const g = hitRects.game || game.getBoundingClientRect();
  return probeCageAtScreen(g.left + x, g.top + y);
}

/** Balayage prev→current pour ne pas sauter la zone à haute vitesse */
function probeCageSwept() {
  const g = hitRects.game || game.getBoundingClientRect();
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 5));
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
  const rect = hitRects.keeper || (keeperEl && keeperEl.getBoundingClientRect());
  if (!rect || rect.width < 2 || rect.height < 2) return false;
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
  const cfg = diffCfg();
  if (hits < cfg.keeperMinHits) return false;
  // Facile : contact léger parfois ignoré → ça peut rentrer quand même
  if (cfg.keeperForgive > 0 && hits <= 2 && Math.random() < cfg.keeperForgive) {
    return false;
  }
  return true;
}

function probeKeeperSwept() {
  const g = hitRects.game || game.getBoundingClientRect();
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = prevX + (x - prevX) * t;
    const sy = prevY + (y - prevY) * t;
    if (probeKeeperAtScreen(g.left + sx, g.top + sy)) return true;
  }
  return false;
}

function probeBgZone() {
  const g = hitRects.game || game.getBoundingClientRect();
  const bg = hitRects.bg || hitboxBgImg.getBoundingClientRect();
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
  render();
  const ball = ballEl.getBoundingClientRect();
  const wrap = document.querySelector(".cage-wrap").getBoundingClientRect();
  const size = Math.max(36, ball.width * 1.05);
  const left = ball.left - wrap.left + ball.width / 2;
  const top = ball.top - wrap.top + ball.height / 2;
  goalHits.push({ left, top, n: score });
  goalMarker.hidden = false;
  goalMarker.classList.remove("is-fade");
  goalMarker.textContent = String(score);
  goalMarker.style.width = `${size}px`;
  goalMarker.style.height = `${size}px`;
  goalMarker.style.fontSize = `${Math.max(16, size * 0.42)}px`;
  goalMarker.style.left = `${left}px`;
  goalMarker.style.top = `${top}px`;
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

/** Guide vers une cellule — tir diagonal = peu / pas d’aimant X vers la cage */
function applyPowerAim(dt) {
  const g = hitRects.game || game.getBoundingClientRect();
  const cage = hitRects.cage || hitboxCageImg.getBoundingClientRect();
  if (cage.height < 2) return;
  const cfg = diffCfg();

  const targetX = (cage.left - g.left) + ((targetMaskX + 0.5) / CAGE_MASK_W) * cage.width;
  const targetY = (cage.top - g.top) + ((targetMaskY + 0.5) / CAGE_MASK_H) * cage.height;

  const denom = Math.max(40, throwStartY - targetY);
  const progress = clamp((throwStartY - y) / denom, 0, 1);
  const boost = targetZone === ZONE.violet ? 1.15 : targetZone === ZONE.blue ? 0.85 : 0.65;
  const pullY = (0.04 + progress * progress * (0.35 + shotPower * 0.45)) * boost * cfg.aimPull;
  const spinAmt = Math.abs(clamp(flightSpin, -CURVE_SPIN_MAX, CURVE_SPIN_MAX));
  const pullX = (0.03 + progress * progress * 0.28) * (0.5 + shotPower * 0.3) * (1 - Math.min(0.7, spinAmt * 0.14)) * cfg.aimPull;

  // part latérale du lancer (0 = droit, 1 = très diagonal)
  const lat = Math.abs(throwVx) / (Math.abs(throwVx) + Math.abs(throwVy) + 1);
  const latScale = 2.1 / Math.max(0.35, cfg.aimLat);
  const cageMagnetX = 1 - clamp(lat * latScale, 0, 0.95);
  // trajectoire naturelle en X selon l’angle de tir
  const naturalX = throwStartX + throwVx * ((throwStartY - y) / Math.max(40, -throwVy));
  const aimX = targetX * cageMagnetX + naturalX * (1 - cageMagnetX);

  x += (aimX - x) * Math.min(1, pullX * dt * 6) * cageMagnetX;
  y += (targetY - y) * Math.min(1, pullY * dt * (7 + shotPower * 6) * (1 - lat * 0.35));

  const latGate = difficulty === "easy" ? 0.55 : 0.45;
  if (targetZone === ZONE.violet && y > targetY + 4 && lat < latGate) {
    const catchUp = (y - targetY) * 1.1;
    vy = Math.min(vy, -60 - catchUp - shotPower * 120);
  } else if (targetZone === ZONE.blue && y > targetY + 6 && lat < latGate) {
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
  // Spin courbe = doigt qui tourne autour du ballon (pas le simple drag de visée)
  if (hasSpinAng && dist > 16) {
    let dAng = ang - lastSpinAng;
    dAng = Math.atan2(Math.sin(dAng), Math.cos(dAng));
    if (Math.abs(dAng) >= SPIN_ACCUM_MIN) {
      ballSpin += dAng * 0.85;
      spinVel += dAng * SPIN_GAIN;
      spinVel = clamp(spinVel, -CURVE_SPIN_MAX, CURVE_SPIN_MAX);
      patX = wrapMesh(patX + dAng * 14);
      patY = wrapMesh(patY + Math.abs(dAng) * 5);
    }
  }
  if (dist > 10) {
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
  shotPower = Math.pow(t, 1.45);
  targetZone = zoneFromPower(shotPower);
  const cell = pickRandomCell(targetZone);
  targetMaskX = cell.mx;
  targetMaskY = cell.my;
  throwStartY = y;
  throwStartX = x;
  throwVx = vx;
  throwVy = vy;

  floorBounceLock = false;
  leftGround = false;
  ignoreFloorUntil = 0;
  const rawSpin = clamp(spinVel, -CURVE_SPIN_MAX, CURVE_SPIN_MAX);
  if (Math.abs(rawSpin) <= CURVE_DEADZONE) {
    flightSpin = 0;
  } else {
    const sign = rawSpin < 0 ? -1 : 1;
    const excess = Math.abs(rawSpin) - CURVE_DEADZONE;
    // plusieurs tours → courbe nettement plus forte (rampe non linéaire)
    flightSpin = sign * (excess + excess * excess * 0.085);
  }
  spinVel = 0;
  crowdHelpUsed = false;
  keeperBrakeUntil = 0;
  if (keeperEl) keeperEl.classList.remove("is-crowd-shake");
  render();
  prevBgZone = probeBgZone();
  state = "flying";
  setBallRing(false);
  ballEl.classList.add("is-flying");
  playSfx("kick");
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
      ballSpin += spinVel * dt * 0.9;
      patX = wrapMesh(patX + spinVel * dt * 9);
      spinVel *= Math.pow(SPIN_AIM_DECAY, dt);
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
    syncHitRects();
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
        ballSpin += flightSpin * sdt * 1.55;
        flightSpin *= Math.pow(CURVE_FLIGHT_DECAY, sdt * 60);
      }
      x += vx * sdt;
      y += vy * sdt;
      applyPowerAim(sdt);
      patX = wrapMesh(patX + vx * FLIGHT_ROLL * sdt);
      patY = wrapMesh(patY + vy * FLIGHT_ROLL * sdt);
      if (isPastSideLimit()) {
        beginSideExit();
        break;
      }
      resolveHits();
      if (state !== "flying") break;
      prevX = x;
      prevY = y;
    }
    render();

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