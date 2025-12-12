/*****************************************************
 * TimeArena Gamify — FULL GAME LOGIC
 * Kid: Nikita (11 ani)
 *****************************************************/

const state = {
  userName: "Nikita",

  level: 1,
  points: 0,
  nextLevelAt: 100,

  completedToday: [],

  /***********************
   * RESPONSABILITĂȚI
   * (OBLIGATORII)
   ***********************/
  responsibilities: [
    {
      id: "r-homework",
      title: "Eroul Temelor",
      desc: "1h teme + pregătire pentru școală (toate materiile).",
      category: "Școală",
      points: 25,
      type: "winner"
    },
    {
      id: "r-languages",
      title: "Maestrul Limbilor",
      desc: "1h limbi străine (engleză / altă limbă).",
      category: "Școală",
      points: 25,
      type: "winner"
    },
    {
      id: "r-school-ready",
      title: "Pregătit de Școală",
      desc: "Pleacă la timp, ghiozdan pregătit.",
      category: "Responsabilitate",
      points: 15,
      type: "winner"
    }
  ],

  /***********************
   * TIME WINNERS
   ***********************/
  winners: [
    // Responsabilitate & Organizare
    {
      id: "w-bed",
      title: "Gardianul Patului",
      desc: "Îți faci patul dimineața.",
      category: "Responsabilitate",
      points: 10,
      type: "winner"
    },
    {
      id: "w-room",
      title: "Stăpânul Camerei",
      desc: "Curățenie completă în cameră.",
      category: "Responsabilitate",
      points: 20,
      type: "winner"
    },
    {
      id: "w-dishes",
      title: "Eroul Veselei",
      desc: "Speli vasele fără reamintiri.",
      category: "Responsabilitate",
      points: 15,
      type: "winner"
    },

    // Comportament
    {
      id: "w-listen",
      title: "Ascultătorul Ninja",
      desc: "Ești atent când vorbim cu tine.",
      category: "Comportament",
      points: 10,
      type: "winner"
    },
    {
      id: "w-truth",
      title: "Cavalerul Adevărului",
      desc: "Spui adevărul chiar dacă e greu.",
      category: "Comportament",
      points: 15,
      type: "winner"
    },

    // Școală
    {
      id: "w-read",
      title: "Cititorul Curajos",
      desc: "Citești minimum 20 minute.",
      category: "Școală",
      points: 10,
      type: "winner"
    },
    {
      id: "w-study",
      title: "Brain Boost",
      desc: "Repeti o lecție grea 15 minute.",
      category: "Școală",
      points: 10,
      type: "winner"
    },

    // Activități & Sport
    {
      id: "w-sport",
      title: "Legenda Sportului",
      desc: "Participi activ la sport.",
      category: "Sport",
      points: 30,
      type: "winner"
    },
    {
      id: "w-outside",
      title: "Explorer Urban",
      desc: "Ieși afară min. 45 minute.",
      category: "Activități",
      points: 20,
      type: "winner"
    },

    // Familie
    {
      id: "w-family",
      title: "Eroul Familiei",
      desc: "Stai cu familia 15 min, glumești.",
      category: "Familie",
      points: 10,
      type: "winner"
    }
  ],

  /***********************
   * TIME LOSERS
   ***********************/
  losers: [
    {
      id: "l-drama",
      title: "Drama Mode",
      desc: "Victimizare / plâns ca să eviți un task.",
      category: "Comportament",
      points: -15,
      type: "loser"
    },
    {
      id: "l-fakepain",
      title: "Mă Doare™",
      desc: "Folosești durerea ca scuză.",
      category: "Comportament",
      points: -20,
      type: "loser"
    },
    {
      id: "l-lie",
      title: "Umbra Minciunii",
      desc: "Spui ceva neadevărat.",
      category: "Comportament",
      points: -25,
      type: "loser"
    },
    {
      id: "l-avoid",
      title: "Evitare Responsabilitate",
      desc: "Eviți un task important.",
      category: "Responsabilitate",
      points: -20,
      type: "loser"
    },
    {
      id: "l-disrespect",
      title: "Strike de Respect",
      desc: "Vorbit urât / lipsă de respect.",
      category: "Familie",
      points: -20,
      type: "loser"
    }
  ]
};

/*****************************************************
 * HELPERI
 *****************************************************/
const $ = s => document.querySelector(s);

function gainPoints(delta) {
  state.points = Math.max(0, state.points + delta);

  while (state.points >= state.nextLevelAt) {
    state.points -= state.nextLevelAt;
    state.level++;
    state.nextLevelAt = Math.round(state.nextLevelAt * 1.15);
  }
}

function areResponsibilitiesDone() {
  const done = state.completedToday.map(q => q.id);
  return state.responsibilities.every(r => done.includes(r.id));
}

/*****************************************************
 * RENDER UI
 *****************************************************/
function render() {
  $("#welcomeTitle").textContent = `Salut, ${state.userName}! 👋`;
  $("#level").textContent = state.level;
  $("#points").textContent = state.points;
  $("#miniLevel").textContent = state.level;
  $("#miniPoints").textContent = state.points;
  $("#toNext").textContent = state.nextLevelAt - state.points;

  $("#progressBar").style.width =
    Math.min(100, (state.points / state.nextLevelAt) * 100) + "%";

  $("#bonusState").textContent =
    areResponsibilitiesDone() ? "🔓 Deblocat" : "🔒 BlocAT";

  $("#responsibilitiesList").innerHTML =
    state.responsibilities.map(q => questHTML(q)).join("");

  $("#winnersList").innerHTML =
    state.winners.map(q => questHTML(q)).join("");

  $("#losersList").innerHTML =
    state.losers.map(q => questHTML(q, true)).join("");

  $("#doneQuests").innerHTML =
    state.completedToday.length
      ? state.completedToday.map(q => `<div class="quest">✔ ${q.title}</div>`).join("")
      : "<small>Nicio misiune finalizată azi.</small>";
}

/*****************************************************
 * UI COMPONENT
 *****************************************************/
function questHTML(q, isPenalty = false) {
  return `
    <div class="quest">
      <div>
        <b>${q.title}</b><br/>
        <small>${q.desc}</small><br/>
        <small><i>${q.category}</i></small>
      </div>
      <button onclick="completeQuest('${q.id}')">
        ${isPenalty ? "Aplică" : "Finalizează"}
      </button>
    </div>
  `;
}

/*****************************************************
 * ACTIONS
 *****************************************************/
function completeQuest(id) {
  const all = [
    ...state.responsibilities,
    ...state.winners,
    ...state.losers
  ];

  const quest = all.find(q => q.id === id);
  if (!quest) return;

  gainPoints(quest.points);
  state.completedToday.push(quest);
  render();
}

/*****************************************************
 * PARENT: ADD CUSTOM MISSION
 *****************************************************/
$("#btnAddCustom").onclick = () => {
  const pin = prompt("PIN părinte:");
  if (pin !== "1234") return alert("Acces refuzat");

  const title = prompt("Denumire misiune:");
  const desc = prompt("Descriere:");
  const category = prompt("Categorie:");
  const points = Number(prompt("Punctaj (+ câștig / - penalizare):"));

  const task = {
    id: "custom-" + Date.now(),
    title,
    desc,
    category,
    points,
    type: points >= 0 ? "winner" : "loser"
  };

  points >= 0 ? state.winners.push(task) : state.losers.push(task);
  render();
};

/*****************************************************
 * RESET ZI
 *****************************************************/
$("#btnResetDay").onclick = () => {
  state.completedToday = [];
  state.points = 0;
  render();
};

// INIT
render();
