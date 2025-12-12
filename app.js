const STORAGE_KEY = "timeArenaState_v1";

const defaultState = {
  score: 0,
  minutes: 0,
  level: 1,
  lives: 3,
  streak: 0,
  lastDay: null,
  history: []
};

let state = loadState();
wireUI();
render();
registerSW();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  return new Date().toDateString();
}

function ensureDailyStreak() {
  const t = todayKey();
  if (state.lastDay === t) return;

  // New day: streak continues only if last action was yesterday
  // Simple approach: if lastDay is null, start streak at 0 then increment on first action
  state.lastDay = t;
}

function addHistory(label, pts, mins, lifeDelta) {
  const time = new Date().toLocaleTimeString();
  state.history.unshift({
    time,
    label,
    pts,
    mins,
    lifeDelta
  });
  state.history = state.history.slice(0, 40);
}

function checkLevelUp() {
  const needed = state.level * 100;
  if (state.score >= needed) {
    state.level += 1;
    state.lives = Math.min(5, state.lives + 1);
    addHistory(`🎉 Level up to ${state.level}`, 0, 0, +1);
  }
}

function win(label, pts, mins) {
  ensureDailyStreak();
  state.score += pts;
  state.minutes += mins;
  state.streak += 1;

  addHistory(`✅ ${label}`, +pts, +mins, 0);
  checkLevelUp();
  saveState();
  render();
}

function lose(label, pts, mins) {
  ensureDailyStreak();
  state.score -= pts;
  state.minutes -= mins;
  state.lives -= 1;
  state.streak = 0;

  addHistory(`❌ ${label}`, -pts, -mins, -1);

  if (state.lives <= 0) {
    // “Game penalty”
    state.minutes = Math.max(0, state.minutes - 60);
    state.lives = 3;
    addHistory("⚠️ Time Freeze: −60 min, lives reset", 0, -60, +3);
  }

  saveState();
  render();
}

function resetGameKeepHistory() {
  const oldHistory = state.history;
  state = structuredClone(defaultState);
  state.history = oldHistory;
  saveState();
  render();
}

function hardReset() {
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  render();
}

function wireUI() {
  document.getElementById("btnHomework").onclick  = () => win("Homework", 20, 30);
  document.getElementById("btnLanguages").onclick = () => win("Languages", 15, 20);
  document.getElementById("btnChores").onclick    = () => win("Chores", 10, 15);

  document.getElementById("btnRefused").onclick    = () => lose("Refused task", 20, 30);
  document.getElementById("btnDisrespect").onclick = () => lose("Disrespect", 30, 30);

  document.getElementById("btnReset").onclick = () => resetGameKeepHistory();
  document.getElementById("btnHardReset").onclick = () => {
    if (confirm("Delete EVERYTHING?")) hardReset();
  };
}

function render() {
  document.getElementById("minutes").textContent = state.minutes;
  document.getElementById("score").textContent = state.score;
  document.getElementById("lives").textContent = state.lives;
  document.getElementById("streak").textContent = state.streak;
  document.getElementById("level").textContent = state.level;

  const ul = document.getElementById("history");
  ul.innerHTML = "";
  state.history.forEach(h => {
    const li = document.createElement("li");
    const pts = h.pts ? `${h.pts > 0 ? "+" : ""}${h.pts} pts` : "";
    const mins = h.mins ? `${h.mins > 0 ? "+" : ""}${h.mins} min` : "";
    const extra = [pts, mins].filter(Boolean).join(", ");
    li.textContent = `${h.time} — ${h.label}${extra ? " (" + extra + ")" : ""}`;
    ul.appendChild(li);
  });
}

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
