const startBtn = document.getElementById("startBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const ballEl = document.getElementById("ball");
const patternEl = document.getElementById("ballPattern");
const goalArea = document.getElementById("goalArea");
const cageEl = document.getElementById("cage");
const goalMarker = document.getElementById("goalMarker");
const hitboxBgImg = document.getElementById("hitboxBg");
const hitboxCageImg = document.getElementById("hitboxCage");

const BALL_SIZE = 88;
const SCALE_NEAR = 1;
const SCALE_FAR = 0.28;
const DRAG = 0.992;
const MIN_SPEED = 40;
const THROW_GAIN = 2.35;
const MAX_SPEED = 2200;
const MESH_TILE = 46;
const RESET_DELAY = 900;
const ROLL_GAIN = 0.55;
const FLIGHT_ROLL = 0.085;
const BOUNCE = 0.62;

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
let floorBounceLock = false;
let leftGround = false;
let prevBgZone = "blue";
let ignoreFloorUntil = 0;

const cageCanvas = document.createElement("canvas");
const cageCtx = cageCanvas.getContext("2d", { willReadFrequently: true });
const bgCanvas = document.createElement("canvas");
const bgCtx = bgCanvas.getContext("2d", { willReadFrequently: true });
let cagePixels = null;
let bgPixels = null;
let cageReady = false;
let bgReady = false;

function paintHitbox(img, canvas, ctx) {
  if (!img.naturalWidth) return null;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function ensureHitboxes() {
  try {
    const c = paintHitbox(hitboxCageImg, cageCanvas, cageCtx);
    if (c) {
      cagePixels = c;
      cageReady = true;
    }
  } catch (e) {
    console.warn("cage hitbox", e);
  }
  try {
    const b = paintHitbox(hitboxBgImg, bgCanvas, bgCtx);
    if (b) {
      bgPixels = b;
      bgReady = true;
    }
  } catch (e) {
    console.warn("bg hitbox", e);
  }
}

function whenImageReady(img, fn) {
  if (img.complete && img.naturalWidth) fn();
  else img.addEventListener("load", fn, { once: true });
}

whenImageReady(hitboxCageImg, ensureHitboxes);
whenImageReady(hitboxBgImg, ensureHitboxes);

startBtn.addEventListener("pointerdown", () => startBtn.classList.add("is-pressed"));
startBtn.addEventListener("pointerup", () => startBtn.classList.remove("is-pressed"));
startBtn.addEventListener("pointerleave", () => startBtn.classList.remove("is-pressed"));

startBtn.addEventListener("click", () => {
  menu.hidden = true;
  game.hidden = false;
  requestAnimationFrame(() => {
    ensureHitboxes();
    layout();
    resetBall(false);
    lastT = performance.now();
    requestAnimationFrame(loop);
  });
});

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

function resetBall(animate) {
  state = "idle";
  x = homeX;
  y = homeY;
  vx = 0;
  vy = 0;
  patX = 0;
  patY = 0;
  lastAim = null;
  floorBounceLock = false;
  leftGround = false;
  prevBgZone = "blue";
  ignoreFloorUntil = 0;
  ballEl.classList.remove("is-flying");
  render();
  if (animate) {
    ballEl.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 220, easing: "ease-out" }
    );
  }
}

function depthScale(py) {
  const t = clamp((nearY - py) / Math.max(1, nearY - farY), 0, 1);
  return SCALE_NEAR + (SCALE_FAR - SCALE_NEAR) * t;
}

function ballTransform(px, py, scale) {
  const s = scale ?? depthScale(py);
  return `translate3d(${px - BALL_SIZE / 2}px, ${py - BALL_SIZE / 2}px, 0) scale(${s})`;
}

function wrapMesh(v) {
  while (v > MESH_TILE) v -= MESH_TILE * 2;
  while (v < -MESH_TILE) v += MESH_TILE * 2;
  return v;
}

function render() {
  const scale = depthScale(y);
  ballEl.style.transform = ballTransform(x, y, scale);
  patternEl.style.transform = `translate(calc(-50% + ${patX}px), calc(-50% + ${patY}px))`;
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
  const r = (BALL_SIZE / 2) * scale * 1.35;
  const dx = px - x;
  const dy = py - y;
  return dx * dx + dy * dy <= r * r;
}

function classifyColor(r, g, b) {
  if (r < 45 && g < 45 && b < 45) return "black";
  if (r > 200 && g < 120 && b < 120) return "red";
  if (g > 200 && g > r && g > b) return "green";
  if (b > 200 && b > r && b > g) return "blue";
  return "other";
}

function readPixel(pixels, width, height, ix, iy) {
  if (!pixels) return "other";
  const px = Math.floor(clamp(ix, 0, width - 1));
  const py = Math.floor(clamp(iy, 0, height - 1));
  const i = (py * width + px) * 4;
  const d = pixels.data;
  return classifyColor(d[i], d[i + 1], d[i + 2]);
}

/**
 * Collision réelle : centre du ballon DOM vs hitbox_cage DOM.
 * Plus de conversion manuelle de coordonnées.
 */
function probeCageZone() {
  if (!cageReady || !cagePixels) ensureHitboxes();
  if (!cagePixels) return "other";

  const ball = ballEl.getBoundingClientRect();
  const cage = hitboxCageImg.getBoundingClientRect();
  if (cage.width < 2 || cage.height < 2) return "other";

  const cx = ball.left + ball.width / 2;
  const cy = ball.top + ball.height / 2;
  const rad = Math.max(ball.width, ball.height) * 0.45;

  const offsets = [
    [0, 0],
    [0, -rad],
    [0, rad * 0.4],
    [-rad, 0],
    [rad, 0],
    [-rad * 0.7, -rad * 0.5],
    [rad * 0.7, -rad * 0.5],
  ];

  let sawGreen = false;
  for (const [ox, oy] of offsets) {
    const px = cx + ox;
    const py = cy + oy;
    if (px < cage.left || px > cage.right || py < cage.top || py > cage.bottom) continue;

    const ix = ((px - cage.left) / cage.width) * cageCanvas.width;
    const iy = ((py - cage.top) / cage.height) * cageCanvas.height;
    const zone = readPixel(cagePixels, cageCanvas.width, cageCanvas.height, ix, iy);
    if (zone === "red") return "red";
    if (zone === "green") sawGreen = true;
  }
  return sawGreen ? "green" : "other";
}

function probeBgZone() {
  if (!bgReady || !bgPixels) ensureHitboxes();
  if (!bgPixels) return "other";

  const ball = ballEl.getBoundingClientRect();
  const bg = hitboxBgImg.getBoundingClientRect();
  const cx = ball.left + ball.width / 2;
  const cy = ball.top + ball.height / 2;
  if (cx < bg.left || cx > bg.right || cy < bg.top || cy > bg.bottom) return "black";

  const scale = Math.max(bg.width / bgCanvas.width, bg.height / bgCanvas.height);
  const drawW = bgCanvas.width * scale;
  const drawH = bgCanvas.height * scale;
  const offX = (bg.width - drawW) / 2;
  const offY = (bg.height - drawH) / 2;
  const ix = (cx - bg.left - offX) / scale;
  const iy = (cy - bg.top - offY) / scale;
  return readPixel(bgPixels, bgCanvas.width, bgCanvas.height, ix, iy);
}

function bounceCage() {
  cageEl.classList.remove("is-bounce");
  void cageEl.offsetWidth;
  cageEl.classList.add("is-bounce");
}

function showGoalMarker() {
  const ball = ballEl.getBoundingClientRect();
  const g = game.getBoundingClientRect();
  const size = Math.max(28, ball.width);

  goalMarker.hidden = false;
  goalMarker.classList.remove("is-fade");
  goalMarker.style.width = `${size}px`;
  goalMarker.style.height = `${size}px`;
  goalMarker.style.left = `${ball.left - g.left + ball.width / 2}px`;
  goalMarker.style.top = `${ball.top - g.top + ball.height / 2}px`;
  goalMarker.style.opacity = "1";

  clearTimeout(showGoalMarker._t1);
  clearTimeout(showGoalMarker._t2);
  showGoalMarker._t1 = setTimeout(() => {
    goalMarker.classList.add("is-fade");
    showGoalMarker._t2 = setTimeout(() => {
      goalMarker.hidden = true;
      goalMarker.classList.remove("is-fade");
    }, 300);
  }, 1000);
}

function stopOnCage(zone) {
  state = "stuck";
  vx = 0;
  vy = 0;
  bounceCage();
  if (zone === "red") showGoalMarker();
  render();
  setTimeout(() => resetBall(true), zone === "red" ? 1300 : 700);
}

function bounceFloor() {
  if (vy <= 0) return;
  vy = -Math.abs(vy) * BOUNCE;
  vx *= 0.85;
  y -= 2;
  floorBounceLock = true;
  setTimeout(() => { floorBounceLock = false; }, 140);
}

function resolveHits() {
  // IMPORTANT : appeler après render() pour des getBoundingClientRect à jour
  const cageZone = probeCageZone();
  const bgZone = probeBgZone();

  if (bgZone === "black") leftGround = true;

  if (cageZone === "red" || cageZone === "green") {
    ignoreFloorUntil = performance.now() + 800;
    stopOnCage(cageZone);
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

game.addEventListener("pointerdown", (e) => {
  if (state !== "idle") return;
  const p = localPoint(e);
  if (!hitBall(p.x, p.y)) return;
  pointerId = e.pointerId;
  game.setPointerCapture(pointerId);
  state = "aiming";
  samples = [p];
  lastAim = p;
});

game.addEventListener("pointermove", (e) => {
  if (state !== "aiming" || e.pointerId !== pointerId) return;
  const p = localPoint(e);
  samples.push(p);
  if (samples.length > 8) samples.shift();

  if (lastAim) {
    patX = wrapMesh(patX + (p.x - lastAim.x) * ROLL_GAIN);
    patY = wrapMesh(patY + (p.y - lastAim.y) * ROLL_GAIN);
  }
  lastAim = p;

  x = clamp(p.x, BALL_SIZE * 0.4, game.clientWidth - BALL_SIZE * 0.4);
  y = clamp(p.y, nearY - 40, nearY + 50);
  render();
});

function endAim(e) {
  if (state !== "aiming" || e.pointerId !== pointerId) return;
  pointerId = null;
  lastAim = null;

  const recent = samples.slice(-5);
  if (recent.length < 2) {
    resetBall(false);
    return;
  }

  const a = recent[0];
  const b = recent[recent.length - 1];
  const dt = Math.max(16, b.t - a.t) / 1000;
  let throwVx = ((b.x - a.x) / dt) * THROW_GAIN;
  let throwVy = ((b.y - a.y) / dt) * THROW_GAIN;

  const speed = Math.hypot(throwVx, throwVy);
  if (speed < MIN_SPEED || throwVy >= -20) {
    resetBall(false);
    return;
  }

  if (speed > MAX_SPEED) {
    const k = MAX_SPEED / speed;
    throwVx *= k;
    throwVy *= k;
  }

  vx = throwVx;
  vy = throwVy;
  floorBounceLock = false;
  leftGround = false;
  ignoreFloorUntil = 0;
  ensureHitboxes();
  render();
  prevBgZone = probeBgZone();
  state = "flying";
  ballEl.classList.add("is-flying");
}

game.addEventListener("pointerup", endAim);
game.addEventListener("pointercancel", endAim);

function loop(now) {
  if (game.hidden) return;
  const dt = Math.min(0.033, (now - lastT) / 1000);
  lastT = now;

  if (state === "flying") {
    vx *= Math.pow(DRAG, dt * 60);
    vy *= Math.pow(DRAG, dt * 60);
    x += vx * dt;
    y += vy * dt;

    patX = wrapMesh(patX + vx * FLIGHT_ROLL * dt);
    patY = wrapMesh(patY + vy * FLIGHT_ROLL * dt);

    // 1) maj visuelle  2) collision DOM
    render();
    resolveHits();

    if (state !== "flying") {
      requestAnimationFrame(loop);
      return;
    }

    const w = game.clientWidth;
    const h = game.clientHeight;
    const scale = depthScale(y);
    const r = (BALL_SIZE / 2) * scale;
    const speed = Math.hypot(vx, vy);

    if (
      y < -r ||
      y > h + r ||
      x < -r ||
      x > w + r ||
      (speed < 35 && y < nearY - 80)
    ) {
      state = "reset";
      setTimeout(() => resetBall(true), RESET_DELAY);
    }
  }

  requestAnimationFrame(loop);
}
