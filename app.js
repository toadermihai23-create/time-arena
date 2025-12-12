/*************************************************
 * Time Arena — Cloud Synced Version
 *************************************************/

// 🔐 FIREBASE CONFIG — REPLACE WITH YOUR OWN
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔗 SINGLE SHARED DOCUMENT (whole family)
const GAME_DOC = db.collection("timeArena").doc("shared");

/*************************************************
 * DEFAULT STATE (used only once)
 *************************************************/
const DEFAULT_STATE = {
  score: 0,
  minutes: 0,
  level: 1,
  lives: 3,
  streak: 0,
  lastDay: null,
  history: []
};

let state = null;

/*************************************************
 * INITIALIZATION
 *************************************************/
init();
registerSW();

function init() {
  GAME_DOC.get().then(doc => {
    if (!doc.exists) {
      GAME_DOC.set(DEFAULT_STATE);
    }
  });

  // 🔄 REALTIME SYNC
  GAME_DOC.onSnapshot(doc => {
    state = doc.data();
    render();
  });

  wireUI();
}

/*************************************************
 * GAME ACTIONS
 *************************************************/
function todayKey() {
  return new Date().toDateString();
}

function win(label, pts, mins) {
  const updates = structuredClone(state);

  updates.score += pts;
  updates.minutes += mins;
  updates.streak += 1;
  updates.lastDay = todayKey();

  updates.history.unshift(makeHistory(`✅ ${label}`, pts, mins));
  updates.history = updates.history.slice(0, 50);

  checkLevelUp(updates);
  GAME_DOC.set(updates);
}

function lose(label, pts, mins) {
  const updates = structuredClone(state);

  updates.score -= pts;
  updates.minutes -= mins;
  updates.lives -= 1;
  updates.streak = 0;
  updates.lastDay = todayKey();

  updates.history.unshift(makeHistory(`❌ ${label}`, -pts, -mins));

  if (updates.lives <= 0) {
    updates.minutes = Math.max(0, updates.minutes - 60);
    updates.lives = 3;
    updates.history.unshift(makeHistory("⚠️ Time Freeze", 0, -60));
  }

  updates.history = updates.history.slice(0, 50);
  GAME_DOC.set(updates);
}

function checkLevelUp(s) {
  const needed = s.level * 100;
  if (s.score >= needed) {
    s.level += 1;
    s.lives = Math.min(5, s.lives + 1);
    s.history.unshift(makeHistory(`🎉 Level ${s.level}`, 0, 0));
  }
}

/*************************************************
 * HISTORY
 *************************************************/
function makeHistory(label, pts, mins) {
  return {
    label,
    pts,
    mins,
    time: new Date().toLocaleTimeString()
  };
}

/*************************************************
 * UI
 *************************************************/
function wireUI() {
  btnHomework.onclick  = () => win("Homework", 20, 30);
  btnLanguages.onclick = () => win("Languages", 15, 20);
  btnChores.onclick    = () => win("Chores", 10, 15);

  btnRefused.onclick    = () => lose("Refused task", 20, 30);
  btnDisrespect.onclick = () => lose("Disrespect", 30, 30);
}

function render() {
  if (!state) return;

  minutes.textContent = state.minutes;
  score.textContent   = state.score;
  lives.textContent   = state.lives;
  streak.textContent  = state.streak;
  level.textContent   = state.level;

  history.innerHTML = "";
  state.history.forEach(h => {
    const li = document.createElement("li");
    const extras = [
      h.pts ? `${h.pts > 0 ? "+" : ""}${h.pts} pts` : "",
      h.mins ? `${h.mins > 0 ? "+" : ""}${h.mins} min` : ""
    ].filter(Boolean).join(", ");

    li.textContent = `${h.time} — ${h.label}${extras ? " (" + extras + ")" : ""}`;
    history.appendChild(li);
  });
}

/*************************************************
 * PWA
 *************************************************/
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}
