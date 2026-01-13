// Local storage utility for scores, statistics, and achievements

const STORAGE_KEYS = {
  LEADERBOARD: 'stem-kiosk-leaderboard',
  STATISTICS: 'stem-kiosk-statistics',
  ACHIEVEMENTS: 'stem-kiosk-achievements',
};

// Initialize storage structure
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STATISTICS)) {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify({
      totalPlayTime: 0,
      gamesPlayed: 0,
      lastPlayed: null,
      gameStats: {}
    }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify([]));
  }
}

// Leaderboard functions
export function saveScore(gameId, score, playerName = 'Player') {
  initStorage();
  const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD));
  
  if (!leaderboard[gameId]) {
    leaderboard[gameId] = [];
  }
  
  const entry = {
    score,
    playerName,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };
  
  leaderboard[gameId].push(entry);
  // Keep top 50 scores per game
  leaderboard[gameId].sort((a, b) => b.score - a.score);
  leaderboard[gameId] = leaderboard[gameId].slice(0, 50);
  
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  return entry;
}

export function getLeaderboard(gameId) {
  initStorage();
  const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD));
  return leaderboard[gameId] || [];
}

export function getAllLeaderboards() {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD));
}

export function getBestScore(gameId) {
  const scores = getLeaderboard(gameId);
  return scores.length > 0 ? scores[0].score : 0;
}

// Statistics functions
export function updateStatistics(gameId, stats) {
  initStorage();
  const statistics = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATISTICS));
  
  statistics.gamesPlayed += 1;
  statistics.lastPlayed = new Date().toISOString();
  
  if (!statistics.gameStats[gameId]) {
    statistics.gameStats[gameId] = {
      gamesPlayed: 0,
      totalPlayTime: 0,
      bestScore: 0,
      totalScore: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  }
  
  const gameStats = statistics.gameStats[gameId];
  gameStats.gamesPlayed += 1;
  
  if (stats.playTime) {
    statistics.totalPlayTime += stats.playTime;
    gameStats.totalPlayTime += stats.playTime;
  }
  
  if (stats.score !== undefined) {
    gameStats.totalScore += stats.score;
    if (stats.score > gameStats.bestScore) {
      gameStats.bestScore = stats.score;
    }
  }
  
  if (stats.result === 'win') gameStats.wins += 1;
  if (stats.result === 'loss') gameStats.losses += 1;
  if (stats.result === 'draw') gameStats.draws += 1;
  
  localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(statistics));
  return statistics;
}

export function getStatistics() {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATISTICS));
}

export function getGameStatistics(gameId) {
  const stats = getStatistics();
  return stats.gameStats[gameId] || {
    gamesPlayed: 0,
    totalPlayTime: 0,
    bestScore: 0,
    totalScore: 0,
    wins: 0,
    losses: 0,
    draws: 0
  };
}

// Achievement functions
export function unlockAchievement(achievementId, name, description) {
  initStorage();
  const achievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS));
  
  const exists = achievements.find(a => a.id === achievementId);
  if (!exists) {
    achievements.push({
      id: achievementId,
      name,
      description,
      unlockedAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    return true;
  }
  return false;
}

export function getAchievements() {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS));
}

export function hasAchievement(achievementId) {
  const achievements = getAchievements();
  return achievements.some(a => a.id === achievementId);
}

// Format time helper
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Format date helper
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
