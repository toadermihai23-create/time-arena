// TimeArena Gamify — UI demo data (înlocuiești cu datele tale din Firebase / DB)

const state = {
  userName: "Nikita",
  level: 1,
  points: 20,
  nextLevelAt: 100, // prag nivel următor (demo)
  completedToday: [],

  // Responsabilități (obligatorii)
  responsibilities: [
    {
      id: "r-homework",
      icon: "📘",
      title: "Teme 1h (Obligatoriu)",
      desc: "1 oră teme + pregătire pentru școală (toate materiile).",
      points: 20,
      type: "responsibility",
      required: true
    },
    {
      id: "r-languages",
      icon: "🌍",
      title: "Limbi străine 1h (Obligatoriu)",
      desc: "1 oră limbi străine (exerciții / citit / vocabular).",
      points: 20,
      type: "responsibility",
      required: true
    },
  ],

  // Time Winners (câștigă)
  winners: [
    { id:"w-bed", icon:"🛏️", title:"Fă-ți Patul", desc:"În fiecare dimineață, înainte de școală.", points:10, category:"Responsabilitate" },
    { id:"w-room", icon:"🧹", title:"Curăță-ți Camera", desc:"Strânge tot și pune la loc.", points:25, category:"Responsabilitate" },
    { id:"w-dishes", icon:"🍽️", title:"Războinicul Veselei", desc:"Spală vasele fără să fie nevoie de 3 remindere.", points:15, category:"Responsabilitate" },

    { id:"w-focus", icon:"👂", title:"Ascultătorul Ninja", desc:"Atenție când vorbim (fără telefon, fără ignorat).", points:10, category:"Comportament" },
    { id:"w-truth", icon:"🤝", title:"Spune Adevărul", desc:"Adevăr chiar și când e incomod.", points:10, category:"Comportament" },

    { id:"w-read", icon:"📚", title:"Citește 20 de minute", desc:"Orice carte, minim 20 minute.", points:15, category:"Școală" },
    { id:"w-study", icon:"🧠", title:"Study Sprint", desc:"Repetă 15 minute lecția grea.", points:10, category:"Școală" },

    { id:"w-out", icon:"🌤️", title:"Afara Quest", desc:"Ieși afară 30–60 minute (plimbare / joacă).", points:20, category:"Activități" },
    { id:"w-sport", icon:"⚽", title:"Legenda Sportului", desc:"Mergi la sport și te implici.", points:30, category:"Sport" },

    { id:"w-family", icon:"❤️", title:"Prietenul Familiei", desc:"Stai cu noi 15 min, glumește, conectează-te.", points:10, category:"Familie" },
  ],

  // Time Losers (pierde bonus)
  losers: [
    { id:"l-drama", icon:"😫", title:"Drama Burst", desc:"Victimizare / dramatizare ca să scapi de treabă.", points:-15, category:"Comportament" },
    { id:"l-fakepain", icon:"😭", title:"Fake Pain Mode", desc:"„Mă doare” folosit ca scuză când e ceva important.", points:-20, category:"Comportament" },
    { id:"l-lie", icon:"🧢", title:"Sneaky Mode (Minciună)", desc:"Minciună / păcăleală.", points:-25, category:"Comportament" },
    { id:"l-disrespect", icon:"🚫", title:"Disrespect Strike", desc:"Vorbit urât / lipsă de respect.", points:-20, category:"Familie" },
    { id:"l-homeworkskip", icon:"❌", title:"Refuz Teme", desc:"Nu îți faci temele (obligatoriu).", points:-30, category:"Școală" },
    { id:"l-languageskip", icon:"⛔", title:"Refuz Limbi", desc:"Nu faci ora de limbi (obligatoriu).", points:-30, category:"Școală" },
  ],

  // Recompense
  store: [
    { id:"s-yt20", icon:"📺", title:"+20 min YouTube", desc:"Bonus video extra.", cost: 40 },
    { id:"s-ps20", icon:"🎮", title:"+20 min PlayStation", desc:"Bonus PS (peste garantat).", cost: 45 },
    { id:"s-movie", icon:"🍿", title:"Eu aleg filmul de seară", desc:"Tu alegi filmul pentru familie.", cost: 60 },
    { id:"s-dessert", icon:"🍩", title:"Desert Special", desc:"Un desert ales de tine.", cost: 55 },
    { id:"s-weekend", icon:"⭐", title:"Super Bonus Weekend", desc:"+1 recompensă mare în weekend.", cost: 120 },
  ]
};

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function calcProgress(){
  const pct = (state.points / state.nextLevelAt) * 100;
  return clamp(pct, 0, 100);
}

function updateHeader(){
  $("#welcomeTitle").textContent = `Salut, ${state.userName}! 👋`;
  $("#welcomeMsg").textContent =
    "Bine ai venit în TimeArena Gamify — azi îți crești nivelul prin alegeri inteligente.";

  $("#level").textContent = state.level;
  $("#points").textContent = state.points;
  $("#miniLevel").textContent = state.level;
  $("#miniPoints").textContent = state.points;

  const left = Math.max(0, state.nextLevelAt - state.points);
  $("#toNext").textContent = left;

  $("#progressBar").style.width = `${calcProgress()}%`;
}

function itemHTML(x, mode){
  // mode: "active" | "done" | "store" | "loser"
  const pillClass =
    x.points >= 0 ? "pill-gold" : "pill-red";
  const pillText =
    x.points >= 0 ? `⭐ ${x.points}` : `⚠️ ${x.points}`;

  if (mode === "store") {
    return `
      <div class="store-item">
        <div class="store-head">
          <div class="item-left">
            <div class="item-ic">${x.icon}</div>
            <div>
              <div class="store-title">${x.title}</div>
              <div class="store-desc">${x.desc}</div>
            </div>
          </div>
          <span class="pill pill-blue">${x.cost} puncte</span>
        </div>
        <div class="store-actions">
          <span class="muted small">Cost</span>
          <button class="btn btn-primary" data-buy="${x.id}">Cumpără</button>
        </div>
      </div>
    `;
  }

  const right =
    mode === "done"
      ? `<div class="done">✓</div>`
      : `<button class="go" data-complete="${x.id}">Start!</button>`;

  const category = x.category ? `<span class="pill pill-blue">${x.category}</span>` : "";
  const pointsBadge = `<span class="pill ${pillClass}">${pillText} puncte</span>`;

  return `
    <div class="item">
      <div class="item-left">
        <div class="item-ic">${x.icon}</div>
        <div>
          <div class="item-title">${x.title}</div>
          <div class="item-desc">${x.desc}</div>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
            ${category}
            ${pointsBadge}
          </div>
        </div>
      </div>
      <div class="item-right">${right}</div>
    </div>
  `;
}

function render(){
  updateHeader();

  // Dashboard: active quests = responsibilities + winners (demo)
  const unlocked = areResponsibilitiesDone();
  const active = [
    ...state.responsibilities.map(r => ({
      ...r,
      desc: unlocked ? r.desc : `${r.desc} (Deblochează bonusurile!)`
    })),
    ...state.winners
  ];

  $("#activeQuests").innerHTML = active.map(x => itemHTML(x, "active")).join("");
  $("#doneQuests").innerHTML = state.completedToday.map(x => itemHTML(x, "done")).join("");

  // Responsibilities view
  $("#responsibilitiesList").innerHTML =
    state.responsibilities.map(x => itemHTML(x, "active")).join("");

  // Winners/Losers lists
  $("#winnersList").innerHTML = state.winners.map(x => itemHTML(x, "active")).join("");
  $("#losersList").innerHTML = state.losers.map(x => itemHTML(x, "active")).join("");

  // Store
  $("#storeList").innerHTML = state.store.map(x => itemHTML(x, "store")).join("");
}

function areResponsibilitiesDone(){
  const doneIds = new Set(state.completedToday.map(x => x.id));
  return state.responsibilities.every(r => doneIds.has(r.id));
}

function gainPoints(delta){
  state.points = Math.max(0, state.points + delta);

  // Level up logic (simplu)
  while (state.points >= state.nextLevelAt){
    state.points -= state.nextLevelAt;
    state.level += 1;
    state.nextLevelAt = Math.round(state.nextLevelAt * 1.15); // crește pragul
  }
}

function completeById(id){
  // caută în responsibilities/winners/losers
  const all = [...state.responsibilities, ...state.winners, ...state.losers];
  const found = all.find(x => x.id === id);
  if (!found) return;

  // nu dubla
  if (state.completedToday.some(x => x.id === id)) return;

  // Winners/responsibilities: + puncte
  // Losers: - puncte (damage)
  gainPoints(found.points);

  state.completedToday.unshift(found);
  render();
}

function buyReward(id){
  const item = state.store.find(x => x.id === id);
  if (!item) return;

  if (state.points < item.cost){
    alert("Nu ai suficiente puncte pentru această recompensă.");
    return;
  }

  state.points -= item.cost;
  alert(`Recompensă cumpărată: ${item.title}`);
  render();
}

// ---------- navigation ----------
function setView(view){
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $$(".view").forEach(v => v.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
}

function setTab(tab){
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  $$(".tab-panel").forEach(p => p.classList.remove("active"));
  $(`#tab-${tab}`).classList.add("active");
}

// ---------- events ----------
document.addEventListener("click", (e) => {
  const nav = e.target.closest(".nav-item");
  if (nav) setView(nav.dataset.view);

  const tab = e.target.closest(".tab");
  if (tab) setTab(tab.dataset.tab);

  const completeBtn = e.target.closest("[data-complete]");
  if (completeBtn) completeById(completeBtn.dataset.complete);

  const buyBtn = e.target.closest("[data-buy]");
  if (buyBtn) buyReward(buyBtn.dataset.buy);
});

$("#btnResetDay").addEventListener("click", () => {
  state.completedToday = [];
  // reset demo points too (opțional)
  state.level = 1;
  state.points = 20;
  state.nextLevelAt = 100;
  render();
});

$("#btnAddCustom").addEventListener("click", () => {
  const title = prompt("Nume misiune (ex: 'Curățenie rapidă'):");
  if (!title) return;
  const pts = Number(prompt("Puncte (ex: 10):")) || 10;
  state.winners.unshift({
    id: `w-custom-${Date.now()}`,
    icon: "✨",
    title,
    desc: "Misiune personalizată.",
    points: pts,
    category: "Custom"
  });
  render();
});

// init
render();

