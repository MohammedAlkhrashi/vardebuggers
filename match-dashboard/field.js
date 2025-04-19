// player view page
let playerStatsData = {};

fetch('data/playerStats.json')
    .then(response => response.json())
    .then(data => {
        playerStatsData = data;
        console.log("Player data loaded successfully");
    })
    .catch(error => {
        console.error("Error loading player stats data:", error);
    });


export function renderPlayers(containerSelector) {
    const field = document.querySelector(containerSelector);
    const matchSelect = document.getElementById('matchSelect');
  
    // players
    const players = [
      // Team A (left to right)
      { name: 'P. Cech', number: 33, top: '50%', left: '5%', team: 'team-a' },           // GK
      { name: 'H. Bellerin', number: 24, top: '30%', left: '10%', team: 'team-a' },      // DEF
      { name: 'P. Mertesacker (c)', number: 4, top: '40%', left: '15%', team: 'team-a' },
      { name: 'L. Koscielny', number: 6, top: '60%', left: '15%', team: 'team-a' },
      { name: 'N. Monreal', number: 18, top: '70%', left: '10%', team: 'team-a' },
      { name: 'M. Flamini', number: 20, top: '40%', left: '30%', team: 'team-a' },       // MID (Double Pivot)
      { name: 'S. Cazorla', number: 19, top: '60%', left: '30%', team: 'team-a' },
      { name: 'A. Ramsey', number: 16, top: '30%', left: '45%', team: 'team-a' },        // MID (Attacking 3)
      { name: 'M. Özil', number: 11, top: '50%', left: '63%', team: 'team-a' },
      { name: 'A. Sánchez', number: 17, top: '70%', left: '45%', team: 'team-a' },
      { name: 'T. Walcott', number: 14, top: '50%', left: '45%', team: 'team-a' },       // FW
    
      // Team B (right to left) match 1
      { name: 'K. Schmeichel', number: 1, top: '50%', left: '95%', team: 'team-b' },     // GK
      { name: 'R. de Laet', number: 2, top: '30%', left: '90%', team: 'team-b' },        // DEF
      { name: 'R. Huth', number: 6, top: '40%', left: '85%', team: 'team-b' },
      { name: 'W. Morgan', number: 5, top: '60%', left: '85%', team: 'team-b' },
      { name: 'J. Schlupp', number: 15, top: '70%', left: '90%', team: 'team-b' },
      { name: 'R. Mahrez', number: 26, top: '40%', left: '70%', team: 'team-b' },        // MID (Right)
      { name: 'N. Kanté', number: 14, top: '60%', left: '70%', team: 'team-b' },         // MID (Pivot)
      { name: 'D. Drinkwater', number: 4, top: '30%', left: '55%', team: 'team-b' },     // MID (Pivot)
      { name: 'M. Albrighton', number: 11, top: '70%', left: '55%', team: 'team-b' },    // MID (Left)
      { name: 'S. Okazaki', number: 20, top: '50%', left: '55%', team: 'team-b' },       // FW Support
      { name: 'J. Vardy', number: 9, top: '50%', left: '37%', team: 'team-b' },           // FW

      // Team C (right to left) match 2
      { name: 'T. Heaton', number: 1, top: '50%', left: '95%', team: 'team-c' }, // GK
      { name: 'K. Trippier', number: 2, top: '25%', left: '85%', team: 'team-c' },  // DEF
      { name: 'M. Duff', number: 4, top: '40%', left: '85%', team: 'team-c' },
      { name: 'J. Shackell', number: 5, top: '60%', left: '85%', team: 'team-c' },
      { name: 'B. Mee', number: 6, top: '75%', left: '85%', team: 'team-c' },
      { name: 'S. Arfield', number: 37, top: '30%', left: '70%', team: 'team-c' },   // MID
      { name: 'D. Jones', number: 14, top: '50%', left: '70%', team: 'team-c' },
      { name: 'G. Boyd', number: 21, top: '70%', left: '70%', team: 'team-c' },
      { name: 'A. Barnes', number: 30, top: '30%', left: '55%', team: 'team-c' },
      { name: 'D. Ings', number: 10, top: '70%', left: '55%', team: 'team-c' },      // FW
      { name: 'S. Vokes', number: 9, top: '50%', left: '55%', team: 'team-c' }
    ];
  
  // Renders players for selected match
  function renderMatchPlayers(selectedMatch) {
    const panel = document.querySelector('.stats-container');
    panel.style.display = 'none'; // hide entire panel
    // Clear current field
    field.innerHTML = '';

    // Determine teams to show
    let teamsToShow = ['team-a'];
    if (selectedMatch === 'Match 1') {
      teamsToShow.push('team-b');
    } else if (selectedMatch === 'Match 2') {
      teamsToShow.push('team-c');
    }

    // Filter and render players
    players
      .filter(player => teamsToShow.includes(player.team))
      .forEach(player => {
        const div = document.createElement('div');
        div.classList.add('player', player.team);
        div.style.top = player.top;
        div.style.left = player.left;
        div.textContent = player.number;

        div.addEventListener('click', () => {
          const allPlayers = field.querySelectorAll('.player');
          allPlayers.forEach(p => {
            if (p.classList.contains('team-a')) {
              p.style.backgroundColor = '#dc3545';
            } else if (p.classList.contains('team-b')) {
              p.style.backgroundColor = '#007bff';
            } else if (p.classList.contains('team-c')) {
              p.style.backgroundColor = '#6f99a8';
            }
          });

          div.style.backgroundColor = '#a39f2f';
          showPlayerStats(player);
        });

        field.appendChild(div);
      });
  }

  // Initial render
  renderMatchPlayers(matchSelect.value);

  // Change event listener
  matchSelect.addEventListener('change', () => {
    renderMatchPlayers(matchSelect.value);
    const panel = document.querySelector('.stats-container');
    panel.style.display = 'none'; // hide entire panel
  });
  }

export function showPlayerStats(playerId) {
  const panel = document.querySelector('.stats-container');
  const playerStatsPanel = document.getElementById('playerStatsPanel');
  panel.style.display = 'block'; // or 'flex' if you're using flexbox

  
  if (!panel || !playerStatsPanel) {
      console.error("Stats container or player stats panel not found!");
      return;
  }

  panel.style.display = 'block'; // Show the stats panel

  // Check if playerStatsData is available for the given playerId

  const key = `${playerId.number}_${playerId.team}`;
  console.log(playerStatsData[key]);
  
  const playerStats = playerStatsData[key];

  if (!playerStats) {
    playerStatsPanel.innerHTML = `<h3>No stats available for this player.</h3>`;
    return;
}

// Build the stats HTML with improved structure
playerStatsPanel.innerHTML = `
    <div class="player-stats-container">
        <!-- Player Header -->
        <div class="player-header">
            <div class="player-avatar">
                <img src="${playerStats.player_face_url}" alt="${playerStats.short_name}" class="player-image">
            </div>
            <div class="player-info">
                <h3 class="player-name">${playerStats.short_name}</h3>
                <div class="player-position">${playerStats.player_positions}</div>
                <div class="jersey-number"># ${playerStats.club_jersey_number}</div>
            </div>
        </div>

        <!-- Key Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Overall Rating</div>
                <div class="stat-value">${playerStats.overall}</div>
                <div class="stat-progress">
                    <div class="stat-progress-bar" style="width: ${playerStats.overall}%"></div>
                </div>
            </div>
            ${playerStats.player_positions.includes('GK') ? `
                <div class="stat-card">
                    <div class="stat-label">GK Diving</div>
                    <div class="stat-value">${playerStats.goalkeeping_diving}</div>
                    <div class="stat-progress">
                        <div class="stat-progress-bar" style="width: ${playerStats.goalkeeping_diving}%"></div>
                    </div>
                </div>
            ` : `
                <div class="stat-card">
                    <div class="stat-label">Finishing</div>
                    <div class="stat-value">${playerStats.attacking_finishing}</div>
                    <div class="stat-progress">
                        <div class="stat-progress-bar" style="width: ${playerStats.attacking_finishing}%"></div>
                    </div>
                </div>
            `}
            ${playerStats.player_positions.includes('GK') ? `
              <div class="stat-card">
                  <div class="stat-label">GK Handling</div>
                  <div class="stat-value">${playerStats.goalkeeping_handling}</div>
                  <div class="stat-progress">
                      <div class="stat-progress-bar" style="width: ${playerStats.goalkeeping_handling}%"></div>
                  </div>
              </div>
          ` : `
              <div class="stat-card">
                <div class="stat-label">Passing</div>
                <div class="stat-value">${playerStats.passing || 'N/A'}</div>
                <div class="stat-progress">
                    <div class="stat-progress-bar" style="width: ${playerStats.passing || 0}%"></div>
                </div>
              </div>
          `}
          ${playerStats.player_positions.includes('GK') ? `
            <div class="stat-card">
                <div class="stat-label">GK Kicking</div>
                <div class="stat-value">${playerStats.goalkeeping_kicking}</div>
                <div class="stat-progress">
                    <div class="stat-progress-bar" style="width: ${playerStats.goalkeeping_kicking}%"></div>
                </div>
            </div>
        ` : `
            <div class="stat-card">
                <div class="stat-label">Defending</div>
                <div class="stat-value">${playerStats.defending || 'N/A'}</div>
                <div class="stat-progress">
                    <div class="stat-progress-bar" style="width: ${playerStats.defending || 0}%"></div>
                </div>
            </div>
        `}
        </div>

        <!-- Additional Info -->
        <div class="match-performance">
            <h4 class="performance-header">Player Details</h4>
            <div class="performance-grid">
                <div class="performance-stat">
                    <div class="performance-value">${playerStats.age}</div>
                    <div class="performance-label">Age</div>
                </div>
                <div class="performance-stat">
                    <div class="performance-value">${playerStats.preferred_foot}</div>
                    <div class="performance-label">Preferred Foot</div>
                </div>
                ${playerStats.player_positions.includes('GK') ? `
                    <div class="performance-stat">
                        <div class="performance-value">${playerStats.power_stamina || 'N/A'}</div>
                        <div class="performance-label">Stamina</div>
                    </div>
                ` : `
                    <div class="performance-stat">
                        <div class="performance-value">${playerStats.pace || 'N/A'}</div>
                        <div class="performance-label">Pace</div>
                    </div>
                `}
            </div>
        </div>

        <!-- Traits Section -->
        <div class="traits-section">
            <h4 class="traits-header">Player Traits</h4>
            <div class="traits-content">
                ${playerStats.player_traits}
            </div>
        </div>
    </div>
`;
} // stats