// import { loadVideoData } from './videoRev_tennis.js';

// Tennis match data structure
const tennisData = {
  defaultMatch: {
    title: "Wimbledon 2024 - Alcaraz vs Djokovic", // Gentlemen's Singles Final
    homePlayer: "Carlos Alcaraz",
    awayPlayer: "Novak Djokovic",
    stats: {
      aces: { home: 15, away: 12 },
      doubleFaults: { home: 2, away: 3 },
      firstServePercentage: { home: 68, away: 71 },
      breakPointsConverted: { home: 3, away: 4 },
      winners: { home: 45, away: 42 },
      unforcedErrors: { home: 18, away: 15 }
    },
    summary: {
      sets: { home: 3, away: 2 },
      games: { home: 28, away: 26 },
      points: { home: 156, away: 148 }
    },
    playerPositions: {
      home: { x: 0.25, y: 0.85, name: "Carlos Alcaraz" },
      away: { x: 0.75, y: 0.15, name: "Novak Djokovic" }
    }
  }
};

const matches = {
    recentMatches: [
      {
        result: "L",
        opponent: "Jannik Sinner",
        date: "Jun 30",
        competition: "Queen's Club"
      },
      {
        result: "W",
        opponent: "Daniil Medvedev",
        date: "Jun 20",
        competition: "Roland Garros"
      },
      {
        result: "W",
        opponent: "Stefanos Tsitsipas",
        date: "Jun 10",
        competition: "Italian Open"
      },
      {
        result: "L",
        opponent: "Alexander Zverev",
        date: "May 28",
        competition: "Madrid Open"
      }
    ]
  };

  const matchTableBody = document.querySelector('.match-history tbody');

  matches.recentMatches.forEach(match => {
    const row = document.createElement('tr');

    // Result cell with class
    const resultCell = document.createElement('td');
    resultCell.textContent = match.result;
    resultCell.classList.add(
      match.result === 'W' ? 'win' :
      match.result === 'L' ? 'loss' : 'draw'
    );
    row.appendChild(resultCell);

    // Match vs Opponent
    const opponentCell = document.createElement('td');
    opponentCell.textContent = `vs ${match.opponent}`;
    row.appendChild(opponentCell);

    // Date
    const dateCell = document.createElement('td');
    dateCell.textContent = match.date;
    row.appendChild(dateCell);

    // Competition
    const compCell = document.createElement('td');
    compCell.textContent = match.competition;
    row.appendChild(compCell);

    matchTableBody.appendChild(row);
  });
  

// Function to update tennis match data in the UI
function updateTennisData() {
  const match = tennisData.defaultMatch;

  // Update match title
  const titleElement = document.querySelector('#tennisTournament');
  if (titleElement) {
    titleElement.textContent = match.title;
  }

  // Update statistics
  Object.entries(match.stats).forEach(([stat, values]) => {
    const element = document.querySelector(`.${stat} .stat-value`);
    if (element) {
      const diff = values.home - values.away;
      const trend = diff > 0 ? '▲' : diff < 0 ? '▼' : '–';
      element.innerHTML = `
        <span class="home">${values.home}</span> vs 
        <span class="away">${values.away}</span>
        <span class="trend">${trend}</span>
      `;
    }
  });

  // Update summary
  Object.entries(match.summary).forEach(([key, values]) => {
    const element = document.querySelector(`.${key} .summary-value`);
    if (element) {
      element.textContent = `${values.home} - ${values.away}`;
    }
  });

  // Update tennis court visualization with players
  if (window.court) {
    court.clearCourt();
    court.drawPlayers(match.playerPositions);
  }
}

// Tennis court visualization class
class TennisCourt {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas element with id '${canvasId}' not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Define court colors
    this.colors = {
      court: '#2c5530',      // Dark green for the court
      lines: '#ffffff',      // White for the lines
      serviceLine: '#ffffff', // White for service lines
      net: '#e0e0e0',       // Light grey for the net
      homePlayer: '#E53935', // Red for home player
      awayPlayer: '#1E88E5', // Blue for away player
      hover: '#ffffff'       // White for hover text
    };

    this.resize();

    // Add hover functionality
    this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
    this.canvas.addEventListener('mouseout', () => this.clearHoverText());

    // Add resize listener
    window.addEventListener('resize', () => {
      this.resize();
      if (this.playerPositions) {
        this.drawPlayers(this.playerPositions);
      }
    });
  }

  resize() {
    if (!this.canvas || !this.ctx) return;

    const container = this.canvas.parentElement;
    if (!container) return;

    // Set canvas size with proper tennis court proportions (2.37:1)
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientWidth / 2.37;
    this.drawCourt();
  }

  drawCourt() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas and set background
    ctx.fillStyle = this.colors.court;
    ctx.fillRect(0, 0, w, h);

    // Set line styles
    ctx.strokeStyle = this.colors.lines;
    ctx.lineWidth = 2;

    // Court margins (5% on each side)
    const margin = 0.05;
    const courtWidth = w * (1 - 2 * margin);
    const courtHeight = h * (1 - 2 * margin);
    const startX = w * margin;
    const startY = h * margin;

    // Draw outer court rectangle
    ctx.strokeRect(startX, startY, courtWidth, courtHeight);

    // Draw center service line
    ctx.beginPath();
    ctx.moveTo(w/2, startY);
    ctx.lineTo(w/2, startY + courtHeight);
    ctx.stroke();

    // Service court dimensions
    const serviceWidth = courtWidth * 0.21;
    const serviceHeight = courtHeight * 0.3;

    // Draw service boxes
    // Top service boxes
    ctx.strokeRect(w/2 - serviceWidth, startY, serviceWidth, serviceHeight);
    ctx.strokeRect(w/2, startY, serviceWidth, serviceHeight);
    
    // Bottom service boxes
    ctx.strokeRect(w/2 - serviceWidth, startY + courtHeight - serviceHeight, serviceWidth, serviceHeight);
    ctx.strokeRect(w/2, startY + courtHeight - serviceHeight, serviceWidth, serviceHeight);

    // Draw singles sidelines
    ctx.beginPath();
    const singlesMargin = courtWidth * 0.045; // Singles court is slightly narrower
    ctx.moveTo(startX + singlesMargin, startY);
    ctx.lineTo(startX + singlesMargin, startY + courtHeight);
    ctx.moveTo(w - startX - singlesMargin, startY);
    ctx.lineTo(w - startX - singlesMargin, startY + courtHeight);
    ctx.stroke();

    // Draw net
    ctx.beginPath();
    ctx.strokeStyle = this.colors.net;
    ctx.lineWidth = 3;
    ctx.moveTo(startX, h/2);
    ctx.lineTo(w - startX, h/2);
    ctx.stroke();

    // Draw net posts
    ctx.beginPath();
    ctx.arc(startX, h/2, 3, 0, Math.PI * 2);
    ctx.arc(w - startX, h/2, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.net;
    ctx.fill();

    // Draw center marks
    ctx.beginPath();
    ctx.strokeStyle = this.colors.lines;
    ctx.lineWidth = 2;
    // Top center mark
    ctx.moveTo(w/2 - 5, startY);
    ctx.lineTo(w/2 + 5, startY);
    // Bottom center mark
    ctx.moveTo(w/2 - 5, startY + courtHeight);
    ctx.lineTo(w/2 + 5, startY + courtHeight);
    ctx.stroke();

    // Draw service line center marks
    const serviceLineY1 = startY + serviceHeight;
    const serviceLineY2 = startY + courtHeight - serviceHeight;
    ctx.beginPath();
    ctx.moveTo(w/2 - 5, serviceLineY1);
    ctx.lineTo(w/2 + 5, serviceLineY1);
    ctx.moveTo(w/2 - 5, serviceLineY2);
    ctx.lineTo(w/2 + 5, serviceLineY2);
    ctx.stroke();

    // Add subtle court shading
    this.addCourtShading(startX, startY, courtWidth, courtHeight);
  }

  addCourtShading(startX, startY, width, height) {
    const ctx = this.ctx;
    
    // Create gradient for court surface texture
    const gradient = ctx.createLinearGradient(startX, startY, startX + width, startY + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, width, height);

    // Add subtle cross-hatching
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = startX; x <= startX + width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= startY + height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + width, y);
      ctx.stroke();
    }
  }

  drawPlayers(positions) {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw home player
    const homeX = positions.home.x * w;
    const homeY = positions.home.y * h;
    
    // Player shadow
    ctx.beginPath();
    ctx.arc(homeX, homeY + 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // Player dot
    ctx.beginPath();
    ctx.arc(homeX, homeY, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.homePlayer;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw away player
    const awayX = positions.away.x * w;
    const awayY = positions.away.y * h;
    
    // Player shadow
    ctx.beginPath();
    ctx.arc(awayX, awayY + 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // Player dot
    ctx.beginPath();
    ctx.arc(awayX, awayY, 10, 0, Math.PI * 2);
    ctx.fillStyle = this.colors.awayPlayer;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Store positions for hover detection
    this.playerPositions = positions;
  }

  handleHover(event) {
    if (!this.canvas || !this.ctx || !this.playerPositions) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / this.canvas.width;
    const y = (event.clientY - rect.top) / this.canvas.height;
    
    // Check if mouse is near any player
    const home = this.playerPositions.home;
    const away = this.playerPositions.away;
    
    const distHome = Math.hypot(x - home.x, y - home.y);
    const distAway = Math.hypot(x - away.x, y - away.y);
    
    if (distHome < 0.09) { // Within hover radius
      this.showPlayerName(home.name, event.clientX - rect.left, event.clientY - rect.top);
    } else if (distAway < 0.09) {
      this.showPlayerName(away.name, event.clientX - rect.left, event.clientY - rect.top);
    } else {
      this.clearHoverText();
    }
  }

  showPlayerName(name, x, y) {
    if (!this.canvas || !this.ctx) return;

    // Redraw court to clear previous hover text
    this.drawCourt();
    this.drawPlayers(this.playerPositions);
    
    const ctx = this.ctx;
    ctx.font = 'bold 14px Inter';
    
    // Add background for better readability
    const textWidth = ctx.measureText(name).width;
    const padding = 8;
    const height = 24;
    
    // Draw tooltip background with rounded corners
    ctx.beginPath();
    const radius = 4;
    ctx.roundRect(
      x - textWidth/2 - padding,
      y - height - 10,
      textWidth + padding * 2,
      height,
      radius
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = this.colors.hover;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y - height/2 - 10);
  }

  clearHoverText() {
    if (!this.canvas || !this.ctx) return;

    if (this.playerPositions) {
      this.drawCourt();
      this.drawPlayers(this.playerPositions);
    }
  }

  clearCourt() {
    if (!this.canvas || !this.ctx) return;
    this.drawCourt();
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tennis court with the correct canvas ID
  window.court = new TennisCourt('tennis-court');
  
  // Load the default tennis match
  updateTennisData();
});
