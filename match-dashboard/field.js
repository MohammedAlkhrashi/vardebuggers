// player view page
export function renderPlayers(containerSelector) {
    const field = document.querySelector(containerSelector);
  
    // players
    const players = [
      { number: 1, name: 'GK A', top: '50%', left: '10%', team: 'team-a' },
      { number: 1, name: 'FW A', top: '30%', left: '30%', team: 'team-a' },
      { number: 1, name: 'FW A2', top: '70%', left: '30%', team: 'team-a' },
      { number: 1, name: 'GK B', top: '50%', left: '90%', team: 'team-b' },
      { number: 1, name: 'FW B', top: '30%', left: '70%', team: 'team-b' },
      { number: 1, name: 'FW B2', top: '70%', left: '70%', team: 'team-b' },
    ];

    // event listener for clicks 
    players.forEach(player => {
        const div = document.createElement('div');
        div.classList.add('player', player.team);
        div.style.top = player.top;
        div.style.left = player.left;
        div.textContent = player.name;
    
        // event listener
        div.addEventListener('click', () => {
          // Reset all players to their team color
          const allPlayers = field.querySelectorAll('.player');
          allPlayers.forEach(p => {
            if (p.classList.contains('team-a')) {
              p.style.backgroundColor = '#007bff'; // team A color
            } else if (p.classList.contains('team-b')) {
              p.style.backgroundColor = '#dc3545'; // team B color
            }
          });
    
          // highlight clicked player
          div.style.backgroundColor = '#fff733';
        //   console.log(`Clicked ${player.name}`);


          showPlayerStats(player);
        });
    
        field.appendChild(div);
    });
}

// once we click on a player we should call this func to show player's stats
export function showPlayerStats(player) {
    const panel = document.querySelector('.stats-container');
    const playerStatsPanel = document.getElementById('playerStatsPanel');
    
    if (!panel || !playerStatsPanel) {
        console.error("Stats container or player stats panel not found!");
        return;
    }

    panel.style.display = 'block'; // Show the stats panel

    if (!player.stats) {
        playerStatsPanel.innerHTML = `<h3>${player.name}</h3><p>No stats available for this player.</p>`;
        return;
      }

    playerStatsPanel.innerHTML = `
    <h3>${player.name} (#${player.number})</h3>
    <ul>
    <li>Passes: ${player.stats.passes.successful} (Successful), ${player.stats.passes.failed} (Failed)</li>
    <li>Tackles: ${player.stats.tackles.successful} (Successful), ${player.stats.tackles.missed} (Missed)</li>
    <li>Key Passes: ${player.stats.keyPasses}</li>
    <li>Pressure Resistance: ${player.stats.pressureResistance}</li>
    </ul>
`;

  // TODO: fix video viewer
  const tbody = document.querySelector('#videoTable tbody');
  tbody.innerHTML = `
    <tr><td>Pass</td><td>12:45</td><td>Success</td><td><a href="#">View</a></td></tr>
    <tr><td>Tackle</td><td>23:10</td><td>Miss</td><td><a href="#">View</a></td></tr>
  `;

//   const tbody = document.querySelector('#videoTable tbody');
//   tbody.innerHTML = ''; // clear old videos

//   data.videos.forEach(clip => {
//     const tr = document.createElement('tr');
//     tr.innerHTML = `
//       <td>${clip.type}</td>
//       <td>${clip.time}</td>
//       <td>${clip.outcome}</td>
//       <td><a href="${clip.clip}" target="_blank">View</a></td>
//     `;
//     tbody.appendChild(tr);
//   });

//   // Enable event filtering
//   setupVideoFilter();
}

function setupVideoFilter() {
  const filter = document.getElementById('eventFilter');
  filter.addEventListener('change', e => {
    const val = e.target.value;
    const rows = document.querySelectorAll('#videoTable tbody tr');
    rows.forEach(row => {
      const type = row.children[0].textContent.toLowerCase();
      row.style.display = (val === 'all' || val === type) ? '' : 'none';
    });
  });
}