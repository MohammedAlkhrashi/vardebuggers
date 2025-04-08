import { renderPlayers } from './field.js';

document.addEventListener('DOMContentLoaded', () => {
    renderPlayers('.field');
    let possessionChartInstance; // store chart instance globally

    // Match data for Match 1 and Match 2 (replace these with actual data)
    const matchData = {
      "Match 1": {
        name: "2015-09-26 - Arsenal 5 - 2 Leicester",
        stats: {
          goals: { value: 5, avg: 2.5, trend: 'up' },
          shotsOnGoal: { value: 12, avg: 8.2, trend: 'up' },
          fouls: { value: 12, avg: 15.1, trend: 'down' },
          passAccuracy: { value: 85, avg: 79, trend: 'up' },
        },
        postMatchSummary: {
          possession: [58, 42],
          shots: { home: 12, away: 7 },
          passAccuracy: { home: 85, away: 68 },
          yellowCards: { home: 1, away: 1 },
        },
        lastFiveGames: [{
            result: "W", match: "Tottenham Hotspur 1 - 2 Arsenal",
            date: "Sep 23, 2015", competition: "English Carabao Cup"},
            {result: "L", match: "Chelsea 2 - 0 Arsenal",
            date: "Sep 19, 2015", competition: "English Premier League"},
            {result: "L", match: "Dinamo Zagreb 2 - 1 Arsenal",
            date: "Sep 16, 2015", competition: "UEFA Champions League"},
            {result: "W", match: "Arsenal 2 - 0 Stoke City",
            date: "Sep 12, 2015", competition: "English Premier League"},
            {result: "W", match: "Newcastle United 0 - 1 Arsenal",
            date: "Aug 29, 2015", competition: "English Premier League",
            },
        ],
      },
      "Match 2": {
        name: "2016-01-24 - Arsenal 0 - 1 Chelsea",
        stats: {
          goals: { value: 0, avg: 1.8, trend: 'down' },
          shotsOnGoal: { value: 1, avg: 7.4, trend: 'down' },
          fouls: { value: 14, avg: 12.4, trend: 'up' },
          passAccuracy: { value: 73, avg: 80, trend: 'down' },
        },
        postMatchSummary: {
          possession: [46.6, 53.4],
          shots: { home: 1, away: 6 },
          passAccuracy: { home: 73, away: 77 },
          yellowCards: { home: 1, away: 3 },
        },
        lastFiveGames:[{
              result: "D",match: "Stoke City 0 - 0 Arsenal",
              date: "Jan 17, 2016",competition: "English Premier League" },
            { result: "D",match: "Liverpool 3 - 3 Arsenal",
              date: "Jan 13, 2016",competition: "English Premier League"},
            { result: "W", match: "Arsenal 3 - 1 Sunderland",
              date: "Jan 9, 2016",competition: "English FA Cup"},
            { result: "W", match: "Arsenal 1 - 0 Newcastle United",
              date: "Jan 2, 2016",competition: "English Premier League"},
            { result: "W", match: "Arsenal 2 - 0 AFC Bournemouth",
              date: "Dec 28, 2015",competition: "English Premier League"}
          ],
      }
    };
  
    // Initialize match selection dropdown
    const matchSelect = document.getElementById('matchSelect');
    const matchHistoryTable = document.querySelector('.match-history tbody');
  
    // Update match data based on selected match
    matchSelect.addEventListener('change', function () {
      const selectedMatch = matchSelect.value;
      updateMatchData(matchData[selectedMatch]);
    });

    // Function to calculate the width percentage
    function getWidthPercentage(homeValue, awayValue) {
        const total = homeValue + awayValue;
        return {
        home: (homeValue / total) * 100,
        away: (awayValue / total) * 100
        };
    }

    const possessionCtx = document.getElementById('possessionChart').getContext('2d');
    possessionChartInstance = new Chart(possessionCtx, {
    type: 'doughnut',
    data: {
        labels: ['Home', 'Away'],
        datasets: [{
        data: [50, 50], // default/filler values
        backgroundColor: ['#d22124', '#0767cd'],
        borderWidth: 1
        }]
    },
    options: {
        cutout: '70%',
        plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
            color: '#fff'
            }
        }
        }
    }
    });

    
    // Function to update stats and chart dynamically
    function updateMatchData(data) {
        if (data.name) {
            document.getElementById('matchTitle').textContent = `Team Stats Overview: ${data.name}`;
          }
      // Update stats section
      // Assuming the data object holds the current match stats
        document.querySelector('.stat-value.goal').innerHTML = `${data.stats.goals.value} <small>(Avg: ${data.stats.goals.avg})</small> <span class="arrow">${data.stats.goals.trend === 'up' ? '▲' : '▼'}</span>`;
        document.querySelector('.stat-value.shots').innerHTML = `${data.stats.shotsOnGoal.value} <small>(Avg: ${data.stats.shotsOnGoal.avg})</small> <span class="arrow">${data.stats.shotsOnGoal.trend === 'up' ? '▲' : '▼'}</span>`;
        document.querySelector('.stat-value.fouls').innerHTML = `${data.stats.fouls.value} <small>(Avg: ${data.stats.fouls.avg})</small> <span class="arrow">${data.stats.fouls.trend === 'down' ? '▼' : '▲'}</span>`;
        document.querySelector('.stat-value.pass').innerHTML = `${data.stats.passAccuracy.value}% <small>(Avg: ${data.stats.passAccuracy.avg}%)</small> <span class="arrow">${data.stats.passAccuracy.trend === 'up' ? '▲' : '▼'}</span>`;

        // Update goals
        const goalArrow = document.querySelector('.stat-value.goal .arrow');
        goalArrow.innerHTML = data.stats.goals.trend === 'up' ? '▲' : '▼';
        goalArrow.className = data.stats.goals.trend === 'up' ? 'arrow up-trend' : 'arrow down-trend';

        // Update shots on goal
        const shotsArrow = document.querySelector('.stat-value.shots .arrow');
        shotsArrow.innerHTML = data.stats.shotsOnGoal.trend === 'up' ? '▲' : '▼';
        shotsArrow.className = data.stats.shotsOnGoal.trend === 'up' ? 'arrow up-trend' : 'arrow down-trend';

        // Update fouls
        const foulsArrow = document.querySelector('.stat-value.fouls .arrow');
        foulsArrow.innerHTML = data.stats.fouls.trend === 'down' ? '▼' : '▲';
        foulsArrow.className = data.stats.fouls.trend === 'down' ? 'arrow down-trend' : 'arrow up-trend';

        // Update pass accuracy
        const passArrow = document.querySelector('.stat-value.pass .arrow');
        passArrow.innerHTML = data.stats.passAccuracy.trend === 'up' ? '▲' : '▼';
        passArrow.className = data.stats.passAccuracy.trend === 'up' ? 'arrow up-trend' : 'arrow down-trend';

        // Update bar sections (Possession, Shots, etc.)
        const shotsWidth = getWidthPercentage(data.postMatchSummary.shots.home, data.postMatchSummary.shots.away);
        const passAccuracyWidth = getWidthPercentage(data.postMatchSummary.passAccuracy.home, data.postMatchSummary.passAccuracy.away);
        const yellowCardsWidth = getWidthPercentage(data.postMatchSummary.yellowCards.home, data.postMatchSummary.yellowCards.away);

        // Apply the calculated width percentages to the bars
        document.querySelector('.bar.home').style.width = `${shotsWidth.home}%`;
        document.querySelector('.bar.away').style.width = `${shotsWidth.away}%`;
        document.querySelector('.bar.home.pass').style.width = `${passAccuracyWidth.home}%`;
        document.querySelector('.bar.away.pass').style.width = `${passAccuracyWidth.away}%`;
        document.querySelector('.bar.home.yellow').style.width = `${yellowCardsWidth.home}%`;
        document.querySelector('.bar.away.yellow').style.width = `${yellowCardsWidth.away}%`;

        // Optionally, update the numbers inside the bars
        document.querySelector('.bar.home').textContent = data.postMatchSummary.shots.home;
        document.querySelector('.bar.away').textContent = data.postMatchSummary.shots.away;
        document.querySelector('.bar.home.pass').textContent = `${data.postMatchSummary.passAccuracy.home}%`;
        document.querySelector('.bar.away.pass').textContent = `${data.postMatchSummary.passAccuracy.away}%`;
        document.querySelector('.bar.home.yellow').textContent = data.postMatchSummary.yellowCards.home;
        document.querySelector('.bar.away.yellow').textContent = data.postMatchSummary.yellowCards.away;


        // document.querySelector('.bar.home').style.width = `${data.postMatchSummary.shots.home}`;
        // document.querySelector('.bar.away').style.width = `${data.postMatchSummary.shots.away}`;
  
      // Update Last Five Games Table
      matchHistoryTable.innerHTML = ''; // Clear existing table rows
      data.lastFiveGames.forEach(game => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="${game.result === 'W' ? 'win' : game.result === 'L' ? 'loss' : 'draw'}">${game.result}</td>
          <td>${game.match}</td>
          <td>${game.date}</td>
          <td>${game.competition}</td>
        `;
        matchHistoryTable.appendChild(tr);
      });
  
      // Update Possession Chart data and refresh
        possessionChartInstance.data.datasets[0].data = data.postMatchSummary.possession;
        possessionChartInstance.update();

    }
  
    // Initially load Match 1 data
    updateMatchData(matchData['Match 1']);

    // Switch view logic
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        switchView(viewId);
        });
    });

    // View switcher
    function switchView(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.tab[data-view="${viewId}"]`).classList.add('active');
    }
  });
  