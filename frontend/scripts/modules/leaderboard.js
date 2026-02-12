// Leaderboard view module

import { getAllLeaderboards, getLeaderboard, formatDate } from '../storage.js';

const GAME_NAMES = {
  stem2048: 'Fusion 2048',
  missionQuiz: 'Mission Quiz',
  stemTicTacToe: 'Atom vs Electron',
  snakeGame: 'Snake Game'
};

export function mount(root) {
  const container = document.createElement('div');
  container.className = 'leaderboard';
  container.innerHTML = `
    <div class="leaderboard__header">
      <h2 class="leaderboard__title">Leaderboards</h2>
      <p class="leaderboard__subtitle">Top scores across all games</p>
    </div>

    <div class="leaderboard__content" id="leaderboardContent">
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        Loading leaderboards...
      </div>
    </div>
  `;

  root.appendChild(container);

  const content = container.querySelector('#leaderboardContent');

  // Load data asynchronously
  (async () => {
    const allLeaderboards = await getAllLeaderboards();

    // Clear loading message
    content.innerHTML = '';

    // Display leaderboard for each game
    for (const gameId of Object.keys(GAME_NAMES)) {
      const scores = await getLeaderboard(gameId);
      if (scores.length === 0) continue;

      const gameSection = document.createElement('div');
      gameSection.className = 'leaderboard__game-section';
      gameSection.innerHTML = `
        <h3 class="leaderboard__game-title">${GAME_NAMES[gameId]}</h3>
        <div class="leaderboard__table">
          <div class="leaderboard__row leaderboard__row--header">
            <span class="leaderboard__rank">Rank</span>
            <span class="leaderboard__player">Player</span>
            <span class="leaderboard__score">Score</span>
            <span class="leaderboard__date">Date</span>
          </div>
          ${scores.slice(0, 10).map((entry, index) => `
            <div class="leaderboard__row ${index < 3 ? 'leaderboard__row--top' : ''}">
              <span class="leaderboard__rank">
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </span>
              <span class="leaderboard__player">${entry.playerName}</span>
              <span class="leaderboard__score">${entry.score.toLocaleString()}</span>
              <span class="leaderboard__date">${formatDate(entry.date)}</span>
            </div>
          `).join('')}
        </div>
      `;
      content.appendChild(gameSection);
    }

    // If no scores exist
    if (Object.keys(allLeaderboards).length === 0 ||
      Object.values(allLeaderboards).every(scores => scores.length === 0)) {
      content.innerHTML = `
        <div class="leaderboard__empty">
          <div class="leaderboard__empty-icon">📊</div>
          <h3>No scores yet!</h3>
          <p>Play games to see your scores appear here.</p>
        </div>
      `;
    }
  })();

  return {
    destroy() {
      container.remove();
    }
  };
}
