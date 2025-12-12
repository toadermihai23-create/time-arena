/* TimeArena Gamify — FULL GAME ENGINE
   Kid: Nikita (11)
   Local-first (localStorage). */

const STORAGE_KEY = "timearena_state_v2";

const DEFAULT_STATE = {
  userName: "Nikita",

  level: 1,
  points: 0,
  nextLevelAt: 100,

  streak: 0,
  lastDayKey: null,

  baseGrantedDayKey: null, // ca să nu acorde timpul garantat de 2 ori/zi
  wallet: { psMin: 0, ytMin: 0 }, // minutele de azi

  completedToday: [], // ids
  historyToday: [],   // log entries: {ts, type, id, title, delta}

  responsibilities: [
    { id:"r-homework",  title:"Eroul Temelor",     desc:"1h teme + pregătire", category:"Școală", points:25 },
    { id:"r-languages", title:"Maestrul Limbilor", desc:"1h limbi străine",    category:"Școală", points:25 },
    { id:"r-school",    title:"Pregătit de Școală",desc:"La timp + ghiozdan",  category:"Responsabilitate", points:15 }
  ],

  winners: [
    { id:"w-bed",    title:"Gardianul Patului",   desc:"Îți faci patul",                category:"Responsabilitate", points:10 },
    { id:"w-room",   title:"Stăpânul Camerei",    desc:"Curățenie completă",            category:"Responsabilitate", points:20 },
    { id:"w-dishes", title:"Eroul Veselei",       desc:"Speli vasele",                  category:"Responsabilitate", points:15 },

    { id:"w-listen", title:"Ascultătorul Ninja",  desc:"Ești atent când ți se vorbește",category:"Comportament", points:10 },
    { id:"w-truth",  title:"Cavalerul Adevărului",desc:"Spui adevărul",                 category:"Comportament", points:15 },

    { id:"w-read",   title:"Cititorul Curajos",   desc:"20 min citit",                  category:"Școală", points:10 },
    { id:"w-sport",  title:"Legenda Sportului",   desc:"Participi activ",               category:"Sport", points:30 },
    { id:"w-family", title:"Eroul Familiei",      desc:"Timp cu familia",               category:"Familie", points:10 }
  ],

  losers: [
    { id:"l-drama", title:"Drama Mode",       desc:"Victimizare",       category:"Comportament", points:-15 },
    { id:"l-pain",  title:"Mă Doare™",        desc:"Scuză falsă",       category:"Comportament", points:-20 },
    { id:"l-lie",   title:"Umbra Minciunii",  desc:"Minciună",          category:"Comportament", points:-25 },
    { id:"l-avoid", title:"Evitare",          desc:"Evitare task",      category:"Responsabilitate", points:-20 }
  ],

  store: [
    { id:"s-yt20", title:"+20 min YouTube",     cost:40,  give:{ytMin:20} },
    { id:"s-ps20", title:"+20 min PlayStation", cost:50,  give:{psMin:20} },
    { id:"s-movie",title:"Aleg Filmul",         cost:30,  give:{badge:"🎬 Aleg Filmul"} }
  ]
};

function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

function dayKey(d=new Date()){
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const da=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}

function nowTime(){
  const d=new Date();
  return d.toLocaleTimeString("ro-RO", {hour:"2-digit", minute:"2-digit"});
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return deepClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);

    // migrate-ish: ensure required keys exist
    const merged = deepClone(DEFAULT_STATE);
    Object.assign(merged, parsed);
    merged.wallet = Object.assign(deepClone(DEFAULT_STATE.wallet), parsed.wallet || {});
    merged.completedToday = Array.isArray(parsed.completedToday) ? parsed.completedToday : [];
    merged.historyToday   = Array.isArray(parsed.historyToday) ? parsed.historyToday : [];
    return merged;
  }catch(e){
    return deepClone(DEFAULT_STATE);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hardReset(){
  localStorage.removeItem(STORAGE_KEY);
  state = deepClone(DEFAULT_STATE);
  saveState();
  renderAll();
}

let state = loadState();

/* ========= GAME LOGIC ========= */

function startNewDayIfNeeded(){
  const today = dayKey();
  if(state.lastDayKey !== today){
    // finalize streak for previous day (simple rule)
    if(state.lastDayKey){
      const gatesDone = isGatesCompleted();
      // streak only if gates were done (for last stored day)
      // (we can't perfectly know past day gates in this simple model, so we apply for current day start)
      // Better: streak increments when you press "Reset zi" at end of day.
      // We'll keep conservative: no auto increment.
    }
    // reset daily
    state.completedToday = [];
    state.historyToday = [];
    state.wallet = { psMin: 0, ytMin: 0 };
    state.baseGrantedDayKey = null;
    state.lastDayKey = today;
    saveState();
  }
}

function isCompleted(id){
  return state.completedToday.includes(id);
}

function isGatesCompleted(){
  const gateIds = state.responsibilities.map(x=>x.id);
  return gateIds.every(id => state.completedToday.includes(id));
}

function addHistory(type, item, delta){
  state.historyToday.unshift({
    ts: nowTime(),
    type,
    id: item?.id || null,
    title: item?.title || type,
    delta
  });
  // limit to avoid huge storage
  if(state.historyToday.length > 200) state.historyToday.pop();
}

function applyPoints(delta){
  state.points += delta;

  // clamp minimum at 0 (no negative total score)
  if(state.points < 0) state.points = 0;

  // level up loop
  while(state.points >= state.nextLevelAt){
    state.level += 1;
    state.points = state.points - state.nextLevelAt;
    // next threshold grows
    state.nextLevelAt = Math.round(state.nextLevelAt * 1.25 + 25);
    addHistory("LEVEL_UP", {title:`Level Up!`, id:null}, 0);
  }
}

function claimMission(item, type){
  if(isCompleted(item.id)) return toast("Deja completat azi 👀");

  // anti-farming: losers can still be applied once/day; winners/gates once/day.
  state.completedToday.push(item.id);
  applyPoints(item.points);
  addHistory(type, item, item.points);

  saveState();
  renderAll();
}

function undoLast(){
  const last = state.historyToday[0];
  if(!last) return toast("Nimic de dat undo.");

  // remove completion if it was a mission
  if(last.id){
    state.completedToday = state.completedToday.filter(x => x !== last.id);
  }

  // reverse points (note: level reverse not supported — we keep it simple & stable)
  // We'll subtract delta if it was positive, add if negative, but clamp at 0.
  applyPoints(-last.delta);

  state.historyToday.shift();
  saveState();
  renderAll();
  toast("Undo făcut ✅");
}

function grantBaseTime(){
  const today = dayKey();
  if(state.baseGrantedDayKey === today) return toast("Deja acordat azi.");
  state.baseGrantedDayKey = today;
  state.wallet.psMin = Math.max(state.wallet.psMin, 60);
  state.wallet.ytMin = Math.max(state.wallet.ytMin, 40);
  addHistory("BASE_TIME", {title:"Timp garantat acordat"}, 0);
  saveState();
  renderAll();
  toast("Timp garantat: PS 60 + YT 40 ✅");
}

function buyStoreItem(item){
  if(!isGatesCompleted()) return toast("Întâi: Eroul Temelor + Maestrul Limbilor ✅");

  if(state.points < item.cost) return toast("Nu ai destule puncte.");
  state.points -= item.cost;

  if(item.give?.psMin) state.wallet.psMin += item.give.psMin;
  if(item.give?.ytMin) state.wallet.ytMin += item.give.ytMin;

  addHistory("STORE", {id:item.id, title:item.title}, -item.cost);
  saveState();
  renderAll();
  toast("Cumpărat ✅");
}

function resetDayAdmin(){
  // End-of-day streak rule: streak++ if gates completed today
  const gatesDone = isGatesCompleted();
  if(gatesDone) state.streak += 1;
  else state.streak = 0;

  state.completedToday = [];
  state.historyToday = [];
  state.wallet = { psMin: 0, ytMin: 0 };
  state.baseGrantedDayKey = null;

  state.lastDayKey = dayKey();
  saveState();
  renderAll();
  toast(gatesDone ? "Zi resetată — streak +1 🔥" : "Zi resetată — streak 0 😅");
}

/* ========= UI ========= */

function $(id){ return document.getElementById(id); }

function toast(msg){
  // minimal toast
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position:"fixed", left:"50%", bottom:"20px", transform:"translateX(-50%)",
    background:"rgba(0,0,0,.75)", color:"#fff", padding:"10px 14px",
    borderRadius:"14px", border:"1px solid rgba(255,255,255,.15)",
    zIndex:9999, fontWeight:"800"
  });
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}

function missionCard(item, type){
  const isDone = isCompleted(item.id);
  const delta = item.points;
  const sign = delta >= 0 ? "+" : "";
  const badgeClass = delta >= 0 ? "good" : "bad";

  const wrap = document.createElement("div");
  wrap.className = "mission";

  const left = document.createElement("div");
  left.className = "mission-left";
  left.innerHTML = `
    <div class="mission-title">${item.title}</div>
    <div class="mission-desc">${item.desc}</div>
    <div class="badges">
      <span class="badge accent">📌 ${item.category}</span>
      <span class="badge ${badgeClass}">${sign}${delta} XP</span>
      ${type === "RESP" ? `<span class="badge good">🔒 Gate</span>` : ""}
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "mission-actions";
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = isDone ? "Completat ✅" : (delta >= 0 ? "Claim" : "Apply");
  btn.disabled = isDone;
  btn.addEventListener("click", () => claimMission(item, type));
  actions.appendChild(btn);

  wrap.appendChild(left);
  wrap.appendChild(actions);
  return wrap;
}

function renderSidebarNav(){
  document.querySelectorAll(".nav-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.getAttribute("data-view");
      document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
      $(`view-${view}`).classList.add("active");
    });
  });
}

function renderHeader(){
  $("welcomeTitle").textContent = `Salut, ${state.userName} 👑`;
  $("welcomeSub").textContent = `Level ${state.level} • ${state.points} puncte`;
}

function renderStats(){
  $("statLevel").textContent = String(state.level);
  $("statPoints").textContent = String(state.points);
  $("statNext").textContent = String(state.nextLevelAt);
  $("statStreak").textContent = String(state.streak);

  const pct = Math.max(0, Math.min(100, Math.round((state.points / state.nextLevelAt) * 100)));
  $("progressBar").style.width = `${pct}%`;
  $("progressText").textContent = `${state.points} / ${state.nextLevelAt}`;

  $("walletPS").textContent = String(state.wallet.psMin);
  $("walletYT").textContent = String(state.wallet.ytMin);
}

function renderCompletedChips(){
  const holder = $("completedChips");
  holder.innerHTML = "";
  if(state.completedToday.length === 0){
    holder.innerHTML = `<div class="tiny muted">Nimic încă. Începe cu “Eroul Temelor” 😈</div>`;
    return;
  }

  const all = [...state.responsibilities, ...state.winners, ...state.losers];
  state.completedToday
    .map(id => all.find(x=>x.id===id))
    .filter(Boolean)
    .forEach(item=>{
      const chip = document.createElement("div");
      chip.className = "chip " + (item.points >= 0 ? "good" : "bad");
      chip.textContent = `${item.title} (${item.points>=0?"+":""}${item.points})`;
      holder.appendChild(chip);
    });
}

function renderLists(){
  const resp = $("responsibilitiesList");
  const win = $("winnersList");
  const los = $("losersList");
  resp.innerHTML = "";
  win.innerHTML = "";
  los.innerHTML = "";

  state.responsibilities.forEach(i => resp.appendChild(missionCard(i, "RESP")));
  state.winners.forEach(i => win.appendChild(missionCard(i, "WIN")));
  state.losers.forEach(i => los.appendChild(missionCard(i, "LOSE")));
}

function renderStore(){
  const g = $("storeGrid");
  g.innerHTML = "";

  state.store.forEach(item=>{
    const el = document.createElement("div");
    el.className = "store-item";
    el.innerHTML = `
      <div class="store-title">${item.title}</div>
      <div class="store-cost">Cost: <b>${item.cost}</b> puncte</div>
      <div class="tiny muted">${isGatesCompleted() ? "Gate: ✅ OK" : "Gate: 🔒 fă întâi temele + limbile"}</div>
      <div class="store-actions">
        <button class="btn" ${(!isGatesCompleted() || state.points < item.cost) ? "disabled" : ""}>Cumpără</button>
      </div>
    `;
    el.querySelector("button").addEventListener("click", ()=> buyStoreItem(item));
    g.appendChild(el);
  });
}

function renderHistory(){
  const h = $("historyList");
  h.innerHTML = "";

  if(state.historyToday.length === 0){
    h.innerHTML = `<div class="tiny muted">Istoric gol. Orice acțiune apare aici.</div>`;
    return;
  }

  state.historyToday.forEach(x=>{
    const el = document.createElement("div");
    el.className = "log";
    const sign = x.delta >= 0 ? "+" : "";
    const label = x.type === "STORE" ? "🛒" :
                  x.type === "RESP"  ? "🔒" :
                  x.type === "WIN"   ? "🟢" :
                  x.type === "LOSE"  ? "🔴" :
                  x.type === "LEVEL_UP" ? "🏆" :
                  "📌";
    el.innerHTML = `
      <div class="t">${label} ${x.title} <span class="muted">(${x.ts})</span></div>
      <div class="s">Δ ${sign}${x.delta}</div>
    `;
    h.appendChild(el);
  });
}

function collectCategories(){
  const set = new Set(["ALL"]);
  const all = [...state.responsibilities, ...state.winners, ...state.losers];
  all.forEach(x => set.add(x.category));
  return Array.from(set);
}

function renderMissionsView(){
  const filter = $("filterCategory");
  const search = $("searchMissions");
  const host = $("missionsByCategory");

  // fill categories once
  if(filter.options.length <= 1){
    collectCategories().forEach(c=>{
      if(c==="ALL") return;
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      filter.appendChild(opt);
    });
  }

  const doRender = ()=>{
    const cat = filter.value;
    const q = (search.value || "").trim().toLowerCase();

    const all = [
      ...state.responsibilities.map(x=>({ ...x, kind:"RESP" })),
      ...state.winners.map(x=>({ ...x, kind:"WIN" })),
      ...state.losers.map(x=>({ ...x, kind:"LOSE" }))
    ];

    const filtered = all.filter(x=>{
      const okCat = (cat==="ALL") ? true : x.category===cat;
      const okQ = !q ? true : (x.title.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q));
      return okCat && okQ;
    });

    // group by category
    const groups = {};
    filtered.forEach(x=>{
      groups[x.category] = groups[x.category] || [];
      groups[x.category].push(x);
    });

    host.innerHTML = "";
    Object.keys(groups).sort().forEach(catName=>{
      const block = document.createElement("div");
      block.className = "card";
      block.style.marginTop = "12px";
      block.innerHTML = `<div class="card-title">📌 ${catName}</div>`;
      const list = document.createElement("div");
      list.className = "mission-list";

      groups[catName].forEach(item=>{
        list.appendChild(missionCard(item, item.kind));
      });

      block.appendChild(list);
      host.appendChild(block);
    });

    if(filtered.length === 0){
      host.innerHTML = `<div class="tiny muted">Nimic găsit. Încearcă altă categorie / alt cuvânt.</div>`;
    }
  };

  filter.onchange = doRender;
  search.oninput = doRender;
  doRender();
}

function wireButtons(){
  $("btnQuickClaimBase").addEventListener("click", grantBaseTime);
  $("btnUndoLast").addEventListener("click", undoLast);
  $("btnResetDay").addEventListener("click", resetDayAdmin);
  $("btnHardReset").addEventListener("click", ()=>{
    const ok = confirm("Hard reset? Șterge tot progresul.");
    if(ok) hardReset();
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = $("btnInstall");
  btn.style.display = "inline-flex";
  btn.addEventListener("click", async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.style.display = "none";
  }, { once:true });
});

function renderAll(){
  renderHeader();
  renderStats();
  renderCompletedChips();
  renderLists();
  renderStore();
  renderHistory();
}

function init(){
  startNewDayIfNeeded();
  renderSidebarNav();
  wireButtons();
  renderAll();
  renderMissionsView();
}

init();
