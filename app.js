const startBtn = document.getElementById("startBtn");
const teamPickBtn = document.getElementById("teamPickBtn");
const minigamesBtn = document.getElementById("minigamesBtn");
const minigamesPanel = document.getElementById("minigamesPanel");
const diffPanel = document.getElementById("diffPanel");
const diffSlider = document.getElementById("diffSlider");
const diffSliderLabel = document.getElementById("diffSliderLabel");
const diffPlayBtn = document.getElementById("diffPlayBtn");
const teamsPanel = document.getElementById("teamsPanel");
const replayBtn = document.getElementById("replayBtn");
const quitBtn = document.getElementById("quitBtn");
const soundBtnMenu = document.getElementById("soundBtnMenu");
const soundBtnGame = document.getElementById("soundBtnGame");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gameFlip = document.getElementById("gameFlip");
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
const ttHud = document.getElementById("ttHud");
const ttTimerEl = document.getElementById("ttTimer");
const ttGoalsEl = document.getElementById("ttGoals");
const ttBanner = document.getElementById("ttBanner");
const duelHud = document.getElementById("duelHud");
const duelP1ScoreEl = document.getElementById("duelP1Score");
const duelP2ScoreEl = document.getElementById("duelP2Score");
const duelP1LivesEl = document.getElementById("duelP1Lives");
const duelP2LivesEl = document.getElementById("duelP2Lives");
const minigameTimeTrialBtn = document.getElementById("minigameTimeTrial");
const minigameDuelBtn = document.getElementById("minigameDuel");
const hitboxBgImg = document.getElementById("hitboxBg");
const hitboxCageImg = document.getElementById("hitboxCage");

const DUEL_LIVES = 3;
const DUEL_GOAL_WIN = 5;

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
const CURVE_SPIN_MAX = 7;
/** en dessous : pas de déviation (tir quasi droit / spin accidentel) */
const CURVE_DEADZONE = 2.75;
/** ignore les micro-rotations du doigt en visant */
const SPIN_ACCUM_MIN = 0.085;
/** gain par radian tourné autour du ballon */
const SPIN_GAIN = 3.2;
/** décroissance pendant la visée (un peu d’inertie, pas trop) */
const SPIN_AIM_DECAY = 0.28;
/** rad/s de courbure de trajectoire (arc) */
const CURVE_TURN = 0.85;
/** décroissance du spin en vol */
const CURVE_FLIGHT_DECAY = 0.993;
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

function syncDiffSlider() {
  const idx = Math.max(0, DIFF_ORDER.indexOf(difficulty));
  if (diffSlider) {
    diffSlider.value = String(idx);
    diffSlider.setAttribute("aria-valuenow", String(idx));
  }
  if (diffSliderLabel) {
    diffSliderLabel.textContent = DIFF_LABELS[difficulty] || "Normale";
  }
}

function applyDiffSlider(save) {
  if (!diffSlider) return;
  const idx = clamp(Math.round(Number(diffSlider.value) || 0), 0, DIFF_ORDER.length - 1);
  difficulty = DIFF_ORDER[idx];
  if (diffSlider) diffSlider.setAttribute("aria-valuenow", String(idx));
  if (diffSliderLabel) {
    diffSliderLabel.textContent = DIFF_LABELS[difficulty] || "Normale";
  }
  if (save) saveValue("minicup-diff", difficulty);
}

function openDiffPanel() {
  warmAudio();
  closeMinigamesPanel();
  if (teamsPanel) teamsPanel.hidden = true;
  syncDiffSlider();
  if (diffPanel) diffPanel.hidden = false;
}

function closeDiffPanel() {
  if (diffPanel) diffPanel.hidden = true;
}

function openMinigamesPanel() {
  playUiClick();
  closeDiffPanel();
  if (teamsPanel) teamsPanel.hidden = true;
  if (minigamesPanel) {
    minigamesPanel.hidden = !minigamesPanel.hidden;
  }
}

function closeMinigamesPanel() {
  if (minigamesPanel) minigamesPanel.hidden = true;
}

function beginMatch() {
  playMode = "classic";
  applyDiffSlider(true);
  closeDiffPanel();
  closeMinigamesPanel();
  if (teamsPanel) teamsPanel.hidden = true;
  menu.hidden = true;
  game.hidden = false;
  updateHudTeamFlag();
  syncModeHud();
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
    ensureLoop();
  });
}

/** Manches chrono infinies — 3 premières fixes, ensuite procédural */
function makeTtRound(index) {
  const jitter = (base, span) => {
    const d = Math.floor(Math.random() * (span * 2 + 1)) - span;
    return Math.max(5, base + d);
  };
  if (index === 0) return { time: jitter(30, 1), goals: 10, diff: "normal" };
  if (index === 1) return { time: jitter(25, 1), goals: 10, diff: "normal" };
  if (index === 2) return { time: jitter(10, 0), goals: 5, diff: "hard" };

  // Manche 4+ : plus court, buts variables, gardien difficile
  const baseTime = Math.max(6, 13 - Math.floor((index - 2) * 0.7));
  let time = jitter(baseTime, 1);
  let goals = 5 + Math.floor(Math.random() * 6); // 5–10
  if (time <= 8) goals = Math.min(goals, 6);
  if (time >= 11 && Math.random() < 0.35) goals = Math.max(goals, 8);
  // parfois une manche “sprint”
  if (Math.random() < 0.2) {
    time = jitter(7, 1);
    goals = 4 + Math.floor(Math.random() * 3);
  }
  return { time, goals, diff: "hard" };
}

function ensureTtRound(index) {
  while (ttRounds.length <= index) {
    ttRounds.push(makeTtRound(ttRounds.length));
  }
  return ttRounds[index];
}

function beginTimeTrial() {
  warmAudio();
  playMode = "timeTrial";
  ttSavedDiff = difficulty;
  ttRounds = [];
  ttRoundIndex = 0;
  ttPaused = false;
  closeMinigamesPanel();
  closeDiffPanel();
  if (teamsPanel) teamsPanel.hidden = true;
  menu.hidden = true;
  game.hidden = false;
  updateHudTeamFlag();
  syncModeHud();
  requestAnimationFrame(() => {
    layout();
    buildPions();
    score = 0;
    goalCount = 0;
    lives = 3;
    gameOver = false;
    resetGoalHits();
    startTtRound(true);
    ensureLoop();
  });
}

function syncModeHud() {
  if (livesEl) livesEl.hidden = playMode === "duel" || playMode === "timeTrial";
  if (ttHud) ttHud.hidden = playMode !== "timeTrial";
  if (duelHud) duelHud.hidden = playMode !== "duel";
  if (playMode === "timeTrial" && livesEl) livesEl.hidden = false;
  clearDuelChrome();
  if (playMode === "duel") applyDuelChrome();
}

function showTtBanner(text, ms = 1100) {
  if (!ttBanner) return;
  ttBanner.hidden = false;
  ttBanner.textContent = text;
  clearTimeout(showTtBanner._t);
  showTtBanner._t = setTimeout(() => {
    if (ttBanner) ttBanner.hidden = true;
  }, ms);
}

function startTtRound(isFirst) {
  const r = ensureTtRound(ttRoundIndex);
  if (!r) return;
  difficulty = r.diff;
  ttTimeLeft = r.time;
  ttGoalsHave = 0;
  goalCount = 0;
  lives = 3;
  ttPaused = false;
  keeperX = 0.42 + Math.random() * 0.16;
  keeperDir = Math.random() < 0.5 ? -1 : 1;
  if (ballEl) {
    ballEl.hidden = false;
    ballEl.style.opacity = "1";
  }
  hideGhost();
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
  setKeeperHead(KEEPER_HEAD, false);
  resetBall(false);
  updateHud();
  const label = `Manche ${ttRoundIndex + 1} — ${r.goals} buts · ${r.time}s`;
  showTtBanner(label, isFirst ? 1400 : 1200);
}

function completeTtRound() {
  if (playMode !== "timeTrial" || ttPaused || gameOver) return;
  ttPaused = true;
  state = "idle";
  vx = 0;
  vy = 0;
  showTtBanner("Manche suivante !", 900);
  clearTimeout(completeTtRound._t);
  completeTtRound._t = setTimeout(() => {
    if (playMode !== "timeTrial" || gameOver) return;
    ttRoundIndex += 1;
    startTtRound(false);
  }, 1000);
}

function finishTimeTrial(won) {
  gameOver = true;
  ttPaused = true;
  state = "idle";
  clearTimeout(completeTtRound._t);
  clearTimeout(showTtBanner._t);
  if (ttBanner) ttBanner.hidden = true;
  if (ballEl) {
    ballEl.hidden = true;
    ballEl.style.opacity = "0";
  }
  hideGhost();
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  keeperWinFrame = 0;
  if (keeperBodyEl) keeperBodyEl.src = won ? KEEPER_HIT : KEEPER_WIN[0];
  if (keeperHeadEl) {
    keeperHeadEl.src = won ? KEEPER_HEAD_ANXIOUS : KEEPER_HEAD_SMILE;
  }
  if (!won) {
    keeperWinTimer = setInterval(() => {
      if (!gameOver || !keeperBodyEl) return;
      keeperWinFrame = 1 - keeperWinFrame;
      keeperBodyEl.src = KEEPER_WIN[keeperWinFrame];
    }, KEEPER_WIN_MS);
  }
  if (loseScoreVal) loseScoreVal.textContent = String(score);
  if (loseScreen) loseScreen.hidden = false;
  playSfx(won ? `win${1 + Math.floor(Math.random() * 4)}` : "lose");
}

function updateTimeTrial(dt) {
  if (playMode !== "timeTrial" || gameOver || ttPaused) return;
  ttTimeLeft -= dt;
  if (ttTimerEl) {
    const t = Math.max(0, ttTimeLeft);
    ttTimerEl.textContent = t.toFixed(1);
    ttTimerEl.classList.toggle("is-low", t <= 5);
  }
  if (ttTimeLeft <= 0) {
    ttTimeLeft = 0;
    finishTimeTrial(false);
  }
}

function fillDuelLives(el, n) {
  if (!el) return;
  el.innerHTML = "";
  for (let i = 0; i < DUEL_LIVES; i++) {
    const img = document.createElement("img");
    img.className = "hud-ball" + (i < n ? " is-on" : "");
    img.src = "ball.png";
    img.alt = "";
    img.draggable = false;
    el.appendChild(img);
  }
}

function clearDuelChrome() {
  if (!game) return;
  game.classList.remove("is-duel-p1", "is-duel-p2");
}

function applyDuelChrome() {
  if (!game || playMode !== "duel") return;
  clearDuelChrome();
  game.classList.add(duelTurn === 1 ? "is-duel-p1" : "is-duel-p2");
}

function beginDuel() {
  warmAudio();
  playMode = "duel";
  duelTurn = 1;
  duelPaused = false;
  duelP1 = { goals: 0, lives: DUEL_LIVES };
  duelP2 = { goals: 0, lives: DUEL_LIVES };
  difficulty = "normal";
  closeMinigamesPanel();
  closeDiffPanel();
  if (teamsPanel) teamsPanel.hidden = true;
  menu.hidden = true;
  game.hidden = false;
  updateHudTeamFlag();
  syncModeHud();
  requestAnimationFrame(() => {
    layout();
    buildPions();
    score = 0;
    goalCount = 0;
    lives = DUEL_LIVES;
    gameOver = false;
    resetGoalHits();
    applyDuelChrome();
    updateHud();
    resetBall(false);
    showTtBanner("Manche — Joueur 1", 1400);
    ensureLoop();
  });
}

function currentDuelPlayer() {
  return duelTurn === 1 ? duelP1 : duelP2;
}

function scheduleDuelPass() {
  if (playMode !== "duel" || gameOver || duelPaused) return;
  duelPaused = true;
  clearTimeout(scheduleDuelPass._t);
  scheduleDuelPass._t = setTimeout(() => {
    if (playMode !== "duel" || gameOver) return;
    duelTurn = duelTurn === 1 ? 2 : 1;
    applyDuelChrome();
    updateHud();
    if (ballEl) {
      ballEl.hidden = false;
      ballEl.style.opacity = "1";
    }
    hideGhost();
    resetBall(false);
    showTtBanner(duelTurn === 1 ? "Manche — Joueur 1" : "Manche — Joueur 2", 1500);
    clearTimeout(scheduleDuelPass._ready);
    scheduleDuelPass._ready = setTimeout(() => {
      duelPaused = false;
    }, 700);
  }, 850);
}

function finishDuel(winner) {
  gameOver = true;
  duelPaused = true;
  state = "idle";
  clearTimeout(scheduleDuelPass._t);
  clearTimeout(scheduleDuelPass._ready);
  clearTimeout(showTtBanner._t);
  if (ttBanner) ttBanner.hidden = true;
  if (ballEl) {
    ballEl.hidden = true;
    ballEl.style.opacity = "0";
  }
  hideGhost();
  applyDuelChrome();
  clearInterval(keeperWinTimer);
  keeperWinTimer = null;
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_WIN[0];
  if (keeperHeadEl) keeperHeadEl.src = KEEPER_HEAD_SMILE;
  keeperWinTimer = setInterval(() => {
    if (!gameOver || !keeperBodyEl) return;
    keeperWinFrame = 1 - keeperWinFrame;
    keeperBodyEl.src = KEEPER_WIN[keeperWinFrame];
  }, KEEPER_WIN_MS);
  if (loseScoreVal) {
    loseScoreVal.textContent = `J${winner}  ${duelP1.goals}-${duelP2.goals}`;
  }
  if (loseScreen) loseScreen.hidden = false;
  playSfx(`win${1 + Math.floor(Math.random() * 4)}`);
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
let loopOn = false;
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
let playMode = "classic";
let ttRoundIndex = 0;
/** @type {{ time: number, goals: number, diff: string }[]} */
let ttRounds = [];
let ttTimeLeft = 0;
let ttGoalsHave = 0;
let ttPaused = false;
let ttSavedDiff = "normal";
let duelTurn = 1;
let duelPaused = false;
let duelP1 = { goals: 0, lives: DUEL_LIVES };
let duelP2 = { goals: 0, lives: DUEL_LIVES };
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
  requestAnimationFrame(() => {
    el.classList.add(className);
  });
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

function setKeeperHead(src, withBounce = true) {
  if (!keeperHeadEl) return;
  if (keeperHeadEl.getAttribute("src") !== src) {
    keeperHeadEl.src = src;
  }
  if (withBounce) bounceKeeperHead();
}

function playKeeperSaveAnim() {
  if (gameOver) return;
  keeperCelebrating = true;
  keeperBounceAt = performance.now();
  clearTimeout(keeperCelebrateTimer);
  clearTimeout(keeperHeadTimer);
  if (keeperBodyEl) keeperBodyEl.src = KEEPER_HIT;
  setKeeperHead(KEEPER_HEAD_SMILE, false);
  const fx = keeperFlipScaleX();
  keeperEl.style.transform = `translateX(-50%) translateY(${KEEPER_BASE_Y}px) scale(${fx}, 1)`;

  keeperCelebrateTimer = setTimeout(() => {
    keeperCelebrating = false;
    if (keeperBodyEl) keeperBodyEl.src = KEEPER_FRAMES[keeperFrame];
    setKeeperHead(KEEPER_HEAD, false);
  }, KEEPER_CELEBRATE_MS);
}

function playKeeperAnxiousHead(ms = KEEPER_ANXIOUS_MS, withBounce = false) {
  if (gameOver || keeperCelebrating) return;
  clearTimeout(keeperHeadTimer);
  setKeeperHead(KEEPER_HEAD_ANXIOUS, withBounce);
  keeperHeadTimer = setTimeout(() => {
    if (!keeperCelebrating) setKeeperHead(KEEPER_HEAD, false);
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
  flushTeamScores();
  renderTeamScores();
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
  clearTimeout(completeTtRound._t);
  clearTimeout(showTtBanner._t);
  if (ttBanner) ttBanner.hidden = true;
  resetGoalHits();
  if (scoreRecapEl) {
    scoreRecapEl.hidden = true;
    scoreRecapEl.classList.remove("is-flash");
  }
  if (loseScreen) loseScreen.hidden = true;
  if (playMode === "timeTrial") {
    beginTimeTrial();
    return;
  }
  if (playMode === "duel") {
    beginDuel();
    return;
  }
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
  if (playMode === "classic") {
    recordTeamScore(score);
    flushTeamScores();
    renderTeamScores();
  } else {
    difficulty = ttSavedDiff;
    const saved = loadSave("minicup-diff");
    if (DIFF_ORDER.includes(saved)) difficulty = saved;
  }
  playMode = "classic";
  ttPaused = false;
  duelPaused = false;
  clearTimeout(completeTtRound._t);
  clearTimeout(showTtBanner._t);
  clearTimeout(scheduleDuelPass._t);
  clearTimeout(scheduleDuelPass._ready);
  if (ttBanner) ttBanner.hidden = true;
  clearDuelChrome();
  syncModeHud();
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
  closeDiffPanel();
  closeMinigamesPanel();
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

const sfxUrls = {
  kick: "kick.mp3",
  filet: "filet.mp3",
  lose: "lose.mp3",
  laugh: "laugh.mp3",
  stop: "stop.mp3",
  win1: "win1.mp3",
  win2: "win2.mp3",
  win3: "win3.mp3",
  win4: "win4.mp3",
  metal1: "metal1.mp3",
  metal2: "metal2.mp3",
};
/** @type {Record<string, AudioBuffer>} */
const sfxBuf = {};
/** @type {AudioBufferSourceNode | null} */
let laughSource = null;
let audioWarmed = false;

const sfxVol = {
  win1: 0.38,
  win2: 0.38,
  win3: 0.38,
  win4: 0.38,
};

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

function warmAudio() {
  if (audioWarmed) return;
  audioWarmed = true;
  const ctx = getAudioCtx();
  if (!ctx) return;
  Object.entries(sfxUrls).forEach(([name, url]) => {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab.slice(0)))
      .then((buf) => {
        sfxBuf[name] = buf;
      })
      .catch(() => {});
  });
  // Précharge images gardien (évite decode au but)
  [
    KEEPER_HEAD,
    KEEPER_HEAD_SMILE,
    KEEPER_HEAD_ANXIOUS,
    KEEPER_HIT,
    KEEPER_FRAMES[0],
    KEEPER_FRAMES[1],
    KEEPER_WIN[0],
    KEEPER_WIN[1],
    KEEPER_LAUGH,
    ...KEEPER_HEAD_LAUGH_A,
    ...KEEPER_HEAD_LAUGH_B,
  ].forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}

function playSfx(name) {
  if (!soundOn) return;
  const ctx = getAudioCtx();
  const buf = sfxBuf[name];
  if (ctx && buf) {
    try {
      if (name === "laugh" && laughSource) {
        try {
          laughSource.stop();
        } catch (_) {}
        laughSource = null;
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = sfxVol[name] != null ? sfxVol[name] : 0.85;
      src.buffer = buf;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(0);
      if (name === "laugh") laughSource = src;
      return;
    } catch (_) {}
  }
}

function stopSfx(name) {
  if (name === "laugh" && laughSource) {
    try {
      laughSource.stop();
    } catch (_) {}
    laughSource = null;
  }
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
let teamScoresDirty = false;

function getTeamBest(id) {
  const n = Number(teamBestScores[id]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function flushTeamScores() {
  if (!teamScoresDirty) return;
  teamScoresDirty = false;
  saveTeamScores(teamBestScores);
}

function recordTeamScore(value) {
  const id = selectedTeam || "fr";
  const v = Math.max(0, Math.floor(value || 0));
  if (v <= getTeamBest(id)) return false;
  teamBestScores[id] = v;
  teamScoresDirty = true;
  return true;
}

const teamScoreEls = {};
function cacheTeamScoreEls() {
  TEAM_IDS.forEach((id) => {
    teamScoreEls[id] = document.querySelector(`[data-team-score="${id}"]`);
  });
}

function renderTeamScores() {
  TEAM_IDS.forEach((id) => {
    const el = teamScoreEls[id] || document.querySelector(`[data-team-score="${id}"]`);
    if (el) {
      teamScoreEls[id] = el;
      el.textContent = String(getTeamBest(id));
    }
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
  closeDiffPanel();
  closeMinigamesPanel();
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
cacheTeamScoreEls();
updateHudTeamFlag();

window.addEventListener("pagehide", flushTeamScores);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushTeamScores();
});

bindPress(startBtn);
bindPress(diffPlayBtn);
bindPress(minigamesBtn);
bindPress(teamPickBtn);
bindPress(replayBtn);
bindPress(quitBtn);

syncDiffSlider();

if (diffSlider) {
  diffSlider.addEventListener("input", () => applyDiffSlider(false));
  diffSlider.addEventListener("change", () => {
    applyDiffSlider(true);
    playUiClick();
  });
}

if (minigamesBtn) {
  minigamesBtn.addEventListener("click", () => openMinigamesPanel());
}

if (minigameTimeTrialBtn) {
  bindPress(minigameTimeTrialBtn);
  minigameTimeTrialBtn.addEventListener("click", () => beginTimeTrial());
}

if (minigameDuelBtn) {
  bindPress(minigameDuelBtn);
  minigameDuelBtn.addEventListener("click", () => beginDuel());
}

if (minigamesPanel) {
  minigamesPanel.addEventListener("click", (e) => {
    if (e.target === minigamesPanel) closeMinigamesPanel();
  });
}

if (teamPickBtn) {
  teamPickBtn.addEventListener("click", () => {
    closeDiffPanel();
    closeMinigamesPanel();
    toggleTeamsPanel();
  });
}

if (teamsPanel) {
  teamsPanel.addEventListener("click", (e) => {
    if (e.target === teamsPanel) teamsPanel.hidden = true;
  });
}

if (diffPanel) {
  diffPanel.addEventListener("click", (e) => {
    if (e.target === diffPanel) closeDiffPanel();
  });
}

if (startBtn) {
  startBtn.addEventListener("click", () => openDiffPanel());
}

if (diffPlayBtn) {
  diffPlayBtn.addEventListener("click", () => beginMatch());
}

// Décode l’audio dès la 1ʳᵉ interaction menu
["pointerdown", "touchstart", "click"].forEach((ev) => {
  window.addEventListener(ev, warmAudio, { once: true, passive: true });
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
  const wrap = document.querySelector(".cage-wrap");
  if (wrap) {
    const wr = wrap.getBoundingClientRect();
    cageWrapOffset.x = wr.left - g.left;
    cageWrapOffset.y = wr.top - g.top;
  }
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
  if (playMode === "duel") {
    if (duelP1ScoreEl) duelP1ScoreEl.textContent = String(duelP1.goals);
    if (duelP2ScoreEl) duelP2ScoreEl.textContent = String(duelP2.goals);
    fillDuelLives(duelP1LivesEl, duelP1.lives);
    fillDuelLives(duelP2LivesEl, duelP2.lives);
    document.querySelectorAll(".hud-duel__row").forEach((row) => {
      row.classList.toggle("is-turn", row.classList.contains(`hud-duel__row--${duelTurn}`));
    });
    if (scoreValEl) scoreValEl.textContent = `${duelP1.goals}-${duelP2.goals}`;
    return;
  }
  if (playMode === "timeTrial") {
    if (ttTimerEl) {
      ttTimerEl.textContent = Math.max(0, ttTimeLeft).toFixed(1);
      ttTimerEl.classList.toggle("is-low", ttTimeLeft <= 5);
    }
    if (ttGoalsEl) {
      const need = (ttRounds[ttRoundIndex] && ttRounds[ttRoundIndex].goals) || 0;
      ttGoalsEl.textContent = `${ttGoalsHave}/${need}`;
    }
    if (scoreValEl) scoreValEl.textContent = String(score);
    if (livesEl) {
      livesEl.querySelectorAll(".hud-ball").forEach((el, i) => {
        el.classList.toggle("is-on", i < lives);
      });
    }
    return;
  }
  if (scoreValEl) scoreValEl.textContent = String(score);
  if (!livesEl) return;
  livesEl.querySelectorAll(".hud-ball").forEach((el, i) => {
    el.classList.toggle("is-on", i < lives);
  });
}

function loseLife() {
  if (playMode === "duel") {
    const p = currentDuelPlayer();
    p.lives = Math.max(0, p.lives - 1);
    updateHud();
    if (p.lives <= 0) {
      finishDuel(duelTurn === 1 ? 2 : 1);
      return;
    }
    scheduleDuelPass();
    return;
  }
  lives = Math.max(0, lives - 1);
  updateHud();
  if (lives <= 0) {
    if (playMode === "timeTrial") {
      finishTimeTrial(false);
    } else {
      showGameOver();
    }
  }
}

function addScore() {
  if (playMode === "duel") {
    const p = currentDuelPlayer();
    p.goals += 1;
    goalCount += 1;
    updateHud();
    if (p.goals >= DUEL_GOAL_WIN) {
      finishDuel(duelTurn);
      return;
    }
    scheduleDuelPass();
    return;
  }
  score += 1;
  goalCount += 1;
  if (playMode === "timeTrial") {
    ttGoalsHave += 1;
    updateHud();
    const need = (ttRounds[ttRoundIndex] && ttRounds[ttRoundIndex].goals) || 99;
    if (!ttPaused && !gameOver && ttGoalsHave >= need) {
      completeTtRound();
    }
    return;
  }
  updateHud();
  recordTeamScore(score);
}

function stopOnGoal(zone) {
  setBallRing(false);
  addScore();
  beginGroundBounce(true, true);
  // Un seul son + FX étalés sur 2 frames (évite le gros hitch)
  playSfx(`win${1 + Math.floor(Math.random() * 4)}`);
  requestAnimationFrame(() => {
    showGoalMarker();
    playKeeperAnxiousHead();
    requestAnimationFrame(() => {
      bounceCage();
      frenzyPions();
    });
  });
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
  const count = 16;
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
  const sgx = x;
  const sgy = y;
  const spatX = patX;
  const spatY = patY;
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
  // Ghost + styles lourds au frame suivant
  requestAnimationFrame(() => {
    if (gameOver) return;
    gx = sgx;
    gy = sgy;
    gpatX = spatX;
    gpatY = spatY;
    gvx = (Math.random() - 0.5) * (fromCage ? 28 : 40);
    gvy = fromCage ? -(240 + Math.random() * 60) : 30 + Math.random() * 40;
    bounceEndAt = performance.now() + BOUNCE_LIFE;
    ghostActive = true;
    ghostEl.hidden = false;
    ghostEl.style.opacity = "1";
    ghostEl.classList.add("is-flying");
    renderGhost();
  });
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
let cageWrapOffset = { x: 0, y: 0 };

function syncHitRects() {
  hitRects.game = game.getBoundingClientRect();
  hitRects.cage = hitboxCageImg.getBoundingClientRect();
  hitRects.bg = hitboxBgImg.getBoundingClientRect();
  hitRects.keeper = keeperEl ? keeperEl.getBoundingClientRect() : null;
}

function isDuelFlipped() {
  return false;
}

/** Coords jeu → écran (flip 180° pour J2) */
function localToScreen(lx, ly, g) {
  const rect = g || hitRects.game || game.getBoundingClientRect();
  const w = game.clientWidth;
  const h = game.clientHeight;
  if (isDuelFlipped()) {
    return {
      x: rect.left + (w - lx),
      y: rect.top + (h - ly),
    };
  }
  return { x: rect.left + lx, y: rect.top + ly };
}

/** Coords écran → jeu */
function screenToLocal(sx, sy, g) {
  const rect = g || hitRects.game || game.getBoundingClientRect();
  let lx = sx - rect.left;
  let ly = sy - rect.top;
  if (isDuelFlipped()) {
    lx = game.clientWidth - lx;
    ly = game.clientHeight - ly;
  }
  return { x: lx, y: ly };
}

function setBallRing(on) {
  ballEl.classList.toggle("show-ring", on);
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function localPoint(e) {
  const rect = game.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  if (isDuelFlipped()) {
    x = game.clientWidth - x;
    y = game.clientHeight - y;
  }
  return { x, y, t: performance.now() };
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
  ];

  const hits = { red: 0, blue: 0, violet: 0, green: 0 };
  const wanted = zoneName(targetZone);
  for (const [ox, oy] of offsets) {
    const px = cx + ox;
    const py = cy + oy;
    if (px < cage.left || px > cage.right || py < cage.top || py > cage.bottom) continue;
    let u = (px - cage.left) / cage.width;
    let v = (py - cage.top) / cage.height;
    if (isDuelFlipped()) {
      u = 1 - u;
      v = 1 - v;
    }
    const mx = Math.floor(u * CAGE_MASK_W);
    const my = Math.floor(v * CAGE_MASK_H);
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
  if (hits.green >= 1) return "green";
  return "other";
}

function probeCageZone() {
  const s = localToScreen(x, y);
  return probeCageAtScreen(s.x, s.y);
}

/** Balayage prev→current pour ne pas sauter la zone à haute vitesse */
function probeCageSwept() {
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 5));
  let found = "other";
  const wanted = zoneName(targetZone);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = prevX + (x - prevX) * t;
    const sy = prevY + (y - prevY) * t;
    const scr = localToScreen(sx, sy);
    const z = probeCageAtScreen(scr.x, scr.y);
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
    let v = (py - rect.top) / rect.height;
    if (isDuelFlipped()) {
      u = 1 - u;
      v = 1 - v;
    }
    if (keeperDir > 0) u = 1 - u;
    const mx = Math.floor(u * mw);
    const my = Math.floor(v * mh);
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
  const dist = Math.hypot(x - prevX, y - prevY);
  const steps = Math.max(1, Math.ceil(dist / 5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = prevX + (x - prevX) * t;
    const sy = prevY + (y - prevY) * t;
    const scr = localToScreen(sx, sy);
    if (probeKeeperAtScreen(scr.x, scr.y)) return true;
  }
  return false;
}

function probeBgZone() {
  const g = hitRects.game || game.getBoundingClientRect();
  const bg = hitRects.bg || hitboxBgImg.getBoundingClientRect();
  const scr = localToScreen(x, y, g);
  const cy = scr.y;
  if (bg.height < 2) return "other";
  const t = (cy - bg.top) / bg.height;
  if (t <= BG_RED_BOT) return "red";
  if (t >= BG_BLUE_TOP && t <= BG_BLUE_BOT) return "blue";
  return "black";
}

function bounceCage() {
  if (!cageEl) return;
  cageEl.classList.remove("is-bounce");
  requestAnimationFrame(() => {
    cageEl.classList.add("is-bounce");
  });
}

function showGoalMarker() {
  if (!goalMarker) return;
  const scale = depthScale(y);
  const ballW = BALL_SIZE * scale;
  const size = Math.max(36, ballW * 1.05);
  const left = x - cageWrapOffset.x;
  const top = y - cageWrapOffset.y;
  goalHits.push({ left, top, n: score });
  goalMarker.hidden = false;
  goalMarker.classList.remove("is-fade");
  goalMarker.textContent = String(score);
  goalMarker.style.cssText =
    `width:${size}px;height:${size}px;font-size:${Math.max(16, size * 0.42)}px;` +
    `left:${left}px;top:${top}px;background:#e53935;border:none;box-shadow:none;` +
    `opacity:1;visibility:visible`;
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

  const screenTX = cage.left + ((targetMaskX + 0.5) / CAGE_MASK_W) * cage.width;
  const screenTY = cage.top + ((targetMaskY + 0.5) / CAGE_MASK_H) * cage.height;
  const localT = screenToLocal(screenTX, screenTY, g);
  const targetX = localT.x;
  const targetY = localT.y;

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
  if (gameOver || ttPaused || duelPaused || state !== "idle") return;
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
      ballSpin += dAng * 0.32;
      spinVel += dAng * SPIN_GAIN;
      spinVel = clamp(spinVel, -CURVE_SPIN_MAX, CURVE_SPIN_MAX);
      patX = wrapMesh(patX + dAng * 7);
      patY = wrapMesh(patY + Math.abs(dAng) * 2.5);
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
    // plusieurs tours → un peu plus de courbe, sans exploser
    flightSpin = sign * (excess + excess * excess * 0.025);
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

function ensureLoop() {
  if (loopOn) {
    lastT = performance.now();
    return;
  }
  loopOn = true;
  lastT = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  if (game.hidden) {
    loopOn = false;
    return;
  }
  const dt = Math.min(0.033, (now - lastT) / 1000);
  lastT = now;

  updateTimeTrial(dt);
  updateKeeper(dt);

  if (state === "aiming") {
    if (Math.abs(spinVel) > 0.002) {
      ballSpin += spinVel * dt * 0.5;
      patX = wrapMesh(patX + spinVel * dt * 6);
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
        ballSpin += flightSpin * sdt * 1.05;
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