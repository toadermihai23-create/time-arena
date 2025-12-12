const state = {
  userName: "Nikita",
  level: 1,
  points: 0,
  nextLevelAt: 100,
  completedToday: [],

  responsibilities: [
    { id:"r-homework", title:"Teme 1h", desc:"Teme + pregătire școală", points:20 },
    { id:"r-lang", title:"Limbi 1h", desc:"Engleză / altă limbă", points:20 }
  ],

  winners: [
    { id:"w-room", title:"Curăță camera", desc:"Ordine completă", points:20 },
    { id:"w-sport", title:"Sport", desc:"Participare activă", points:30 }
  ],

  losers: [
    { id:"l-drama", title:"Victimizare", desc:"Plâns strategic", points:-15 },
    { id:"l-lie", title:"Minciună", desc:"Neadevăr spus", points:-25 }
  ],

  store: [
    { id:"s-yt", title:"+20 min YouTube", cost:40 },
    { id:"s-ps", title:"+20 min PlayStation", cost:50 }
  ]
};

const $ = s => document.querySelector(s);

function gainPoints(delta){
  state.points = Math.max(0, state.points + delta);
  if(state.points >= state.nextLevelAt){
    state.points = 0;
    state.level++;
  }
}

function render(){
  $("#welcomeTitle").textContent = `Salut, ${state.userName}! 👋`;
  $("#level").textContent = state.level;
  $("#points").textContent = state.points;
  $("#miniLevel").textContent = state.level;
  $("#miniPoints").textContent = state.points;
  $("#toNext").textContent = state.nextLevelAt - state.points;
  $("#progressBar").style.width = (state.points/state.nextLevelAt*100)+"%";

  $("#winnersList").innerHTML =
    state.winners.map(q => questHTML(q)).join("");

  $("#losersList").innerHTML =
    state.losers.map(q => questHTML(q)).join("");

  $("#responsibilitiesList").innerHTML =
    state.responsibilities.map(q => questHTML(q)).join("");

  $("#doneQuests").innerHTML =
    state.completedToday.map(q => `<div class="quest">✔ ${q.title}</div>`).join("");
}

function questHTML(q){
  return `
    <div class="quest">
      <div>
        <b>${q.title}</b><br/>
        <small>${q.desc}</small>
      </div>
      <button onclick="complete('${q.id}')">
        ${q.points>0 ? "Finalizează" : "Aplică"}
      </button>
    </div>
  `;
}

function complete(id){
  const all = [...state.winners, ...state.losers, ...state.responsibilities];
  const q = all.find(x => x.id === id);
  if(!q) return;
  gainPoints(q.points);
  state.completedToday.push(q);
  render();
}

document.getElementById("btnAddCustom").onclick = () => {
  const pin = prompt("PIN părinte:");
  if(pin !== "1234") return alert("Acces refuzat");

  const title = prompt("Denumire misiune:");
  const points = Number(prompt("Punctaj (pozitiv sau negativ):"));
  const task = { id:"c"+Date.now(), title, desc:"Misiune custom", points };

  points >= 0 ? state.winners.push(task) : state.losers.push(task);
  render();
};

document.getElementById("btnResetDay").onclick = () => {
  state.completedToday = [];
  state.points = 0;
  render();
};

render();
