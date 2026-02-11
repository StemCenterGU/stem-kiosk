// Statistics dashboard module

import { getStatistics, getGameStatistics, formatTime, formatDate } from '../storage.js';

const GAME_NAMES = {
  stem2048: 'Fusion 2048',
  missionQuiz: 'Mission Quiz',
  stemTicTacToe: 'Atom vs Electron',
  snakeGame: 'Snake Game'
};

export function mount(root) {
  const container = document.createElement('div');
  container.className = 'statistics';
  container.innerHTML = `
    <div class="statistics__header">
      <h2 class="statistics__title">Statistics Dashboard</h2>
      <p class="statistics__subtitle">Your gaming activity and achievements</p>
    </div>
    
    <div class="statistics__content">
      <div class="statistics__overview">
        <div class="statistics__card">
          <div class="statistics__card-icon">⏱️</div>
          <div class="statistics__card-content">
            <span class="statistics__card-label">Total Play Time</span>
            <strong class="statistics__card-value" id="totalPlayTime">0s</strong>
          </div>
        </div>
        <div class="statistics__card">
          <div class="statistics__card-icon">🎮</div>
          <div class="statistics__card-content">
            <span class="statistics__card-label">Games Played</span>
            <strong class="statistics__card-value" id="gamesPlayed">0</strong>
          </div>
        </div>
        <div class="statistics__card">
          <div class="statistics__card-icon">📅</div>
          <div class="statistics__card-content">
            <span class="statistics__card-label">Last Played</span>
            <strong class="statistics__card-value" id="lastPlayed">Never</strong>
          </div>
        </div>
      </div>
      
      <div class="statistics__games" id="gameStats">
        <!-- Game statistics will be populated here -->
      </div>
    </div>
  `;

  root.appendChild(container);

  const stats = getStatistics();
  const totalPlayTimeEl = container.querySelector('#totalPlayTime');
  const gamesPlayedEl = container.querySelector('#gamesPlayed');
  const lastPlayedEl = container.querySelector('#lastPlayed');
  const gameStatsEl = container.querySelector('#gameStats');

  // Update overview
  totalPlayTimeEl.textContent = formatTime(stats.totalPlayTime);
  gamesPlayedEl.textContent = stats.gamesPlayed.toLocaleString();
  lastPlayedEl.textContent = stats.lastPlayed ? formatDate(stats.lastPlayed) : 'Never';

  // Display game-specific statistics
  Object.keys(GAME_NAMES).forEach(gameId => {
    const gameStats = getGameStatistics(gameId);
    if (gameStats.gamesPlayed === 0) return;

    const gameCard = document.createElement('div');
    gameCard.className = 'statistics__game-card';
    gameCard.innerHTML = `
      <h3 class="statistics__game-name">${GAME_NAMES[gameId]}</h3>
      <div class="statistics__game-stats">
        <div class="statistics__stat-item">
          <span class="statistics__stat-label">Games Played</span>
          <span class="statistics__stat-value">${gameStats.gamesPlayed}</span>
        </div>
        <div class="statistics__stat-item">
          <span class="statistics__stat-label">Play Time</span>
          <span class="statistics__stat-value">${formatTime(gameStats.totalPlayTime)}</span>
        </div>
        <div class="statistics__stat-item">
          <span class="statistics__stat-label">Best Score</span>
          <span class="statistics__stat-value">${gameStats.bestScore.toLocaleString()}</span>
        </div>
        ${gameStats.wins > 0 || gameStats.losses > 0 || gameStats.draws > 0 ? `
          <div class="statistics__stat-item">
            <span class="statistics__stat-label">Wins / Losses / Draws</span>
            <span class="statistics__stat-value">${gameStats.wins} / ${gameStats.losses} / ${gameStats.draws}</span>
          </div>
        ` : ''}
        ${gameStats.totalScore > 0 ? `
          <div class="statistics__stat-item">
            <span class="statistics__stat-label">Total Score</span>
            <span class="statistics__stat-value">${gameStats.totalScore.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    `;
    gameStatsEl.appendChild(gameCard);
  });

  // If no statistics
  if (stats.gamesPlayed === 0) {
    gameStatsEl.innerHTML = `
      <div class="statistics__empty">
        <div class="statistics__empty-icon">📈</div>
        <h3>No statistics yet!</h3>
        <p>Start playing games to track your progress.</p>
      </div>
    `;
  }

  return {
    destroy() {
      container.remove();
    }
  };
}
