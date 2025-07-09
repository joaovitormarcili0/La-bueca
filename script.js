let players = [
  { name: "Bruno", position: "Goleiro", present: false, weight: 2 },
  { name: "Flavinho", position: "Goleiro", present: false, weight: 2 },
  { name: "Gaúcho", position: "Defesa", present: false, weight: 3 },
  { name: "Rossi", position: "Defesa", present: false, weight: 3 },
  { name: "Daniel", position: "Defesa", present: false, weight: 2 },
  { name: "Luciano", position: "Defesa", present: false, weight: 2 },
  { name: "João", position: "Defesa", present: false, weight: 1 },
  { name: "Vini", position: "Ataque", present: false, weight: 3 },
  { name: "Biel", position: "Ataque", present: false, weight: 3 },
  { name: "Diego", position: "Ataque", present: false, weight: 2 },
  { name: "Junior", position: "Ataque", present: false, weight: 3 },
  { name: "Jacson", position: "Ataque", present: false, weight: 3 },
  { name: "Jv", position: "Ataque", present: false, weight: 3 },
  { name: "Léo Mariano", position: "Ataque", present: false, weight: 3 },
  { name: "Pedro", position: "Ataque", present: false, weight: 2 },
  { name: "Valdir", position: "Ataque", present: false, weight: 1 }
];

const el = {
  playerList: document.getElementById('playerList'),
  confirmForm: document.getElementById('confirmForm'),
  randomizeBtn: document.getElementById('randomizeBtn'),
  teamWhite: document.getElementById('teamWhite'),
  teamBlack: document.getElementById('teamBlack'),
  addPlayerBtn: document.getElementById('addPlayerBtn'),
  newPlayerName: document.getElementById('newPlayerName'),
  newPlayerPosition: document.getElementById('newPlayerPosition'),
};

function sortPlayersList() {
  const order = { "Goleiro": 1, "Defesa": 2, "Ataque": 3 };
  players.sort((a, b) =>
    order[a.position] !== order[b.position]
      ? order[a.position] - order[b.position]
      : a.name.localeCompare(b.name)
  );
}

function createPlayerListItem(player, idx) {
  if (player.header) {
    const li = document.createElement('li');
    li.style.background = 'transparent';
    li.style.fontWeight = 'bold';
    li.style.color = '#fff';
    li.style.marginTop = '22px';
    li.style.borderLeft = '4px solid #FF273D';
    li.style.paddingLeft = '9px';
    li.style.fontSize = '1.11rem';
    li.textContent = player.position;
    return li;
  }
  const li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox" id="check${idx}" ${player.present ? 'checked' : ''}>
    <label for="check${idx}">
      <strong>${player.name}</strong> - ${player.position}
    </label>
    ${player.removable === true
      ? `<button type="button" class="remove-player-btn" data-idx="${idx}" title="Remover" style="margin-left:auto;background:none;border:none;color:#FF273D;font-weight:bold;font-size:18px;cursor:pointer;">×</button>`
      : ''
    }
  `;
  li.querySelector('input[type="checkbox"]').addEventListener('change', e => {
    players[idx].present = e.target.checked;
  });
  if (player.removable === true) {
    li.querySelector('.remove-player-btn').onclick = function() {
      players.splice(idx, 1);
      renderPlayerList();
    };
  }
  return li;
}

function renderPlayerList() {
  sortPlayersList();
  el.playerList.innerHTML = '';
  const orderedPositions = ['Goleiro', 'Defesa', 'Ataque'];

  let idxGlobal = 0;
  orderedPositions.forEach(position => {
    const group = players
      .map((p, idx) => ({...p, idx}))
      .filter(p => p.position === position);

    if (group.length) {
      el.playerList.appendChild(createPlayerListItem({ header: true, position }, idxGlobal++));
      group.forEach(player =>
        el.playerList.appendChild(createPlayerListItem(player, player.idx))
      );
    }
  });
}

// Adiciona novo atleta (visitante)
el.addPlayerBtn.onclick = function() {
  const name = el.newPlayerName.value.trim();
  const position = el.newPlayerPosition.value;
  if (!name || !position) {
    alert("Preencha o nome e selecione a posição!");
    return;
  }
  const exists = players.some(
    p => p.name.toLowerCase() === name.toLowerCase() && p.position === position
  );
  if (exists) {
    alert("Esse atleta já está na lista!");
    return;
  }
  players.push({ name, position, present: true, removable: true });
  el.newPlayerName.value = '';
  el.newPlayerPosition.value = '';
  renderPlayerList();
};

renderPlayerList();

el.confirmForm.addEventListener('submit', function(e) {
  e.preventDefault();
  renderPlayerList();
});

// --- NOVA LÓGICA DE SEPARAÇÃO ---

function balanceTeamsByTotalWeight(presentPlayers) {
  // Separa por posição
  const positions = ['Goleiro', 'Defesa', 'Ataque'];
  const teamA = [], teamB = [];
  let sumA = 0, sumB = 0;

  positions.forEach(pos => {
    // Filtra por posição e ordena do mais forte ao mais fraco (aleatoriza pesos iguais)
    const group = presentPlayers
      .filter(p => p.position === pos)
      .sort((a, b) => b.weight - a.weight || (Math.random() - 0.5));
    // Alterna entre times, sempre colocando o próximo no time com soma menor
    group.forEach(player => {
      if (sumA <= sumB) {
        teamA.push(player);
        sumA += player.weight;
      } else {
        teamB.push(player);
        sumB += player.weight;
      }
    });
  });

  // Garante diferença máxima de 1 atleta entre os times
  while (Math.abs(teamA.length - teamB.length) > 1) {
    if (teamA.length > teamB.length) {
      let p = teamA.pop();
      teamB.push(p);
      sumB += p.weight;
      sumA -= p.weight;
    } else {
      let p = teamB.pop();
      teamA.push(p);
      sumA += p.weight;
      sumB -= p.weight;
    }
  }

  return [teamA, teamB];
}

// Evento para randomizar times com equilíbrio geral de força
el.randomizeBtn.addEventListener('click', function() {
  const presentes = players.filter(p => p.present);

  if (presentes.length < 2) {
    alert('Selecione pelo menos 2 atletas!');
    return;
  }

  const [teamWhiteArr, teamBlackArr] = balanceTeamsByTotalWeight(presentes);

  el.teamWhite.innerHTML = teamWhiteArr.map(p => `<li>${p.name} - ${p.position}</li>`).join('');
  el.teamBlack.innerHTML = teamBlackArr.map(p => `<li>${p.name} - ${p.position}</li>`).join('');
});
